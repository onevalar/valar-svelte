import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import {
	applyTokenUtilities,
	injectStyleClasses,
	mergeStyleMaps,
	parseStyleCss,
} from "@valar/svelte-parity/inject-style-classes";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, type Plugin } from "vite";
import packageJson from "./package.json" with { type: "json" };
import {
	applyStyleOverrides,
	styleOverridePath,
	styleOverridePayloadSchema,
} from "./src/lib/features/workbench/style-overrides.js";
import {
	serializeTokenOverrides,
	TOKEN_OVERRIDE_PATH,
	tokenOverrideFileSchema,
	tokenOverridePayloadSchema,
} from "./src/lib/features/workbench/token-overrides.js";

// NOTE: the registry (`static/registry`, `src/__registry__`) is intentionally NOT built here.
// Building it during config load costs ~15s on every server (re)start, and importing the
// build script from the config makes every source file it touches a "config dependency"
// that restarts the whole dev server on change. Run `pnpm build:registry` (done by
// `pnpm sync` / `pnpm build`) or `pnpm dev`, which runs `dev:registry` in watch mode.

const __dirname = fileURLToPath(new URL(".", import.meta.url));
export const veliteDirPath = path.join(__dirname, ".velite");
export const staticDirPath = path.join(__dirname, "src/registry/json");
export const contentDirPath = path.join(__dirname, "content");
export const ogDirPath = path.join(__dirname, "src/routes/og");

/**
 * Serve docs examples and blocks with *flattened* UI components, with the `cn-*` classes already
 * replaced by the docs style's utilities, instead of the raw `src/lib/registry/ui` source.
 *
 * The raw components lean on the stylesheet (loaded in the `base` layer, e.g. `cn-*` classes) to finish their
 * styling. A stylesheet rule can never beat a tailwind utility that the component sets itself (e.g.
 * `sm:min-h-8` from the stylesheet loses to `min-h-11` that's defined on the component). Users never hit this
 * because the CLI resolves those classes at install time. This gives the docs the same output.
 *
 * The flattening occurs in memory. A docs-side import of a UI component resolves to the same
 * file with a `?flattened=<style>` query, which `load` serves with the classes injected. Keeping
 * the real path in the id means Vite groups it with the raw module, so editing a component
 * hot-updates both variants, and relative imports inside the component keep working.
 *
 * The Tailwind plugin only scans files on disk for class candidates, so the injected utilities need to
 * exist somewhere scannable. Fortunately, the flattened sources are written to disk via the published registry
 * in `static/registry`, which _is_ tracked by Tailwind.
 *
 * The `/create` and `/preview` routes switch styles with CSS and keep using the raw source.
 *
 * A preview opts into a non-default style with a `style-*` class on `previewClassName`.
 * The component preprocessor imports that example as `?flattened=<style>`, and this plugin
 * carries that query onto the UI modules it renders — including local `.svelte` helpers
 * those examples import, so they share one flattened module instance.
 */
function flattenedRegistry(): Plugin {
	// Keep in sync with the style loaded by `app.css` and set on `<body>` in `app.html`.
	const DEFAULT_STYLE = "nova";
	const QUERY = "flattened";
	const rawUiDir = path.join(__dirname, "src/lib/registry/ui");
	const stylesDir = path.join(__dirname, "src/lib/registry/styles");
	const flattenedImporters = [
		path.join(__dirname, "src/lib/registry/examples"),
		path.join(__dirname, "src/lib/registry/blocks"),
		path.join(__dirname, "content"),
	];
	const rawImporters = [path.join(__dirname, "src/lib/registry/examples/create")];
	const TEXT_EXTENSIONS = new Set([".svelte", ".ts", ".js"]);

	const within = (file: string, dirs: string[]) =>
		dirs.some((dir) => file === dir || file.startsWith(dir + path.sep));
	const splitId = (id: string) => {
		const [file, query] = id.split("?", 2);
		return { file: path.normalize(file!), params: new URLSearchParams(query ?? "") };
	};
	const isFlattened = (id: string) => splitId(id).params.has(QUERY);
	const withQuery = (id: string, style: string) => {
		const { file, params } = splitId(id);
		params.set(QUERY, style);
		return `${file}?${params}`;
	};
	const styleOf = (importer: string) => {
		if (isFlattened(importer)) return splitId(importer).params.get(QUERY) ?? DEFAULT_STYLE;
		const file = splitId(importer).file;
		if (within(file, rawImporters)) return null;
		if (within(file, flattenedImporters)) return DEFAULT_STYLE;
		return null;
	};

	const styleMaps = new Map<string, Record<string, string>>();
	let writing = false;
	const getStyleMap = (style: string) => {
		let map = styleMaps.get(style);
		if (!map) {
			map = mergeStyleMaps(
				parseStyleCss(fs.readFileSync(path.join(stylesDir, `style-${style}.css`), "utf8")),
				parseStyleCss(fs.readFileSync(path.join(stylesDir, "valar", `style-${style}.css`), "utf8"))
			);
			styleMaps.set(style, map);
		}
		return map;
	};

	return {
		name: "shadcn-svelte:flattened-registry",
		enforce: "pre",
		async resolveId(source, importer, options) {
			if (!importer) return null;
			// The dependency scanner loads what it resolves straight from disk, where the queried id
			// doesn't exist. It only looks for bare imports, which are the same in both variants.
			if ((options as { scan?: boolean }).scan) return null;
			// Note: Vite passes `scan: true` here ^^ at runtime but only types it on the internal plugin
			// container's options, not on the public hook signature.
			// A `style-*` class on the preview imports the example as `?flattened=<style>`.
			// That request wins over the importer's default (nova) style.
			const requested = isFlattened(source)
				? (splitId(source).params.get(QUERY) ?? DEFAULT_STYLE)
				: null;
			const style = requested ?? styleOf(importer);
			if (!style) return null;
			const importerIsFlattened = isFlattened(importer);
			const importerFile = splitId(importer).file;
			// Resolve the bare file. `this.resolve` does not understand `?flattened=`, and
			// a flattened importer's id is not a real path.
			const resolved = await this.resolve(
				requested ? splitId(source).file : source,
				importerIsFlattened ? importerFile : importer,
				{ skipSelf: true }
			);
			if (!resolved || resolved.external || isFlattened(resolved.id)) return resolved;
			const file = splitId(resolved.id).file;
			const isUi = within(file, [rawUiDir]);
			// Local helpers imported by an already-styled module need the same query, or
			// their UI imports resolve to a different flattened instance (split context).
			// `fileURLToPath` of the config directory keeps a trailing slash, so resolve it.
			const docsRoot = path.resolve(__dirname);
			const isLocalHelper =
				importerIsFlattened &&
				path.extname(file) === ".svelte" &&
				file.startsWith(docsRoot + path.sep) &&
				!file.includes(`${path.sep}node_modules${path.sep}`);
			if (!isUi && !requested && !isLocalHelper) return resolved;
			return { ...resolved, id: withQuery(resolved.id, style) };
		},
		load(id) {
			if (!isFlattened(id)) return null;
			const { file, params } = splitId(id);
			const content = fs.readFileSync(file, "utf8");
			// The query also marks example and helper modules so their UI imports share
			// one style. Only registry UI source has `cn-*` tokens to inline.
			if (!within(file, [rawUiDir]) || !TEXT_EXTENSIONS.has(path.extname(file))) return content;
			return applyTokenUtilities(
				injectStyleClasses(content, getStyleMap(params.get(QUERY) ?? DEFAULT_STYLE))
			);
		},
		/**
		 * Dev-only: Button docs and `/themes` "写回组件库" write Valar's override files and rebuild the
		 * registry so docs, `static/registry` and CLI installs all use the new classes. Never
		 * present in `vite build` / `vite preview`, so the deployed site cannot write files.
		 */
		configureServer(server) {
			const rebuildRegistry = () =>
				new Promise<void>((resolve, reject) =>
					execFile(
						"pnpm",
						["exec", "tsx", "scripts/build-registry.ts", "build-registry"],
						{ cwd: __dirname, timeout: 120_000 },
						(error) => (error ? reject(error) : resolve())
					)
				);
			/**
			 * Shared guard for the dev-only write endpoints: same-origin JSON POST, one write at a
			 * time, schema-validated body. `write` returns the file it changed and its old content;
			 * if the registry rebuild fails the file is restored so source and registry stay consistent.
			 */
			const writeEndpoint = <T>(
				route: string,
				schema: { safeParse(value: unknown): { success: true; data: T } | { success: false } },
				write: (data: T) => { target: string; previous: string; next: string } | string
			) =>
				server.middlewares.use(route, (req, res) => {
					const reply = (status: number, body: object) => {
						res.statusCode = status;
						res.setHeader("content-type", "application/json");
						res.end(JSON.stringify(body));
					};
					if (req.method !== "POST") return reply(405, { error: "仅支持 POST" });
					// JSON content-type forces a CORS preflight, which other origins cannot pass.
					if (!req.headers["content-type"]?.startsWith("application/json"))
						return reply(415, { error: "需要 JSON" });
					if (req.headers["sec-fetch-site"] && req.headers["sec-fetch-site"] !== "same-origin")
						return reply(403, { error: "仅允许本站页面写回" });
					if (writing) return reply(409, { error: "上一次写回尚未完成" });
					let raw = "";
					req.on("data", (chunk) => {
						raw += chunk;
						if (raw.length > 20_000) req.destroy();
					});
					req.on("end", async () => {
						const parsed = schema.safeParse(
							(() => {
								try {
									return JSON.parse(raw);
								} catch {
									return undefined;
								}
							})()
						);
						if (!parsed.success) return reply(400, { error: "参数无效，未写入任何文件" });
						writing = true;
						try {
							const result = write(parsed.data);
							if (typeof result === "string") return reply(400, { error: result });
							fs.writeFileSync(result.target, result.next);
							try {
								await rebuildRegistry();
							} catch (error) {
								fs.writeFileSync(result.target, result.previous);
								throw error;
							}
							styleMaps.clear();
							for (const env of [server.environments.client, server.environments.ssr])
								for (const mod of env.moduleGraph.idToModuleMap.values())
									if (mod.id && isFlattened(mod.id)) env.moduleGraph.invalidateModule(mod);
							reply(200, {
								file: `docs/${path.relative(__dirname, result.target)}`,
								content: result.next,
							});
						} catch (error) {
							reply(500, {
								error: `写回失败，文件已恢复：${error instanceof Error ? error.message : error}`,
							});
						} finally {
							writing = false;
						}
					});
				});

			writeEndpoint("/__valar/style-overrides", styleOverridePayloadSchema, (data) => {
				if (!fs.existsSync(path.join(stylesDir, `style-${data.style}.css`)))
					return `不存在样式 ${data.style}`;
				const target = path.join(__dirname, styleOverridePath(data.style));
				const previous = fs.readFileSync(target, "utf8");
				return { target, previous, next: applyStyleOverrides(previous, data) };
			});

			// `/themes` "写回组件库": replaces one base theme's entry in `styles/valar/tokens.json`.
			writeEndpoint(
				"/__valar/token-overrides",
				tokenOverridePayloadSchema,
				({ base, override }) => {
					const target = path.join(__dirname, TOKEN_OVERRIDE_PATH);
					const previous = fs.readFileSync(target, "utf8");
					const file = tokenOverrideFileSchema.parse(JSON.parse(previous));
					return { target, previous, next: serializeTokenOverrides({ ...file, [base]: override }) };
				}
			);
		},
		hotUpdate({ file }) {
			const normalized = path.normalize(file);
			if (!normalized.startsWith(stylesDir + path.sep) || !normalized.endsWith(".css")) return;
			styleMaps.clear();
			// During a write-back the page reloads itself once the registry rebuild is done.
			if (writing) return [];
			for (const mod of this.environment.moduleGraph.idToModuleMap.values()) {
				if (mod.id && isFlattened(mod.id)) this.environment.moduleGraph.invalidateModule(mod);
			}
			this.environment.hot.send({ type: "full-reload" });
			return [];
		},
	};
}

export default defineConfig({
	resolve: {
		// Use the browser implementation everywhere so SSR/Workers bundles avoid the Node
		// `canvas` server build (main → lib/server) and so `qrcode` can be inlined into
		// the Cloudflare worker instead of remaining a bare external import.
		alias: {
			qrcode: "qrcode/lib/browser.js",
		},
	},
	plugins: [
		!process.env.CI && visualizer({ emitFile: true, filename: "stats.html" }),
		flattenedRegistry(),
		tailwindcss(),
		enhancedImages(),
		sveltekit(),
	],
	server: {
		// Exact hosts for this orb's docs and Button portals; keep host validation enabled.
		allowedHosts: [
			"t-03h5f29rtolc7tkv2akz2xj95-p21410.onamp.dev",
			"t-03h5f29rtolc7tkv2akz2xj95-p26160.onamp.dev",
		],
		fs: {
			allow: [veliteDirPath, staticDirPath, contentDirPath, ogDirPath],
		},
	},
	build: {
		// minify: false,
		rolldownOptions: {
			output: {
				codeSplitting: {
					groups: [
						{
							test: /node_modules\/@lucide\/svelte/,
							name: "lucide-icons",
						},
						{
							test: /node_modules\/@tabler\/icons-svelte/,
							name: "tabler-icons",
						},
						{
							test: /node_modules\/@hugeicons\/svelte/,
							name: "hugeicons",
						},
						{
							test: /node_modules\/@hugeicons\/core-free-icons/,
							name: "hugeicons-core-free-icons",
						},
						{
							test: /node_modules\/phosphor-svelte/,
							name: "phosphor-icons",
						},
						{
							test: /node_modules\/remixicon-svelte/,
							name: "remixicon-icons",
						},
					],
				},
			},
		},
	},
	ssr: {
		// The workbench exporter uses PostCSS at runtime. Its ESM entry wraps CJS;
		// prebundle that boundary for dev SSR while keeping production Workers self-contained.
		optimizeDeps: { include: ["postcss"] },
		noExternal: Object.keys(packageJson.devDependencies),
	},
});
