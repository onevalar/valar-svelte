import { expect, test } from "@playwright/test";

test("language switching preserves the document and URL state", async ({ page }) => {
	await page.goto("/docs/components/button?ref=locale#usage");
	await expect(page.locator("html")).toHaveAttribute("lang", "en");
	await page.getByRole("button", { name: "Switch to 中文", exact: true }).first().click();
	await expect(page).toHaveURL(/\/zh\/docs\/components\/button\?ref=locale#usage$/);
	await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
	await expect(page.locator("header nav").first().getByRole("link")).toHaveText(["组件", "设计 token", "文档"]);
	await expect(page.getByRole("heading", { level: 1, name: "按钮", exact: true })).toBeVisible();
	await page.getByRole("button", { name: "切换到English", exact: true }).first().click();
	await expect(page).toHaveURL(/\/docs\/components\/button\?ref=locale#usage$/);
	await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("Chinese changelog retains its entries and localized direction navigation", async ({ page }) => {
	await page.goto("/zh/docs/changelog");
	await expect(page.locator('a[href="/zh/docs/changelog/2026-10"]').first()).toBeVisible();
	await page.goto("/zh/docs/components/number-field");
	await expect(page.getByRole("heading", { level: 1, name: "数值输入", exact: true })).toBeVisible();
	await page.locator('a[href="/zh/docs/direction"]').first().click();
	await expect(page).toHaveURL(/\/zh\/docs\/direction$/);
	await expect(page.getByRole("heading", { level: 1, name: "方向 / RTL", exact: true })).toBeVisible();
});

test("new Chinese documentation is server rendered with the correct language", async ({ request }) => {
	for (const slug of ["number-field", "tags-input", "stepper", "slider-field", "color-picker"]) {
		const response = await request.get(`/zh/docs/components/${slug}`);
		expect(response.ok(), slug).toBe(true);
		expect(await response.text()).toContain('<html lang="zh-CN"');
	}
});
