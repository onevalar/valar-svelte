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

test("Dialog editor reuses the shared shell and previews layout, overlay and motion tier", async ({
	page,
}) => {
	test.setTimeout(60_000);
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/dialog", { waitUntil: "networkidle" });
	const tuner = page.getByRole("region", { name: "Dialog 样式微调", exact: true });
	const editor = page.getByRole("dialog", { name: "Dialog · 组件参数" });
	const part = (pane: string, slot: string) =>
		editor.locator(`[data-tuning-${pane}] [data-slot="dialog-${slot}"]`);
	const openButton = tuner.getByRole("button", { name: "微调 Dialog", exact: true });
	await openButton.click();
	await expect(editor.getByTestId("dialog-dials")).toBeVisible();
	// Baseline comes from the installed nova source.
	for (const [label, value] of [
		["内边距（px）", "16"],
		["内容间距（px）", "16"],
		["遮罩不透明度（%）", "10"],
	])
		await expect(editor.getByRole("slider", { name: label, exact: true })).toHaveAttribute(
			"aria-valuenow",
			value
		);
	// Motion values are global tokens: shown with their defaults, never editable here.
	await expect(editor.getByText("100ms（默认）")).toBeVisible();

	await setNumber(page, "内边距（px）", 28);
	await setNumber(page, "遮罩不透明度（%）", 50);
	await editor.getByRole("button", { name: /^动效档位/ }).click();
	await page.getByRole("option", { name: "慢（全局 token）" }).click();
	await expect(editor.getByText("已修改 3 项", { exact: true })).toBeVisible();
	await expect(part("current", "content")).toHaveCSS("padding-top", "28px");
	// The bleeding footer follows the padding so it still reaches the panel edges.
	await expect(part("current", "footer")).toHaveCSS("margin-left", "-28px");
	await expect(part("current", "overlay")).toHaveCSS("background-color", "rgba(0, 0, 0, 0.5)");
	await expect(part("current", "content")).toHaveCSS("animation-duration", "0.3s");
	await editor.getByRole("button", { name: "重播进入与退出" }).click();
	await expect(part("current", "content")).toBeVisible();
	await editor.getByRole("radio", { name: "并排对比" }).click();
	await expect(part("before", "content")).toHaveCSS("padding-top", "16px");
	await editor.getByRole("textbox", { name: "Dialog 版本名称" }).fill("宽松弹窗");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「宽松弹窗」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();
	expect(errors).toEqual([]);
});

test("Popover editor previews padding, slide distance and motion tier on a real inline popover", async ({
	page,
}) => {
	test.setTimeout(60_000);
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/popover", { waitUntil: "networkidle" });
	const tuner = page.getByRole("region", {
		name: "Popover 样式微调",
		exact: true,
	});
	const editor = page.getByRole("dialog", { name: "Popover · 组件参数" });
	const content = (pane: string) =>
		editor.locator(`[data-tuning-${pane}] [data-slot="popover-content"]`);
	const variable = (pane: string, name: string) =>
		content(pane).evaluate(
			(element, name) => getComputedStyle(element).getPropertyValue(name),
			name
		);
	const openButton = tuner.getByRole("button", {
		name: "微调 Popover",
		exact: true,
	});
	await openButton.click();
	await expect(editor.getByTestId("popover-dials")).toBeVisible();
	// Baseline comes from the installed nova source (p-2.5, gap-2.5, slide 2 = 8px).
	for (const label of ["内边距（px）", "内容间距（px）"])
		await expect(editor.getByRole("slider", { name: label, exact: true })).toHaveAttribute(
			"aria-valuenow",
			"10"
		);
	await expect(editor.getByRole("button", { name: /^出现时滑入距离/ })).toContainText("8px");
	await expect(content("current")).toHaveAttribute("data-side", "bottom");

	await setNumber(page, "内边距（px）", 20);
	await editor.getByRole("button", { name: /^出现时滑入距离/ }).click();
	await page.getByRole("option", { name: "16px" }).click();
	await editor.getByRole("button", { name: /^动效档位/ }).click();
	await page.getByRole("option", { name: "慢（全局 token）" }).click();
	await expect(editor.getByText("已修改 3 项", { exact: true })).toBeVisible();
	await expect(content("current")).toHaveCSS("padding-top", "20px");
	await expect(content("current")).toHaveCSS("animation-duration", "0.3s");
	// Opening below the trigger starts 16px above it; on the left side it starts to the right.
	expect(await variable("current", "--tw-enter-translate-y")).toMatch(
		/^calc\(calc\(4 \* .+\) \* -1\)$/
	);
	await editor.getByRole("radio", { name: "左侧" }).first().click();
	await expect(content("current")).toHaveAttribute("data-side", "left");
	expect(await variable("current", "--tw-enter-translate-x")).toMatch(/^calc\(4 \* [^)]+\)$/);
	await editor.getByRole("button", { name: "重播进入与退出" }).click();
	await expect(content("current")).toBeVisible();
	await editor.getByRole("radio", { name: "并排对比" }).click();
	await expect(content("before")).toHaveCSS("padding-top", "10px");
	await expect(content("before")).toHaveCSS("animation-duration", "0.1s");
	await editor.getByRole("textbox", { name: "Popover 版本名称" }).fill("宽松浮层");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「宽松浮层」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();
	expect(errors).toEqual([]);
});

test("Sheet editor previews width, padding, overlay, slide distance and motion tier", async ({
	page,
}) => {
	test.setTimeout(60_000);
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/sheet", { waitUntil: "networkidle" });
	const tuner = page.getByRole("region", {
		name: "Sheet 样式微调",
		exact: true,
	});
	const editor = page.getByRole("dialog", { name: "Sheet · 组件参数" });
	const part = (pane: string, slot: string) =>
		editor.locator(`[data-tuning-${pane}] [data-slot="sheet-${slot}"]`);
	const openButton = tuner.getByRole("button", {
		name: "微调 Sheet",
		exact: true,
	});
	await openButton.click();
	await expect(editor.getByTestId("sheet-dials")).toBeVisible();
	for (const [label, value] of [
		["页眉页脚内边距（px）", "16"],
		["内容间距（px）", "16"],
		["遮罩不透明度（%）", "10"],
	])
		await expect(editor.getByRole("slider", { name: label, exact: true })).toHaveAttribute(
			"aria-valuenow",
			value
		);
	// The slide distance is Sheet's own parameter; the upstream default is 10 steps = 40px.
	await expect(editor.getByRole("button", { name: /^滑入距离/ })).toContainText("40px");
	await expect(editor.getByText("300ms（默认）")).toBeVisible();
	await expect(part("current", "content")).toHaveCSS("width", "384px");

	await setNumber(page, "页眉页脚内边距（px）", 24);
	await setNumber(page, "遮罩不透明度（%）", 50);
	await editor.getByRole("button", { name: /^左右侧宽度/ }).click();
	await page.getByRole("option", { name: "lg · 512px" }).click();
	await editor.getByRole("button", { name: /^滑入距离/ }).click();
	await page.getByRole("option", { name: "整个面板" }).click();
	await editor.getByRole("button", { name: /^动效档位/ }).click();
	await page.getByRole("option", { name: "慢（全局 token）" }).click();
	await expect(editor.getByText("已修改 5 项", { exact: true })).toBeVisible();
	await expect(part("current", "header")).toHaveCSS("padding-top", "24px");
	await expect(part("current", "footer")).toHaveCSS("padding-left", "24px");
	await expect(part("current", "overlay")).toHaveCSS("background-color", "rgba(0, 0, 0, 0.5)");
	await expect(part("current", "content")).toHaveCSS("width", "512px");
	await expect(part("current", "content")).toHaveCSS("animation-duration", "0.3s");
	await expect(part("current", "overlay")).toHaveCSS("animation-duration", "0.3s");
	expect(
		await part("current", "content").evaluate((element) =>
			getComputedStyle(element).getPropertyValue("--tw-enter-translate-x").trim()
		)
	).toBe("100%");
	await editor.getByRole("radio", { name: "底部" }).first().click();
	await expect(part("current", "content")).toHaveAttribute("data-side", "bottom");
	await editor.getByRole("button", { name: "重播进入与退出" }).click();
	await expect(part("current", "content")).toBeVisible();
	await editor.getByRole("radio", { name: "并排对比" }).click();
	await expect(part("before", "header")).toHaveCSS("padding-top", "16px");
	await expect(part("before", "overlay")).toHaveCSS("background-color", "oklab(0 0 0 / 0.1)");
	await editor.getByRole("textbox", { name: "Sheet 版本名称" }).fill("整面滑入");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「整面滑入」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();
	expect(errors).toEqual([]);
});

test("Input editor picks Button's height tier and radius level, compares and saves", async ({
	page,
}) => {
	test.setTimeout(60_000);
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/input", { waitUntil: "networkidle" });
	const tuner = page.getByRole("region", { name: "Input 样式微调", exact: true });
	const editor = page.getByRole("dialog", { name: "Input · 组件参数" });
	const input = (pane: string) => editor.locator(`[data-tuning-${pane}] [data-slot="input"]`);
	const openButton = tuner.getByRole("button", { name: "微调 Input", exact: true });
	const pageSample = tuner.locator('[data-tuning-current] [data-slot="input"]');
	await expect(pageSample).toHaveCSS("height", "32px");
	await openButton.click();
	await expect(editor.getByTestId("input-dials")).toBeVisible();
	// Measured from nova: the Input is as tall as Button's default size.
	await expect(editor.getByRole("button", { name: "高度档位 同 Button 默认" })).toBeVisible();
	await expect(editor.getByRole("button", { name: "圆角档位 lg · 1 × 基数" })).toBeVisible();
	await expect(
		editor.getByRole("slider", { name: "横向内边距（px）", exact: true })
	).toHaveAttribute("aria-valuenow", "10");
	await expect(editor.getByText("--input", { exact: true })).toBeVisible();

	await editor.getByRole("button", { name: "高度档位 同 Button 默认" }).click();
	await page.getByRole("option", { name: "同 Button 大", exact: true }).click();
	await setNumber(page, "横向内边距（px）", 16);
	await expect(editor.getByText("已修改 2 项", { exact: true })).toBeVisible();
	// Button's large size is 36px in nova; every Input in the draft follows, Buttons do not.
	await expect(input("current").first()).toHaveCSS("height", "36px");
	await expect(input("current").first()).toHaveCSS("padding-left", "16px");
	await expect(input("current").last()).toHaveCSS("height", "36px");
	await expect(editor.locator('[data-tuning-current] [data-slot="button"]')).toHaveCSS(
		"height",
		"32px"
	);
	await editor.getByRole("radio", { name: "并排对比" }).click();
	await expect(input("before").first()).toHaveCSS("height", "32px");
	await editor.getByRole("textbox", { name: "Input 版本名称" }).fill("高输入框");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「高输入框」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();
	// The page sample shows the saved version.
	await expect(pageSample).toHaveCSS("height", "36px");
	for (const width of [390, 768]) {
		await page.setViewportSize({ width, height: 900 });
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
			width
		);
	}
	expect(errors).toEqual([]);
});

test("Select and Textarea editors share the shell and Button's levels", async ({ page }) => {
	test.setTimeout(60_000);
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/select", { waitUntil: "networkidle" });
	let tuner = page.getByRole("region", { name: "Select 样式微调", exact: true });
	let editor = page.getByRole("dialog", { name: "Select · 组件参数" });
	const trigger = (pane: string, size: string) =>
		editor
			.locator(`[data-tuning-${pane}] [data-slot="select-trigger"][data-size="${size}"]`)
			.first();
	let openButton = tuner.getByRole("button", { name: "微调 Select", exact: true });
	await openButton.click();
	await expect(editor.getByTestId("select-dials")).toBeVisible();
	await expect(editor.getByRole("button", { name: "默认尺寸高度 同 Button 默认" })).toBeVisible();
	await editor.getByRole("button", { name: "小尺寸高度 同 Button 小" }).click();
	await page.getByRole("option", { name: "同 Button 默认", exact: true }).click();
	await editor.getByRole("button", { name: "圆角档位 lg · 1 × 基数" }).click();
	await page.getByRole("option", { name: "none · 直角", exact: true }).click();
	await expect(trigger("current", "sm")).toHaveCSS("height", "32px");
	await expect(trigger("current", "default")).toHaveCSS("height", "32px");
	// One radius level for both sizes, replacing nova's own small-size radius.
	await expect(trigger("current", "sm")).toHaveCSS("border-top-left-radius", "0px");
	await expect(trigger("current", "default")).toHaveCSS("border-top-left-radius", "0px");
	await editor.getByRole("radio", { name: "并排对比" }).click();
	await expect(trigger("before", "sm")).toHaveCSS("height", "28px");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();

	await page.goto("/docs/components/textarea", { waitUntil: "networkidle" });
	tuner = page.getByRole("region", { name: "Textarea 样式微调", exact: true });
	editor = page.getByRole("dialog", { name: "Textarea · 组件参数" });
	const textarea = (pane: string) =>
		editor.locator(`[data-tuning-${pane}] [data-slot="textarea"]`).first();
	openButton = tuner.getByRole("button", { name: "微调 Textarea", exact: true });
	await openButton.click();
	await expect(
		editor.getByRole("slider", { name: "纵向内边距（px）", exact: true })
	).toHaveAttribute("aria-valuenow", "8");
	await editor.getByRole("button", { name: "圆角档位 lg · 1 × 基数" }).click();
	await page.getByRole("option", { name: "2xl · 1.8 × 基数", exact: true }).click();
	await setNumber(page, "纵向内边距（px）", 12);
	// 2xl is 1.8 × the theme radius (10px).
	await expect(textarea("current")).toHaveCSS("border-top-left-radius", "18px");
	await expect(textarea("current")).toHaveCSS("padding-top", "12px");
	await editor.getByRole("radio", { name: "并排对比" }).click();
	await expect(textarea("before")).toHaveCSS("padding-top", "8px");
	await editor.getByRole("textbox", { name: "Textarea 版本名称" }).fill("宽松文本框");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「宽松文本框」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();
	expect(errors).toEqual([]);
});

test("Dropdown Menu editor previews panel, item spacing and motion tier on a real menu", async ({
	page,
}) => {
	test.setTimeout(60_000);
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/dropdown-menu", { waitUntil: "networkidle" });
	const tuner = page.getByRole("region", { name: "Dropdown Menu 样式微调", exact: true });
	const editor = page.getByRole("dialog", { name: "Dropdown Menu · 组件参数" });
	const part = (pane: string, slot: string) =>
		editor.locator(`[data-tuning-${pane}] [data-slot="dropdown-menu-${slot}"]`);
	const openButton = tuner.getByRole("button", { name: "微调 Dropdown Menu", exact: true });
	await openButton.click();
	await expect(editor.getByTestId("dropdown-menu-dials")).toBeVisible();
	// Baseline comes from the installed nova source.
	for (const [label, value] of [
		["面板内边距（px）", "4"],
		["最小宽度（px）", "128"],
		["菜单项横向内边距（px）", "6"],
		["图文间距（px）", "6"],
	])
		await expect(editor.getByRole("slider", { name: label, exact: true })).toHaveAttribute(
			"aria-valuenow",
			value
		);
	await expect(part("current", "content")).toBeVisible();
	await expect(part("current", "content")).toHaveCSS("padding-top", "4px");

	await setNumber(page, "面板内边距（px）", 8);
	await setNumber(page, "菜单项横向内边距（px）", 10);
	await editor.getByRole("button", { name: /^动效档位/ }).click();
	await page.getByRole("option", { name: "慢（全局 token）" }).click();
	await expect(editor.getByText("已修改 3 项", { exact: true })).toBeVisible();
	await expect(part("current", "content")).toHaveCSS("padding-top", "8px");
	await expect(part("current", "content")).toHaveCSS("animation-duration", "0.3s");
	await expect(part("current", "item").first()).toHaveCSS("padding-left", "10px");
	// Inset rows follow the item padding (28px + 4px) so they still line up with icon rows.
	await expect(part("current", "item").and(page.locator("[data-inset]"))).toHaveCSS(
		"padding-left",
		"32px"
	);
	// Separators bleed to the panel edge in nova, so they follow the panel padding.
	await expect(part("current", "separator").first()).toHaveCSS("margin-left", "-8px");
	await editor.getByRole("button", { name: "重播进入与退出" }).click();
	await expect(part("current", "content")).toBeVisible();
	await editor.getByRole("radio", { name: "并排对比" }).click();
	await expect(part("before", "content")).toHaveCSS("padding-top", "4px");
	await editor.getByRole("textbox", { name: "Dropdown Menu 版本名称" }).fill("宽松菜单");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「宽松菜单」");
	// The open menu defers Escape to the editor, which closes and returns focus.
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();
	expect(errors).toEqual([]);
});

test("Tooltip editor previews padding, motion tier and the real show delay", async ({ page }) => {
	test.setTimeout(60_000);
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/tooltip", { waitUntil: "networkidle" });
	const tuner = page.getByRole("region", { name: "Tooltip 样式微调", exact: true });
	const editor = page.getByRole("dialog", { name: "Tooltip · 组件参数" });
	const pinned = (pane: string) =>
		editor.locator(`[data-tuning-${pane}] [data-tooltip-pinned] [data-slot="tooltip-content"]`);
	const hovered = editor.locator(
		'[data-tuning-current] [data-tooltip-hover] [data-slot="tooltip-content"]'
	);
	const openButton = tuner.getByRole("button", { name: "微调 Tooltip", exact: true });
	await openButton.click();
	await expect(editor.getByTestId("tooltip-dials")).toBeVisible();
	for (const [label, value] of [
		["横向内边距（px）", "12"],
		["纵向内边距（px）", "6"],
		["显示延迟（ms）", "0"],
	])
		await expect(editor.getByRole("slider", { name: label, exact: true })).toHaveAttribute(
			"aria-valuenow",
			value
		);
	await expect(pinned("current")).toBeVisible();
	await expect(pinned("current")).toHaveCSS("padding-left", "12px");

	await setNumber(page, "横向内边距（px）", 16);
	await setNumber(page, "显示延迟（ms）", 700);
	await editor.getByRole("button", { name: /^动效档位/ }).click();
	await page.getByRole("option", { name: "中（全局 token）" }).click();
	await expect(editor.getByText("已修改 3 项", { exact: true })).toBeVisible();
	await expect(pinned("current")).toHaveCSS("padding-left", "16px");
	await expect(pinned("current")).toHaveCSS("animation-duration", "0.2s");
	await expect(editor.getByText("悬停或聚焦后 700ms 出现")).toBeVisible();
	// The delay is real behavior: nothing shows right away, then the tooltip opens.
	const trigger = editor
		.locator("[data-tuning-current]")
		.getByRole("button", { name: "悬停试试", exact: true });
	await trigger.hover();
	await page.waitForTimeout(300);
	await expect(hovered).toHaveCount(0);
	await expect(hovered).toBeVisible({ timeout: 2_000 });
	await expect(hovered).toContainText("显示延迟 700ms");
	await page.mouse.move(0, 0);
	await expect(hovered).toHaveCount(0);
	await editor.getByRole("button", { name: "重播进入与退出" }).click();
	await expect(pinned("current")).toBeVisible();
	await editor.getByRole("radio", { name: "并排对比" }).click();
	await expect(pinned("before")).toHaveCSS("padding-left", "12px");
	await editor.getByRole("textbox", { name: "Tooltip 版本名称" }).fill("慢提示");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「慢提示」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();
	expect(errors).toEqual([]);
});
