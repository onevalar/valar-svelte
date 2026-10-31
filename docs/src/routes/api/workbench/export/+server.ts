import { json } from "@sveltejs/kit";
import { registryItemSchema } from "@valar/svelte-cli/schema";
import { buildWorkbenchRegistry } from "$lib/features/workbench/export.js";
import { COMPONENTS, presetSchema } from "$lib/features/workbench/model.js";
import type { RequestHandler } from "./$types.js";

export const POST: RequestHandler = async ({ request, fetch }) => {
	let input: unknown;
	try {
		const body = await request.text();
		if (body.length > 32_768) return json({ message: "预设文件过大。" }, { status: 413 });
		input = JSON.parse(body);
	} catch {
		return json({ message: "无法读取预设，请检查 JSON 格式。" }, { status: 400 });
	}
	const parsed = presetSchema.safeParse(input);
	if (!parsed.success)
		return json({ message: "预设包含不支持的参数或超出允许范围。" }, { status: 400 });
	try {
		const items = await Promise.all(
			COMPONENTS.map(async ({ id }) => {
				const response = await fetch(`/registry/styles/vega/${id}.json`);
				if (!response.ok) throw new Error(`无法读取 ${id} 的 registry。`);
				return registryItemSchema.parse(await response.json());
			})
		);
		return json(buildWorkbenchRegistry(parsed.data, items), {
			headers: {
				"Content-Disposition": 'attachment; filename="valar-preset.json"',
				"Cache-Control": "no-store",
			},
		});
	} catch {
		return json(
			{ message: "当前组件源码与导出规则不匹配，未生成安装文件。请重新生成 registry 后重试。" },
			{ status: 500 }
		);
	}
};
