/**
 * Rewrites cross-page anchor links in Chinese docs so they point at the translated headings.
 *
 * English anchors and Chinese anchors are generated from heading text, so the only stable
 * mapping between them is heading order. Structure parity (same headings, same order) is
 * enforced by `check-i18n.ts`.
 *
 * Usage: tsx scripts/i18n/fix-anchors.ts [--check]
 */
import fs from "node:fs";
import path from "node:path";

type TocItem = { title: string; url: string; items?: TocItem[] };

type Doc = {
	path: string;
	locale: "en" | "zh";
	toc: TocItem[];
};

const DOCS_DIR = path.resolve(process.cwd(), ".velite");
const ZH_DIR = path.resolve(process.cwd(), "content/zh");

function flattenToc(items: TocItem[], out: string[] = []): string[] {
	for (const item of items) {
		out.push(item.url.replace(/^#/, ""));
		if (item.items?.length) flattenToc(item.items, out);
	}
	return out;
}

function loadDocs(): Map<string, string[]> {
	const docs = new Map<string, string[]>();

	for (const file of fs.readdirSync(DOCS_DIR)) {
		if (!file.endsWith(".json") || file === "index.d.ts") continue;
		const entries = JSON.parse(fs.readFileSync(path.join(DOCS_DIR, file), "utf8")) as Doc[];
		if (!Array.isArray(entries)) continue;

		for (const doc of entries) {
			if (!doc.toc) continue;
			docs.set(`${doc.locale}:${doc.path}`, flattenToc(doc.toc));
		}
	}

	return docs;
}

function docPathFromFile(file: string): string {
	const relative = path.relative(ZH_DIR, file).split(path.sep).join("/");
	return relative.replace(/\.md$/, "").replace(/\/index$/, "");
}

function buildAnchorMap(
	docs: Map<string, string[]>,
	targetPath: string
): Map<string, string> | null {
	const en = docs.get(`en:${targetPath}`);
	const zh = docs.get(`zh:${targetPath}`);
	if (!en || !zh || en.length !== zh.length) return null;

	const map = new Map<string, string>();
	en.forEach((anchor, index) => map.set(anchor, zh[index]));
	return map;
}

function walk(dir: string, out: string[] = []): string[] {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) walk(full, out);
		else if (entry.name.endsWith(".md")) out.push(full);
	}
	return out;
}

const docs = loadDocs();
const checkOnly = process.argv.includes("--check");
let changedFiles = 0;
let changedLinks = 0;

for (const file of walk(ZH_DIR)) {
	const sourcePath = docPathFromFile(file);
	let source = fs.readFileSync(file, "utf8");
	let updated = source;

	updated = updated.replace(
		/\]\((#[^)\s]+|\/docs\/[^)\s#]+#[^)\s]+)\)/g,
		(full, target: string) => {
			const hashIndex = target.indexOf("#");
			const rawAnchor = target.slice(hashIndex + 1);
			const anchor = decodeURIComponent(rawAnchor);

			let map: Map<string, string> | null = null;
			let prefix = "";

			if (target.startsWith("#")) {
				map = buildAnchorMap(docs, sourcePath);
			} else {
				const linkPath = target.slice(0, hashIndex);
				const normalized = linkPath.replace(/^\/docs\/?/, "").replace(/\/$/, "");
				prefix = linkPath;
				map = buildAnchorMap(docs, normalized);
			}

			const translated = map?.get(anchor);
			if (!translated || translated === anchor) return full;

			changedLinks++;
			return `](${target.startsWith("#") ? `#${translated}` : `${prefix}#${translated}`})`;
		}
	);

	if (updated !== source) {
		changedFiles++;
		if (!checkOnly) fs.writeFileSync(file, updated);
	} else {
		source = updated;
	}
}

console.log(
	`${checkOnly ? "Found" : "Rewrote"} ${changedLinks} anchor links in ${changedFiles} Chinese files.`
);
