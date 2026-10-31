import { test, expect, devices, type Page } from "@playwright/test";

async function setNumber(page: Page, label: string, value: number) {
	const control = page.getByRole("slider", { name: label, exact: true });
	await control.scrollIntoViewIfNeeded();
	await control.press("Enter");
	const input = page.getByRole("textbox", { name: `${label} value`, exact: true });
	await input.fill(String(value));
	await input.press("Enter");
}

test("designer edits, saves, restores, undoes and roundtrips a real installable preset", async ({
	page,
}) => {
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/workbench", { waitUntil: "networkidle" });
	const canvas = page.frameLocator('iframe[title="真实组件画布"]');
	const primary = canvas.getByRole("button", { name: "主要操作", exact: true });
	await setNumber(page, "全局圆角（px）", 22);
	await expect(primary).toHaveCSS("border-radius", "22px");
	await setNumber(page, "高度（px）", 58);
	await expect(primary).toHaveCSS("height", "58px");
	await expect(canvas.getByRole("button", { name: "次要操作", exact: true })).not.toHaveCSS(
		"background-color",
		"rgb(109, 40, 217)"
	);
	await page.getByRole("button", { name: "撤销", exact: true }).click();
	await expect(primary).toHaveCSS("height", "40px");
	await page.getByRole("button", { name: "重做", exact: true }).click();
	await expect(primary).toHaveCSS("height", "58px");
	await page.getByRole("textbox", { name: "版本名称", exact: true }).fill("设计师测试版");
	await page.getByRole("button", { name: "保存版本", exact: true }).click();
	await page.reload({ waitUntil: "networkidle" });
	await expect(primary).toHaveCSS("height", "58px");
	// A preview can remount after its parent has already sent a draft.
	await page
		.locator("iframe")
		.evaluate((frame: HTMLIFrameElement) => frame.contentWindow!.location.reload());
	await expect(primary).toHaveCSS("height", "58px");
	await setNumber(page, "高度（px）", 44);
	await page.getByRole("combobox", { name: "已存版本", exact: true }).selectOption("设计师测试版");
	await expect(primary).toHaveCSS("height", "58px");
	const download = page.waitForEvent("download");
	await page.getByRole("button", { name: "导出可安装预设", exact: true }).click();
	const file = await download;
	expect(file.suggestedFilename()).toBe("valar-preset.json");
	await page.getByRole("button", { name: "重置全部", exact: true }).click();
	await expect(primary).toHaveCSS("height", "40px");
	await page.getByLabel("导入预设文件", { exact: true }).setInputFiles((await file.path())!);
	await expect(primary).toHaveCSS("height", "58px");
	await expect(primary).toHaveCSS("border-radius", "22px");
	await page.getByLabel("导入预设文件", { exact: true }).setInputFiles({
		name: "bad.json",
		mimeType: "application/json",
		buffer: Buffer.from('{"version":999}'),
	});
	await expect(page.getByRole("status")).toContainText("导入失败");
	await expect(primary).toHaveCSS("height", "58px");
	const invalid = await page.request.post("/api/workbench/export", { data: { version: 999 } });
	expect(invalid.status()).toBe(400);
	expect(errors).toEqual([]);
});

test("dialog and accordion controls change actual behavior; reduced motion takes precedence", async ({
	page,
}) => {
	await page.goto("/workbench", { waitUntil: "networkidle" });
	const canvas = page.frameLocator('iframe[title="真实组件画布"]');
	await page.getByRole("button", { name: "对话框 dialog", exact: true }).click();
	await setNumber(page, "面板宽度（px）", 552);
	await canvas.getByRole("button", { name: "打开对话框", exact: true }).click();
	const dialog = canvas.getByRole("dialog");
	await expect(dialog).toBeVisible();
	await expect(dialog).toHaveCSS("width", "552px");
	await expect(dialog).toHaveCSS("animation-duration", "0.18s");
	await page.emulateMedia({ reducedMotion: "reduce" });
	await expect(dialog).toHaveCSS("animation-name", "none");
	await canvas.getByRole("button", { name: "完成并关闭", exact: true }).click();
	await expect(canvas.getByRole("button", { name: "打开对话框", exact: true })).toBeFocused();
	await page.getByRole("button", { name: "折叠面板 accordion", exact: true }).click();
	await canvas.getByRole("button", { name: "外观与尺寸", exact: true }).click();
	await canvas.getByRole("button", { name: "动效与节奏", exact: true }).click();
	await expect(canvas.getByRole("button", { name: "外观与尺寸", exact: true })).toHaveAttribute(
		"aria-expanded",
		"false"
	);
});

test.describe("touch workbench", () => {
	test.use({
		viewport: devices["Pixel 7"].viewport,
		userAgent: devices["Pixel 7"].userAgent,
		isMobile: true,
		hasTouch: true,
		deviceScaleFactor: 2,
	});
	test("preview and parameter tabs fit a phone and edits persist across tabs", async ({ page }) => {
		await page.goto("/workbench", { waitUntil: "networkidle" });
		expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(true);
		for (const width of [320, 390, 768]) {
			await page.setViewportSize({ width, height: 844 });
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
				width
			);
		}
		await page.setViewportSize({ width: 390, height: 844 });
		await page.getByRole("button", { name: /^参数调节 · / }).tap();
		await setNumber(page, "高度（px）", 52);
		await page.getByRole("button", { name: "真实预览", exact: true }).tap();
		await expect(
			page.frameLocator("iframe").getByRole("button", { name: "主要操作", exact: true })
		).toHaveCSS("height", "52px");
	});
});

test("Button editor tunes every variant full screen, compares and restores versions", async ({
	page,
}) => {
	test.setTimeout(90_000);
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/button", { waitUntil: "networkidle" });
	const tuner = page.getByRole("region", { name: "Button 样式微调", exact: true });
	const pageSample = tuner.locator('[data-tuning-current] [data-size="default"]').first();
	const editor = page.getByRole("dialog", { name: "Button · 组件参数" });
	const cell = (pane: string, variant: string, size: string) =>
		editor.locator(`[data-tuning-${pane}] [data-variant="${variant}"][data-size="${size}"]`);
	const openButton = tuner.getByRole("button", { name: "微调 Button", exact: true });
	await expect(page.getByTestId("button-dials")).toHaveCount(0);
	await expect(pageSample).toHaveCSS("height", "32px");
	await openButton.click();
	await expect(editor).toBeVisible();
	// DialKit is embedded in the editor, not floating over the page.
	await expect(editor.getByTestId("button-dials")).toBeVisible();
	for (const [label, value] of [
		["特小 · 高度（px）", "24"],
		["小 · 高度（px）", "28"],
		["默认 · 高度（px）", "32"],
		["默认 · 横向内边距（px）", "10"],
		["大 · 高度（px）", "36"],
	])
		await expect(editor.getByRole("slider", { name: label, exact: true })).toHaveAttribute(
			"aria-valuenow",
			value
		);
	await expect(editor.getByRole("button", { name: "圆角档位 lg · 1 × 基数" })).toBeVisible();
	// Global tokens are read-only and point to the token page.
	await expect(editor.getByText("--radius", { exact: true })).toBeVisible();
	await expect(editor.getByRole("link", { name: "全局主题页" })).toHaveAttribute("href", "/themes");
	// Production preview never offers file writes.
	await expect(editor.getByRole("button", { name: "写回组件库…" })).toHaveCount(0);
	await expect(editor.getByText("写回只在本地开发站")).toBeVisible();

	await setNumber(page, "默认 · 高度（px）", 44);
	await setNumber(page, "默认 · 横向内边距（px）", 16);
	await expect(editor.getByText("已修改 2 项", { exact: true })).toBeVisible();
	// Every variant of the default size follows, plus the matching icon button.
	for (const variant of ["default", "outline", "secondary", "ghost", "destructive"]) {
		await expect(cell("current", variant, "default")).toHaveCSS("height", "44px");
		await expect(cell("current", variant, "default")).toHaveCSS("padding-left", "16px");
	}
	await expect(cell("current", "outline", "icon")).toHaveCSS("width", "44px");
	await expect(cell("current", "default", "sm")).toHaveCSS("height", "28px");
	await editor.getByRole("radio", { name: "并排对比" }).click();
	await expect(cell("before", "default", "default")).toHaveCSS("height", "32px");
	await editor.getByRole("textbox", { name: "Button 版本名称" }).fill("宽松 v1");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「宽松 v1」");
	await setNumber(page, "默认 · 高度（px）", 52);
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("名称已存在");
	await editor.getByRole("textbox", { name: "Button 版本名称" }).fill("宽松 v2");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await editor
		.getByRole("combobox", { name: "Button 对比版本" })
		.selectOption({ label: "宽松 v1" });
	await expect(cell("before", "default", "default")).toHaveCSS("height", "44px");
	await expect(cell("current", "default", "default")).toHaveCSS("height", "52px");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();
	// The page sample shows the selected saved version (v2 after saving).
	await expect(pageSample).toHaveCSS("height", "52px");
	await page.reload({ waitUntil: "networkidle" });
	await expect(pageSample).toHaveCSS("height", "32px");
	await tuner.getByRole("combobox", { name: "Button 使用版本" }).selectOption({ label: "宽松 v1" });
	await expect(pageSample).toHaveCSS("height", "44px");
	await openButton.click();
	await expect(
		editor.getByRole("slider", { name: "默认 · 高度（px）", exact: true })
	).toHaveAttribute("aria-valuenow", "44");
	await setNumber(page, "默认 · 高度（px）", 60);
	await editor.getByRole("button", { name: "撤回未保存修改" }).click();
	await expect(cell("current", "default", "default")).toHaveCSS("height", "44px");
	await editor.getByRole("button", { name: "关闭", exact: true }).click();
	const downloadPromise = page.waitForEvent("download");
	await tuner.getByRole("button", { name: "导出当前版本" }).click();
	const download = await downloadPromise;
	expect(download.suggestedFilename()).toBe("valar-button-style.json");
	const context = await page.context().browser()!.newContext();
	try {
		const restored = await context.newPage();
		await restored.goto(new URL("/docs/components/button", page.url()).href, {
			waitUntil: "networkidle",
		});
		await restored
			.getByLabel("导入 Button 版本", { exact: true })
			.setInputFiles((await download.path())!);
		const restoredButton = restored.locator('[data-tuning-current] [data-size="default"]').first();
		await expect(restoredButton).toHaveCSS("height", "44px");
		await expect(restoredButton).toHaveCSS("padding-left", "16px");
	} finally {
		await context.close();
	}
	await tuner.getByLabel("导入 Button 版本", { exact: true }).setInputFiles({
		name: "bad.json",
		mimeType: "application/json",
		buffer: Buffer.from('{"format":999}'),
	});
	await expect(tuner.getByRole("status")).toContainText("导入失败");
	await expect(pageSample).toHaveCSS("height", "44px");
	expect(errors).toEqual([]);
});

test("Button radius level follows the global radius and drafts survive storage failure", async ({
	page,
}) => {
	await page.emulateMedia({ colorScheme: "dark" });
	await page.goto("/docs/components/button", { waitUntil: "networkidle" });
	const tuner = page.getByRole("region", { name: "Button 样式微调", exact: true });
	const editor = page.getByRole("dialog", { name: "Button · 组件参数" });
	const current = editor.locator(
		'[data-tuning-current] [data-variant="outline"][data-size="default"]'
	);
	await tuner.getByRole("button", { name: "微调 Button", exact: true }).click();
	await editor.getByRole("button", { name: "圆角档位 lg · 1 × 基数" }).click();
	await page.getByRole("option", { name: "xl · 1.4 × 基数", exact: true }).click();
	// xl is 1.4 × the theme radius (0.625rem = 10px), not a fixed pixel value.
	await expect(current).toHaveCSS("border-top-left-radius", "14px");
	await expect(
		editor.locator('[data-tuning-current] [data-variant="outline"][data-size="xs"]')
	).toHaveCSS("border-top-left-radius", "14px");
	await setNumber(page, "默认 · 高度（px）", 59);
	// After keyboard input, focusing shows the original focus ring.
	await current.focus();
	await expect(current).not.toHaveCSS("box-shadow", "none");
	await editor.getByRole("textbox", { name: "Button 版本名称" }).fill("存储失败不得丢失");
	await page.evaluate(() => {
		Storage.prototype.setItem = () => {
			throw new DOMException("Storage full", "QuotaExceededError");
		};
	});
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("保存失败");
	await expect(current).toHaveCSS("height", "59px");
	for (const width of [320, 390, 768]) {
		await page.setViewportSize({ width, height: 900 });
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
			width
		);
	}
});
