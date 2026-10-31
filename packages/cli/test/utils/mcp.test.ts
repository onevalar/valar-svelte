import { describe, expect, it } from "vitest";
import {
	handleMcpMessage,
	searchComponents,
	type Catalog,
	type McpData,
} from "../../src/utils/mcp.js";

const component = (name: string, title: string, keywords: string[], description = "说明") => ({
	name,
	title,
	description,
	categories: ["弹层"],
	docs: `http://site/docs/components/${name}`,
	install: `pnpm exec valar-svelte add ${name}`,
	markdown: `# ${title}`,
	meta: { valar: { keywords, whenToUse: ["确认危险操作"] } },
});
const catalog: Catalog = {
	site: "http://site",
	components: [
		component("dialog", "Dialog 对话框", ["弹窗", "modal"]),
		{ ...component("alert-dialog", "Alert Dialog", ["确认", "删除"]), rules: "# 规则" },
	],
	missingCards: ["accordion"],
};
const data: McpData = {
	catalog: async () => catalog,
	skill: async () => ({ name: "valar-svelte", files: [{ path: "SKILL.md", content: "技能" }] }),
};
const call = async (name: string, args: unknown) => {
	const res = await handleMcpMessage(
		data,
		{ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } },
		"1.0.0"
	);
	return res?.result as { content: { text: string }[]; isError?: boolean };
};

describe("valar mcp", () => {
	it("ranks keyword hits above description hits and requires every word", () => {
		expect(searchComponents(catalog, "确认").map((c) => c.name)).toEqual([
			"alert-dialog",
			"dialog",
		]);
		expect(searchComponents(catalog, "MODAL").map((c) => c.name)).toEqual(["dialog"]);
		expect(searchComponents(catalog, "弹窗 删除")).toEqual([]);
	});

	it("answers the protocol handshake and ignores notifications", async () => {
		const init = await handleMcpMessage(
			data,
			{ jsonrpc: "2.0", id: 0, method: "initialize", params: { protocolVersion: "2025-03-26" } },
			"1.0.0"
		);
		expect(init?.result).toMatchObject({
			protocolVersion: "2025-03-26",
			capabilities: { tools: {} },
		});
		expect(
			await handleMcpMessage(data, { jsonrpc: "2.0", method: "notifications/initialized" }, "1")
		).toBeUndefined();
		const unknown = await handleMcpMessage(data, { jsonrpc: "2.0", id: 9, method: "nope" }, "1");
		expect(unknown?.error?.code).toBe(-32601);
	});

	it("returns cards with rules, and tool errors as readable results", async () => {
		const got = await call("get_component", { name: "alert-dialog" });
		expect(got.content[0]!.text).toContain("# 规则");
		expect(got.content[0]!.text).toContain("pnpm exec valar-svelte add alert-dialog");
		const missing = await call("get_component", { name: "accordion" });
		expect(missing.isError).toBe(true);
		expect(missing.content[0]!.text).toContain("尚无说明卡");
		const bad = await call("get_install_command", { names: ["button; rm -rf /"] });
		expect(bad.isError).toBe(true);
	});
});
