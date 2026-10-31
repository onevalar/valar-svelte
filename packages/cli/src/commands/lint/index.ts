import path from "node:path";
import process from "node:process";
import color from "picocolors";
import { Command } from "commander";
import * as cliConfig from "../../utils/config/index.js";
import { lintPaths } from "../../utils/design-rules.js";
import { handleError } from "../../utils/prompt-helpers.js";

export const lint = new Command()
	.command("lint")
	.description("check UI code against Valar design rules")
	.argument("[paths...]", "files or directories to check (default: src)")
	.option("-c, --cwd <path>", "the working directory", process.cwd())
	.action(async (paths: string[], opts: { cwd: string }) => {
		try {
			const cwd = path.resolve(opts.cwd);
			const config = await cliConfig.getConfig(cwd).catch(() => null);
			// Installed component sources implement the rules; only the app code is checked.
			const skip = config ? [config.resolvedPaths.ui] : [];
			const targets = (paths.length ? paths : ["src"]).map((p) => path.resolve(cwd, p));
			const findings = await lintPaths(targets, skip);
			for (const f of findings) {
				const level = f.severity === "error" ? color.red("error") : color.yellow("warning");
				console.log(
					`${path.relative(cwd, f.file)}:${f.line}  ${level}  ${f.message}  ${color.gray(f.rule)}`
				);
			}
			const errors = findings.filter((f) => f.severity === "error").length;
			console.log(
				findings.length
					? `\n${errors} error(s), ${findings.length - errors} warning(s)`
					: color.green("No Valar design rule violations.")
			);
			if (errors) process.exitCode = 1;
		} catch (e) {
			handleError(e);
		}
	});
