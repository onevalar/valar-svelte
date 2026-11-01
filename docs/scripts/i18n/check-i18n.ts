/**
 * Verifies that every Chinese document mirrors its English source.
 *
 * Compares frontmatter keys, heading count, fenced code blocks and component preview names.
 * Run after translating content: `tsx scripts/i18n/check-i18n.ts`
 */
import fs from "node:fs";
import path from "node:path";

const EN_DIR = path.resolve(process.cwd(), "content");
const ZH_DIR = path.join(EN_DIR, "zh");

function walk(dir: string, out: string[] = []): string[] {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) walk(full, out);
		else if (entry.name.endsWith(".md")) out.push(full);
	}
	return out;
}

function frontmatterKeys(source: string): string | null {
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) return null;
	return match[1]
		.split(/\n(?=\S)/)
		.map((line) => line.split(":")[0].trim())
		.join(",");
}

const count = (source: string, regex: RegExp) => (source.match(regex) ?? []).length;

const problems: string[] = [];
const pairs = walk(ZH_DIR).map((file) => path.relative(ZH_DIR, file));
const missingEnglish: string[] = [];
const missingChinese = walk(EN_DIR)
	.filter((file) => !file.startsWith(ZH_DIR + path.sep))
	.map((file) => path.relative(EN_DIR, file))
	.filter((relative) => !fs.existsSync(path.join(ZH_DIR, relative)));

for (const relative of missingChinese) {
	problems.push(`missing Chinese translation: ${relative}`);
}

for (const relative of pairs) {
	const english = path.join(EN_DIR, relative);
	const chinese = path.join(ZH_DIR, relative);

	if (!fs.existsSync(english)) {
		missingEnglish.push(relative);
		continue;
	}

	const en = fs.readFileSync(english, "utf8");
	const zh = fs.readFileSync(chinese, "utf8");

	if (frontmatterKeys(en) !== frontmatterKeys(zh)) {
		problems.push(`frontmatter keys differ: ${relative}`);
	}

	const enHeadings = count(en, /^#{2,6} .+$/gm);
	const zhHeadings = count(zh, /^#{2,6} .+$/gm);
	if (enHeadings !== zhHeadings) {
		problems.push(`heading count ${zhHeadings}/${enHeadings}: ${relative}`);
	}

	const enFences = count(en, /^```/gm);
	const zhFences = count(zh, /^```/gm);
	if (enFences !== zhFences) {
		problems.push(`code fence count ${zhFences}/${enFences}: ${relative}`);
	}

	const previews = (source: string) =>
		[...source.matchAll(/<ComponentPreview\s+name="([^"]+)"/g)]
			.map((match) => match[1])
			.sort()
			.join(",");

	if (previews(en) !== previews(zh)) {
		problems.push(`component previews differ: ${relative}`);
	}
}

if (missingEnglish.length) {
	console.error(`Missing English source for ${missingEnglish.length} Chinese file(s):`);
	for (const file of missingEnglish) console.error(`  content/${file}`);
}

if (problems.length) {
	console.error(`\n${problems.length} structural problem(s):`);
	for (const problem of problems) console.error(`  ${problem}`);
}

if (problems.length || missingEnglish.length) process.exit(1);

console.log(`OK: ${pairs.length} Chinese documents match their English sources.`);
