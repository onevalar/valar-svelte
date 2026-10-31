import { defineConfig } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:5187";

export default defineConfig({
	testDir: "./e2e",
	workers: 1,
	forbidOnly: !!process.env.CI,
	retries: 0,
	use: {
		baseURL,
		trace: "retain-on-failure",
		launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
	},
	webServer: process.env.E2E_BASE_URL
		? undefined
		: {
				command: "pnpm exec vite preview --host 127.0.0.1 --port 5187 --strictPort",
				url: baseURL,
				timeout: 120_000,
				reuseExistingServer: !process.env.CI,
			},
});
