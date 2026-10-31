/**
 * Local, read-only MCP server for Valar (`valar-svelte mcp`), modelled on Arc's tools:
 * list_components, search_components, get_component, get_install_command and get_skill.
 * Data comes from the registry's `catalog.json` (built from component cards) and
 * `skills/valar-svelte.json`. Transport is stdio with newline-delimited JSON-RPC 2.0, which
 * is small enough to implement here without an SDK dependency.
 */

export type CatalogComponent = {
	name: string;
	title: string;
	description: string;
	categories: string[];
	docs: string;
	install: string;
	markdown: string;
	rules?: string;
	meta: { valar: { keywords: string[]; whenToUse: string[] } };
};
export type Catalog = { site: string; components: CatalogComponent[]; missingCards: string[] };
export type Skill = { name: string; files: { path: string; content: string }[] };

export type McpData = { catalog(): Promise<Catalog>; skill(): Promise<Skill> };

type JsonRpcRequest = { jsonrpc: "2.0"; id?: string | number | null; method: string; params?: any };
type JsonRpcResponse = {
	jsonrpc: "2.0";
	id: string | number | null;
	result?: unknown;
	error?: { code: number; message: string };
};

const names = { type: "array", items: { type: "string" }, minItems: 1 } as const;

export const MCP_TOOLS = [
	{
		name: "list_components",
		description: "列出 Valar 组件（名称、分类、一句话用途），以及尚无说明卡的组件。",
		inputSchema: {
			type: "object",
			properties: { category: { type: "string", description: "只列此分类，如 表单、弹层" } },
		},
	},
	{
		name: "search_components",
		description: "按用途或关键词（中英文均可）搜索组件，返回最相关的组件。选组件前先调用。",
		inputSchema: {
			type: "object",
			properties: { query: { type: "string" }, limit: { type: "number" } },
			required: ["query"],
		},
	},
	{
		name: "get_component",
		description:
			"获取一个组件的说明卡（何时用／不用、无障碍、响应式、相关组件）、设计规范 RULES.md、文档链接与安装命令。",
		inputSchema: { type: "object", properties: { name: { type: "string" } }, required: ["name"] },
	},
	{
		name: "get_install_command",
		description: "返回安装一个或多个组件的 CLI 命令。",
		inputSchema: { type: "object", properties: { names }, required: ["names"] },
	},
	{
		name: "get_skill",
		description:
			"获取 Valar 技能包（AI 使用组件库的工作流程与规则）。不传 file 时返回 SKILL.md 和文件列表。",
		inputSchema: { type: "object", properties: { file: { type: "string" } } },
	},
] as const;

/** Lower-cased words; a query matches a component when every word appears in its text. */
export function searchComponents(catalog: Catalog, query: string, limit = 5): CatalogComponent[] {
	const words = query.toLowerCase().split(/\s+/).filter(Boolean);
	if (!words.length) return [];
	const scored = catalog.components.map((c) => {
		const strong = [c.name, c.title, ...c.meta.valar.keywords].join(" ").toLowerCase();
		const weak = [c.description, ...c.meta.valar.whenToUse].join(" ").toLowerCase();
		let score = 0;
		for (const word of words) {
			if (strong.includes(word)) score += 2;
			else if (weak.includes(word)) score += 1;
			else return { c, score: 0 };
		}
		return { c, score };
	});
	return scored
		.filter((s) => s.score > 0)
		.sort((a, b) => b.score - a.score || a.c.name.localeCompare(b.c.name))
		.slice(0, limit)
		.map((s) => s.c);
}

const line = (c: CatalogComponent) =>
	`- \`${c.name}\` ${c.title}（${c.categories[0]}）：${c.description}`;

async function callTool(data: McpData, name: string, args: any): Promise<string> {
	switch (name) {
		case "list_components": {
			const catalog = await data.catalog();
			const list = catalog.components.filter(
				(c) => !args?.category || c.categories.includes(args.category)
			);
			return `${list.map(line).join("\n")}\n\n尚无说明卡（可用，但请先读文档页）：${catalog.missingCards.join("、") || "无"}`;
		}
		case "search_components": {
			const catalog = await data.catalog();
			const found = searchComponents(catalog, String(args?.query ?? ""), Number(args?.limit) || 5);
			return found.length
				? `${found.map(line).join("\n")}\n\n用 get_component 查看“何时不用”后再决定。`
				: "没有匹配的组件。换个说法，或用 list_components 查看全部。";
		}
		case "get_component": {
			const catalog = await data.catalog();
			const c = catalog.components.find((item) => item.name === args?.name);
			if (!c) {
				const missing = catalog.missingCards.includes(args?.name);
				throw new Error(
					missing
						? `${args.name} 尚无说明卡；文档：${catalog.site}/docs/components/${args.name}.md`
						: `没有组件 ${args?.name}。用 search_components 查找。`
				);
			}
			return [
				c.markdown,
				c.rules ? `\n---\n\n${c.rules}` : "\n---\n\n此组件暂无 RULES.md，遵守通用规则。",
				`\n---\n\n- 文档：${c.docs}.md\n- 安装：\`${c.install}\``,
			].join("\n");
		}
		case "get_install_command": {
			const list: unknown = args?.names;
			if (!Array.isArray(list) || !list.length || !list.every((n) => /^[a-z][a-z0-9-]*$/.test(n)))
				throw new Error('names 必须是组件名数组，如 ["button", "dialog"]');
			return `pnpm exec valar-svelte add ${list.join(" ")}`;
		}
		case "get_skill": {
			const skill = await data.skill();
			const file = args?.file ?? "SKILL.md";
			const found = skill.files.find((f) => f.path === file);
			if (!found)
				throw new Error(`技能包中没有 ${file}。可用：${skill.files.map((f) => f.path).join("、")}`);
			return file === "SKILL.md"
				? `${found.content}\n\n---\n技能包文件：${skill.files.map((f) => f.path).join("、")}`
				: found.content;
		}
		default:
			throw new Error(`未知工具 ${name}`);
	}
}

/** Handles one JSON-RPC message; returns undefined for notifications. */
export async function handleMcpMessage(
	data: McpData,
	message: JsonRpcRequest,
	version: string
): Promise<JsonRpcResponse | undefined> {
	if (message.id === undefined || message.id === null) return undefined;
	const id = message.id;
	const ok = (result: unknown): JsonRpcResponse => ({ jsonrpc: "2.0", id, result });
	switch (message.method) {
		case "initialize":
			return ok({
				protocolVersion: message.params?.protocolVersion ?? "2025-06-18",
				capabilities: { tools: {} },
				serverInfo: { name: "valar-svelte", version },
				instructions:
					"Valar Svelte 组件库。写 UI 前先 search_components / get_component 选组件，遵守返回的 RULES.md；完成后在项目中运行 valar-svelte lint。",
			});
		case "ping":
			return ok({});
		case "tools/list":
			return ok({ tools: MCP_TOOLS });
		case "tools/call":
			try {
				const text = await callTool(data, message.params?.name, message.params?.arguments);
				return ok({ content: [{ type: "text", text }] });
			} catch (error) {
				// Tool failures are results the model can read, not protocol errors.
				const text = error instanceof Error ? error.message : String(error);
				return ok({ content: [{ type: "text", text }], isError: true });
			}
		default:
			return {
				jsonrpc: "2.0",
				id,
				error: { code: -32601, message: `Method not found: ${message.method}` },
			};
	}
}
