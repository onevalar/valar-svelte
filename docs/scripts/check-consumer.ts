import assert from "node:assert/strict";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";
import {
	copyFileSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { DEFAULT_PRESET_CONFIG, encodePreset } from "@valar/svelte-cli/preset";
import { defaultPreset } from "../src/lib/features/workbench/model.js";

const docs = fileURLToPath(new URL("..", import.meta.url));
const root = path.resolve(docs, "..");
const temp = mkdtempSync(path.join(tmpdir(), "valar-consumer-"));
const app = path.join(temp, "app");
const env = {
	...process.env,
	CI: "true",
	REGISTRY_URL: process.env.REGISTRY_URL ?? "http://127.0.0.1:5186/registry",
};
function run(command: string, args: string[], cwd = app) {
	execFileSync(command, args, { cwd, env, stdio: "inherit", timeout: 120_000 });
}
let server: ReturnType<typeof spawn> | undefined;
try {
	run("pnpm", ["--filter", "@valar/svelte-cli", "pack", "--pack-destination", temp], root);
	run(
		path.join(root, "sv-addons/registry/node_modules/.bin/sv"),
		["create", app, "--types", "ts", "--template", "minimal", "--no-add-ons", "--no-install"],
		temp
	);
	const packagePath = path.join(app, "package.json");
	const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
	for (const dependency of [
		"svelte",
		"@sveltejs/kit",
		"@sveltejs/vite-plugin-svelte",
		"vite",
		"typescript",
		"tailwindcss",
		"@tailwindcss/vite",
	]) {
		pkg.devDependencies[dependency] = JSON.parse(
			readFileSync(path.join(docs, "node_modules", dependency, "package.json"), "utf8")
		).version;
	}
	pkg.devDependencies["bits-ui"] = "2.20.0";
	pkg.devDependencies["@types/node"] = JSON.parse(
		readFileSync(path.join(root, "node_modules/@types/node/package.json"), "utf8")
	).version;
	writeFileSync(packagePath, JSON.stringify(pkg));
	copyFileSync(
		path.join(docs, "e2e/fixtures/pnpm-workspace.yaml"),
		path.join(app, "pnpm-workspace.yaml")
	);
	mkdirSync(path.join(app, "patches"));
	for (const patch of ["bits-ui@2.20.0.patch", "svelte-toolbelt@0.10.6.patch"]) {
		copyFileSync(path.join(root, "patches", patch), path.join(app, "patches", patch));
	}
	writeFileSync(path.join(app, "src/app.css"), '@import "tailwindcss";\n');
	writeFileSync(
		path.join(app, "src/routes/+layout.svelte"),
		'<script>import "../app.css"; let { children } = $props();</script>{@render children()}'
	);
	writeFileSync(
		path.join(app, "vite.config.ts"),
		'import { sveltekit } from "@sveltejs/kit/vite"; import adapter from "@sveltejs/adapter-auto"; import tailwindcss from "@tailwindcss/vite"; import { defineConfig } from "vite"; export default defineConfig({plugins: [tailwindcss(), sveltekit({adapter: adapter()})]});'
	);
	const tarball = path.join(
		temp,
		readdirSync(temp).find((file) => file.endsWith(".tgz"))!
	);
	run("pnpm", ["add", "-D", tarball]);
	const cli = path.join(app, "node_modules/.bin/valar-svelte");
	run(cli, [
		"init",
		"--preset",
		encodePreset(DEFAULT_PRESET_CONFIG),
		"--css",
		"src/app.css",
		"--lib-alias",
		"$lib",
		"--components-alias",
		"$lib/components",
		"--utils-alias",
		"$lib/utils",
		"--hooks-alias",
		"$lib/hooks",
		"--ui-alias",
		"$lib/components/ui",
		"--reinstall",
		"--no-deps-install",
	]);
	run(cli, ["add", "number-field", "tags-input", "stepper", "slider", "--yes"]);
	const workbenchPreset = structuredClone(defaultPreset);
	Object.assign(workbenchPreset.values, {
		"button.height": 58,
		"dialog.closeOnEscape": false,
		"tooltip.delayDuration": 650,
		"tooltip.side": "bottom",
		"accordion.type": "multiple",
	});
	const exportResponse = await fetch(new URL("/api/workbench/export", env.REGISTRY_URL), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(workbenchPreset),
	});
	assert.ok(exportResponse.ok, `workbench export failed: ${await exportResponse.clone().text()}`);
	const presetFile = path.join(app, "valar-preset.json");
	writeFileSync(presetFile, await exportResponse.text());
	// Exercise --cwd path resolution from outside the target app, not only absolute paths.
	run(cli, ["add", "valar-preset.json", "--cwd", app, "--yes", "--overwrite"], temp);
	assert.match(
		JSON.parse(readFileSync(packagePath, "utf8")).devDependencies["@valar/svelte-cli"],
		/^file:/
	);
	writeFileSync(
		path.join(app, "src/routes/+page.svelte"),
		readFileSync(path.join(docs, "e2e/fixtures/consumer.svelte"))
	);
	copyFileSync(
		path.join(docs, "e2e/fixtures/consumer-types.ts"),
		path.join(app, "src/lib/consumer-types.ts")
	);
	writeFileSync(
		path.join(app, "tsconfig.json"),
		JSON.stringify({
			extends: "./.svelte-kit/tsconfig.json",
			compilerOptions: {
				allowJs: true,
				checkJs: true,
				esModuleInterop: true,
				resolveJsonModule: true,
				skipLibCheck: false,
				strict: true,
				moduleResolution: "bundler",
				types: ["node"],
			},
		})
	);
	run("pnpm", ["check"]);
	run("pnpm", ["build"]);
	server = spawn(
		process.execPath,
		[
			path.join(app, "node_modules/vite/bin/vite.js"),
			"preview",
			"--host",
			"127.0.0.1",
			"--port",
			"5199",
			"--strictPort",
		],
		{ cwd: app, env, stdio: "inherit" }
	);
	let ready = false;
	for (let attempt = 0; attempt < 80; attempt++) {
		try {
			ready = (await fetch("http://127.0.0.1:5199")).ok;
		} catch {
			/* Wait for the test server. */
		}
		if (ready) break;
		await new Promise((resolve) => setTimeout(resolve, 250));
	}
	assert.ok(ready, "consumer preview did not start");
	const browser = await chromium.launch({
		executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
		args: [
			"--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4",
		],
	});
	try {
		const page = await browser.newPage();
		await page.goto("http://127.0.0.1:5199", { waitUntil: "networkidle" });
		const amount = page.getByRole("spinbutton", { name: "Amount", exact: true });
		await amount.fill("1.2");
		await page.getByRole("button", { name: "Reset", exact: true }).click();
		await amount.waitFor();
		await page.waitForFunction(
			() => document.querySelector<HTMLInputElement>('[role="spinbutton"]')?.value === "0.3"
		);
		await page.getByRole("button", { name: "Reset", exact: true }).click();
		await page.waitForFunction(
			() => document.querySelector<HTMLInputElement>('[role="spinbutton"]')?.value === "0.3"
		);
		await page.getByRole("textbox", { name: "Tags", exact: true }).fill("Valar");
		await page.getByRole("textbox", { name: "Tags", exact: true }).press("Enter");
		assert.equal(await page.locator("output").textContent(), "");
		await page.getByRole("textbox", { name: "Tags", exact: true }).press("Enter");
		await page.waitForFunction(() =>
			document.querySelector("output")?.textContent?.includes("Valar")
		);
		assert.deepEqual(JSON.parse((await page.locator("output").textContent())!), [
			["amount", "0.3"],
			["tags", "Svelte"],
			["tags", "Valar"],
		]);
		assert.equal(await page.getByRole("slider", { name: "Volume", exact: true }).count(), 1);
		const tunedButton = page.getByRole("button", { name: "Tuned button", exact: true });
		assert.equal(await tunedButton.evaluate((node) => getComputedStyle(node).height), "58px");
		await page.getByRole("button", { name: "Open tuned dialog", exact: true }).click();
		await page.keyboard.press("Escape");
		assert.equal(
			await page.getByRole("dialog").count(),
			1,
			"exported Escape default was not installed"
		);
		await page.getByRole("button", { name: "Close tuned dialog", exact: true }).click();
		await page.getByRole("button", { name: "First tuned section", exact: true }).click();
		await page.getByRole("button", { name: "Second tuned section", exact: true }).click();
		assert.equal(
			await page
				.getByRole("button", { name: "First tuned section", exact: true })
				.getAttribute("aria-expanded"),
			"true"
		);
		assert.equal(
			await page
				.getByRole("button", { name: "Second tuned section", exact: true })
				.getAttribute("aria-expanded"),
			"true"
		);
		assert.equal(await page.evaluate(() => matchMedia("(hover: hover)").matches), true);
		await page.getByRole("button", { name: "Tuned tooltip", exact: true }).hover();
		// This wait tests a real delay boundary: the upstream 0ms default must fail here.
		await page.waitForTimeout(200);
		const tooltip = page.locator('[data-slot="tooltip-content"]');
		assert.equal(await tooltip.count(), 0, "exported tooltip delay was not installed");
		await tooltip.waitFor();
		assert.equal(await tooltip.getAttribute("data-side"), "bottom");
		assert.equal(
			await page
				.getByRole("button", { name: "Tuned tooltip", exact: true })
				.getAttribute("aria-describedby"),
			await tooltip.getAttribute("id")
		);
		console.log(
			"PASS independent tarball install, strict check/build, reset/tag/Slider contracts and installed workbench CSS/Dialog/Accordion/Tooltip defaults"
		);
	} finally {
		await browser.close();
	}
} finally {
	if (server && server.exitCode === null) {
		const exited = new Promise((resolve) => server!.once("exit", resolve));
		server.kill("SIGTERM");
		await exited;
	}
	rmSync(temp, { recursive: true, force: true });
}
