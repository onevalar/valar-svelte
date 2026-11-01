/**
 * Creates the `.md` exports behind the "Copy Page" / "View as Markdown" actions.
 *
 * English pages are written as empty placeholders here and filled in by `build-llms.ts`
 * after the prerendered HTML exists. Chinese pages are not part of the English llms bundle,
 * so they are converted to plain Markdown from the source files directly.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { globby } from "globby";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Strips Svelte-only markup from a Chinese document while keeping prose and code blocks. */
function toPlainMarkdown(source: string): string {
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
	const frontmatter = match?.[1] ?? "";
	const body = match?.[2] ?? source;

	// Split on fenced code blocks so their contents are never treated as markup.
	const segments = body.split(/(^```[\s\S]*?^```$)/m);

	const cleaned = segments
		.map((segment) => {
			if (segment.startsWith("```")) return segment;

			// Protect inline code so `<Table />` inside backticks survives tag stripping.
			const inlineCode: string[] = [];
			const withPlaceholders = segment.replace(/`[^`\n]+`/g, (match) => {
				inlineCode.push(match);
				return `\u0000${inlineCode.length - 1}\u0000`;
			});

			return withPlaceholders
				.replace(/<script[\s\S]*?<\/script>/gi, "")
				.replace(/<ComponentPreview\b[\s\S]*?<\/ComponentPreview>/gi, "")
				.replace(/<ComponentSource\b[^>]*\/>/gi, "")
				.replace(/<[^>]+>/g, "")
				.replace(/^\s*\{#(if|snippet|each|key)[^\n]*$/gm, "")
				.replace(/^\s*\{\/(if|snippet|each|key)[^\n]*$/gm, "")
				.replace(/^\s*\{:else[^\n]*$/gm, "")
				.replace(/[ \t]+$/gm, "")
				.replace(/\n{3,}/g, "\n\n")
				.replace(/\u0000(\d+)\u0000/g, (_, index: string) => inlineCode[Number(index)] ?? "");
		})
		.join("")
		.replace(/\n{3,}/g, "\n\n")
		.trim();

	return `---\n${frontmatter}\n---\n\n${cleaned}\n`;
}

async function main() {
	try {
		const files = await globby(["content/**/*.md"]);
		const english = files.filter((file) => !file.startsWith("content/zh/"));

		for (const filePath of english) {
			const newPath = filePath.replace("content/", "docs/");
			const outputPath = join(
				__dirname,
				"../static",
				newPath.endsWith("/index.md") ? newPath.replace("/index.md", ".md") : newPath
			);
			await mkdir(dirname(outputPath), { recursive: true });
			await writeFile(outputPath, "\n", "utf-8");
		}

		for (const filePath of files.filter((file) => file.startsWith("content/zh/"))) {
			// Chinese docs are served from /zh/docs, so their Markdown exports mirror that path.
			const newPath = `zh/docs/${filePath.replace("content/zh/", "")}`;
			const outputPath = join(
				__dirname,
				"../static",
				newPath.endsWith("/index.md") ? newPath.replace("/index.md", ".md") : newPath
			);
			await mkdir(dirname(outputPath), { recursive: true });
			await writeFile(outputPath, toPlainMarkdown(await readFile(filePath, "utf-8")), "utf-8");
		}

		for (const name of ["llms.txt", "llms-small.txt", "llms-full.txt"])
			await writeFile(join(__dirname, "../static", name), "\n", "utf-8");
	} catch (error) {
		console.error("Error building LLM placeholder files:", error);
	}
}

main();
