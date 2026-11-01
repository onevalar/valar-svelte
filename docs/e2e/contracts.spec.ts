import { execFileSync } from "node:child_process";
import { test, expect, devices } from "@playwright/test";

test("Slider names belong to focusable thumbs and keyboard values still change", async ({
	page,
}) => {
	await page.goto("/docs/components/slider", { waitUntil: "networkidle" });
	const volume = page.getByRole("slider", { name: "Volume", exact: true });
	await expect(volume).toHaveAttribute("aria-valuenow", "75");
	await volume.focus();
	await page.keyboard.press("ArrowRight");
	await expect(volume).toHaveAttribute("aria-valuenow", "76");
	for (const name of [
		"Minimum",
		"Maximum",
		"First level",
		"Second level",
		"Third level",
		"Minimum temperature",
		"Maximum temperature",
	]) {
		await expect(page.getByRole("slider", { name, exact: true })).toHaveCount(1);
	}
});

test("native number reset and nonempty/empty tag Enter preserve form contracts", async ({
	page,
}) => {
	await page.goto("/docs/components/number-field", { waitUntil: "networkidle" });
	const amount = page.getByRole("spinbutton", { name: "金额 / Amount（必填）" });
	const form = page.locator("form").filter({ has: amount });
	await amount.fill("1.234,56 €");
	await form.getByRole("button", { name: "提交", exact: true }).click();
	await expect(form.locator("output")).toHaveText('{"amount":"1234.56"}');
	await form.getByRole("button", { name: "重置", exact: true }).click();
	await expect(amount).toHaveValue("");
	await page.goto("/docs/components/tags-input", { waitUntil: "networkidle" });
	const input = page.getByRole("textbox", { name: "主题（1–3 项，每项至少 2 字）" });
	const tagsForm = page.locator("form").filter({ has: input });
	await input.fill("Svelte");
	await input.press("Enter");
	await expect(tagsForm.locator("output")).toHaveText("尚未提交");
	await input.press("Enter");
	await expect(tagsForm.locator("output")).toHaveText('["Svelte"]');
});

test("Stepper rejects, retries and cancels obsolete forward navigation", async ({ page }) => {
	await page.goto("/docs/components/stepper", { waitUntil: "networkidle" });
	const flow = page.getByRole("group", { name: "异步失败与重试", exact: true });
	await flow.getByRole("button", { name: "下一步 / 重试", exact: true }).click();
	await expect(flow.locator('[aria-current="step"]')).toContainText("异步校验");
	await flow.getByRole("button", { name: "下一步 / 重试", exact: true }).click();
	await expect(flow.getByRole("button", { name: "校验中…", exact: true })).toBeDisabled();
	await flow.getByRole("button", { name: "上一步", exact: true }).click();
	await page.waitForTimeout(1400); // Longer than the public demo's pending validation.
	await expect(flow.locator('[aria-current="step"]')).toContainText("准备");
	await flow.getByRole("button", { name: "下一步 / 重试", exact: true }).click();
	await flow.getByRole("button", { name: "下一步 / 重试", exact: true }).click();
	await expect(flow.getByRole("alert")).toContainText("首次校验失败");
	await flow.getByRole("button", { name: "下一步 / 重试", exact: true }).click();
	await expect(flow.locator('[aria-current="step"]')).toContainText("完成");
	await expect(flow.locator('[data-slot="stepper-content"]:visible')).toBeFocused();
});

test("full-text search loads on demand, retries failures and shares an in-flight load", async ({
	page,
}) => {
	let requests = 0;
	let release!: () => void;
	const pending = new Promise<void>((resolve) => {
		release = resolve;
	});
	await page.route("**/api/search.json", async (route) => {
		requests++;
		if (requests === 1) return route.fulfill({ status: 503, body: "Unavailable" });
		await pending;
		await route.continue();
	});
	await page.goto("/docs/components/slider", { waitUntil: "networkidle" });
	const volume = page.getByRole("slider", { name: "Volume", exact: true });
	await volume.focus();
	await volume.press("ArrowRight");
	await expect(volume).toHaveAttribute("aria-valuenow", "76");
	expect(requests).toBe(0);
	const open = page.getByRole("button", { name: "Search documentation", exact: true });
	const query = page.getByRole("combobox");
	await open.click();
	await query.fill("upstream-source-manifest");
	await expect(page.getByRole("status")).toContainText("Full-text search unavailable");
	await query.fill("Stepper");
	await expect(page.getByRole("option", { name: "Stepper", exact: true })).toBeVisible();
	await page.keyboard.press("Escape");
	await open.click();
	await query.fill("upstream-source-manifest");
	await expect(page.getByRole("status")).toHaveText("Loading documentation search…");
	await page.keyboard.press("Escape");
	await open.click();
	await query.fill("upstream-source-manifest");
	expect(requests).toBe(2);
	release();
	const results = page.locator('[data-slot="command-group"]').filter({ hasText: "Search Results" });
	await expect(results.getByRole("option").first()).toBeVisible();
	await page.keyboard.press("Escape");
	await open.click();
	await query.fill("upstream-source-manifest");
	await expect(results.getByRole("option").first()).toBeVisible();
	expect(requests).toBe(2);
});

test.describe("phone layout and touch navigation", () => {
	test.use({
		viewport: devices["Pixel 7"].viewport,
		userAgent: devices["Pixel 7"].userAgent,
		isMobile: true,
		hasTouch: true,
		deviceScaleFactor: 2,
	});
	// Keep every route/width assertion, but don't monopolize one CI worker with
	// all 24 navigations before the remaining independent contracts can run.
	for (const width of [320, 390, 768]) {
		test(`shared docs layouts fit a ${width}px screen`, async ({ page }) => {
			test.setTimeout(120_000);
			await page.setViewportSize({ width, height: 740 });
			for (const route of [
				"slider",
				"dialog",
				"number-field",
				"tags-input",
				"stepper",
				"slider-field",
				"color-picker",
				"data-table",
			]) {
				await page.goto(`/docs/components/${route}`, { waitUntil: "networkidle" });
				await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
				expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
					width + 1
				);
			}
		});
	}
	test("touch navigation and search survive a reduced viewport", async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto("/docs/components/data-table", { waitUntil: "networkidle" });
		await page.getByRole("button", { name: "Toggle menu Menu", exact: true }).tap();
		const link = page.getByRole("link", { name: "Formsnap", exact: true });
		const href = await link.getAttribute("href");
		await link.scrollIntoViewIfNeeded();
		await link.tap();
		await page.waitForURL(`**${href}`);
		await expect(
			page.getByRole("button", { name: "Toggle menu Menu", exact: true })
		).toHaveAttribute("aria-expanded", "false");
		await page.getByRole("button", { name: "Search documentation", exact: true }).tap();
		await page.getByRole("combobox").fill("Stepper");
		await expect(page.getByRole("option", { name: "Stepper", exact: true })).toBeVisible();
		await page.setViewportSize({ width: 390, height: 360 });
		await expect
			.poll(() => page.getByRole("dialog").evaluate((el) => el.getBoundingClientRect().bottom))
			.toBeLessThanOrEqual(360);
		await page.getByRole("button", { name: "关闭", exact: true }).tap();
		await expect(page.getByRole("dialog")).toHaveCount(0);
	});
});

test("local CLI tarball installs into an independent, checked and built consumer", async ({
	baseURL,
}) => {
	test.setTimeout(240_000);
	execFileSync("pnpm", ["test:consumer"], {
		cwd: process.cwd(),
		env: { ...process.env, REGISTRY_URL: `${baseURL}/registry` },
		stdio: "inherit",
	});
});

test("homepage promotes only components, tokens and docs and fits one desktop screen", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/", { waitUntil: "networkidle" });
	const nav = page.locator("header nav").first();
	await expect(nav.getByRole("link")).toHaveText(["Components", "Design tokens", "Docs"]);
	await expect(page.getByRole("link", { name: "New" })).toHaveCount(0);
	for (const name of ["全局 token", "组件", "调参"])
		await expect(page.getByRole("heading", { level: 2, name, exact: true })).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThan(1300);
});
