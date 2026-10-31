import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import readline from "node:readline";
import { Command } from "commander";
import * as cliConfig from "../../utils/config/index.js";
import { OFFICIAL_REGISTRY_URL } from "../../constants.js";
import { getCLIPackageInfo } from "../../utils/get-package-info.js";
import { handleMcpMessage, type Catalog, type McpData, type Skill } from "../../utils/mcp.js";

/** Reads `<registry>/<file>` from a URL or, for local work without the docs site, a directory. */
async function readRegistryJson<T>(registry: string, file: string): Promise<T> {
	if (/^https?:\/\//.test(registry)) {
		const url = `${registry.replace(/\/$/, "")}/${file}`;
		const response = await fetch(url);
		if (!response.ok)
			throw new Error(`无法读取 ${url}（HTTP ${response.status}）。文档站是否已启动？`);
		return (await response.json()) as T;
	}
	return JSON.parse(await fs.readFile(path.join(registry, file), "utf8")) as T;
}

export const mcp = new Command()
	.command("mcp")
	.description("start the local, read-only Valar MCP server (stdio)")
	.option("-c, --cwd <path>", "the working directory", process.cwd())
	.option("--registry <url-or-dir>", "registry base URL or local registry directory")
	.action(async (opts: { cwd: string; registry?: string }) => {
		const cwd = path.resolve(opts.cwd);
		const configured = (() => {
			try {
				return cliConfig.loadConfig(cwd)?.registry;
			} catch {
				return undefined;
			}
		})();
		const registry = opts.registry ?? configured ?? OFFICIAL_REGISTRY_URL;
		// Cache per process; restart the server to pick up a rebuilt registry.
		let catalog: Promise<Catalog> | undefined;
		let skill: Promise<Skill> | undefined;
		const data: McpData = {
			catalog: () =>
				(catalog ??= readRegistryJson<Catalog>(registry, "catalog.json")).catch((e) => {
					catalog = undefined;
					throw e;
				}),
			skill: () =>
				(skill ??= readRegistryJson<Skill>(registry, "skills/valar-svelte.json")).catch((e) => {
					skill = undefined;
					throw e;
				}),
		};
		const version = getCLIPackageInfo().version ?? "0.0.0";
		// stdout carries protocol messages only; diagnostics go to stderr.
		console.error(`valar-svelte mcp: registry ${registry}`);
		const input = readline.createInterface({ input: process.stdin });
		for await (const raw of input) {
			if (!raw.trim()) continue;
			let message;
			try {
				message = JSON.parse(raw);
			} catch {
				process.stdout.write(
					JSON.stringify({
						jsonrpc: "2.0",
						id: null,
						error: { code: -32700, message: "Parse error" },
					}) + "\n"
				);
				continue;
			}
			const response = await handleMcpMessage(data, message, version);
			if (response) process.stdout.write(JSON.stringify(response) + "\n");
		}
	});
