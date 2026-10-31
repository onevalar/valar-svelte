import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { expect } from "vitest";
import { setupTest } from "./setup/suite.js";
import addon from "../src/index.js";

const browser = false;

const { test, testCases } = setupTest(
	{ addon },
	{
		kinds: [
			{
				type: "default",
				options: { [addon.id]: { demo: true } },
			},
		],
		filter: (testCase) => testCase.variant.includes("kit") && testCase.variant.includes("ts"),
		browser,
		preAdd: ({ cwd }) => {
			const filename = path.join(cwd, "package.json");
			const pkg = JSON.parse(fs.readFileSync(filename, "utf8"));
			pkg.devDependencies["@valar/svelte-cli"] =
				`file:${fileURLToPath(new URL("../../../packages/cli", import.meta.url))}`;
			fs.writeFileSync(filename, JSON.stringify(pkg));
		},
	}
);

test.concurrent.for(testCases)("registry-template $kind.type $variant", async (testCase, ctx) => {
	const cwd = ctx.cwd(testCase);

	const utilsPath = path.resolve(cwd, "src/lib/utils.ts");
	expect(fs.existsSync(utilsPath)).toBe(true);
	expect(fs.readFileSync(utilsPath, "utf8")).toContain('from "cn"');

	const registryPath = path.resolve(cwd, "registry.json");
	expect(fs.existsSync(registryPath)).toBe(true);
	const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
	expect(registry.$schema).toBe("http://127.0.0.1:5186/schema/registry.json");
	expect(registry.items.length).toBeGreaterThan(0);

	const pokemonLib = registry.items
		.find((item: { name: string }) => item.name === "complex-component")
		?.files.find((file: { path: string }) => file.path.includes("pokemon."));
	expect(pokemonLib?.path.endsWith(".ts")).toBe(true);

	const helloWorld = path.resolve(cwd, "src/lib/registry/blocks/hello-world/hello-world.svelte");
	expect(fs.readFileSync(helloWorld, "utf8")).toContain("Hello world");

	const button = path.resolve(cwd, "src/lib/registry/ui/button/button.svelte");
	expect(fs.readFileSync(button, "utf8")).toContain('lang="ts"');

	const pkg = JSON.parse(fs.readFileSync(path.resolve(cwd, "package.json"), "utf8"));
	expect(pkg.scripts?.["build:registry"]).toBe("valar-svelte registry build");
	expect(
		pkg.devDependencies?.["@valar/svelte-cli"] || pkg.dependencies?.["@valar/svelte-cli"]
	).toBeTruthy();
	expect(
		pkg.devDependencies?.["tw-animate-css"] || pkg.dependencies?.["tw-animate-css"]
	).toBeTruthy();
	expect(pkg.devDependencies?.zod || pkg.dependencies?.zod).toBeTruthy();

	const stylesheetCandidates = [
		path.resolve(cwd, "src/routes/layout.css"),
		path.resolve(cwd, "src/app.css"),
	];
	const stylesheet = stylesheetCandidates.find((candidate) => fs.existsSync(candidate));
	expect(stylesheet).toBeTruthy();
	const css = fs.readFileSync(stylesheet!, "utf8");
	expect(css).toContain("tw-animate-css");
	expect(css).toContain("--color-sidebar-ring");

	const page = fs.readFileSync(
		path.resolve(cwd, "src/routes/demo/shadcn-svelte-registry/+page.svelte"),
		"utf8"
	);
	expect(page).toContain("Custom Registry");
	expect(page).toContain("HelloWorld");

	// Build from outside the consumer: --cwd must also govern registry source paths.
	execFileSync(path.join(cwd, "node_modules/.bin/valar-svelte"), [
		"registry",
		"build",
		"--cwd",
		cwd,
	]);
	const built = JSON.parse(fs.readFileSync(path.join(cwd, "static/r/hello-world.json"), "utf8"));
	expect(
		built.files.some((file: { content: string }) => file.content.includes("Hello world"))
	).toBe(true);
});
