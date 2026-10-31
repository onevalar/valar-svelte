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
	await page
		.getByLabel("导入预设文件", { exact: true })
		.setInputFiles({
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
