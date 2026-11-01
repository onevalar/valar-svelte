// @ts-check
import { defineCollection, defineConfig, s } from "velite";

const dateSchema = s.union([s.string(), s.date()]).transform((date) => {
	/** @param {Date} value */
	function formatDate(value) {
		const year = value.getUTCFullYear();
		const month = String(value.getUTCMonth() + 1).padStart(2, "0");
		const day = String(value.getUTCDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}

	if (date instanceof Date) {
		return formatDate(date);
	}

	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		throw new Error(`Invalid date "${date}". Expected YYYY-MM-DD.`);
	}

	const parsedDate = new Date(`${date}T00:00:00Z`);
	if (Number.isNaN(parsedDate.getTime()) || formatDate(parsedDate) !== date) {
		throw new Error(`Invalid date "${date}". Expected a valid YYYY-MM-DD date.`);
	}

	return date;
});

const docSchema = s
	.object({
		title: s.string(),
		description: s.string(),
		date: dateSchema.optional(),
		path: s.path(),
		navLabel: s.string().optional(),
		links: s
			.object({
				doc: s.string().optional(),
				api: s.string().optional(),
				source: s.string().optional(),
			})
			.optional(),
		component: s.boolean().default(false),
		toc: s.toc(),
	})
	.transform((data) => {
		// Chinese documents live under `content/zh` with the same relative structure as the
		// English originals, so a single collection can serve both locales.
		const isChinese = data.path === "zh" || data.path.startsWith("zh/");
		let path = isChinese ? data.path.slice(3) : data.path;
		// Velite normalizes `zh/index.md` to `zh`, so the Chinese home doc needs its path back.
		if (path === "") path = "index";

		return {
			...data,
			/** @type {"en" | "zh"} */
			locale: isChinese ? "zh" : "en",
			path,
			slug: path.split("/").slice(1).join("/"),
			slugFull: `/${path}`,
		};
	});

/** @param {string} dir */
function patterns(dir) {
	return [`./${dir}/**/*.md`, `./zh/${dir}/**/*.md`];
}

const gettingStarted = defineCollection({
	name: "gettingStarted",
	pattern: ["./*.md", "./zh/*.md"],
	schema: docSchema,
});

const migration = defineCollection({
	name: "migration",
	pattern: patterns("migration"),
	schema: docSchema,
});

const components = defineCollection({
	name: "components",
	pattern: patterns("components"),
	schema: docSchema,
});

const installation = defineCollection({
	name: "installation",
	pattern: patterns("installation"),
	schema: docSchema,
});

const darkMode = defineCollection({
	name: "darkMode",
	pattern: patterns("dark-mode"),
	schema: docSchema,
});

const registry = defineCollection({
	name: "registry",
	pattern: patterns("registry"),
	schema: docSchema,
});

const forms = defineCollection({
	name: "forms",
	pattern: patterns("forms"),
	schema: docSchema,
});

const utils = defineCollection({
	name: "utils",
	pattern: patterns("utils"),
	schema: docSchema,
});

const aiElements = defineCollection({
	name: "aiElements",
	pattern: patterns("ai-elements"),
	schema: docSchema,
});

const changelog = defineCollection({
	name: "changelog",
	pattern: patterns("changelog"),
	schema: docSchema,
});

export default defineConfig({
	root: "./content",
	collections: {
		gettingStarted,
		migration,
		components,
		installation,
		darkMode,
		registry,
		forms,
		utils,
		aiElements,
		changelog,
	},
	// `velite --clean` removes this output.assets directory, which is the whole `static` folder.
	// Always run plain `velite` (as `pnpm build:content` does); never add `--clean` here.
	output: { assets: "static" },
});
