import * as p from "@clack/prompts";
import * as semver from "semver";
import color from "picocolors";
import * as cliConfig from "./config/index.js";
import * as project from "./project.js";
import { highlight } from "./colors.js";
import { CLIError, error } from "./errors.js";


// accepts either a `RawConfig` or `ResolvedConfig`
type PreconditionOptions<Config extends cliConfig.RawConfig> = {
	cwd: string;
	config: Config;
	skipPreflight: boolean;
};

/** Checks preconditions and updates the config if necessary. */
export function checkPreconditions<Config extends cliConfig.RawConfig>({
	cwd,
	config,
	skipPreflight,
}: PreconditionOptions<Config>): Config {
	const svelte = project.getPackageVersion(cwd, "svelte");
	const tailwindcss = project.getPackageVersion(cwd, "tailwindcss");

	const result = checkDependencies({ svelte, tailwindcss }, cwd, config);
	if (result.ok) return result.config;

	if (!skipPreflight) throw result.error;

	p.note(`${color.red(result.error.message)}\nContinuing with ${color.bold("--skip-preflight")}.`);

	return result.config;
}

type CheckDependenciesResult<Config extends cliConfig.RawConfig> =
	| {
			ok: true;
			config: Config;
			error?: null;
	  }
	| {
			ok: false;
			config: Config;
			error: CLIError;
	  };

/** Checks dependencies and updates config if necessary. */
function checkDependencies<Config extends cliConfig.RawConfig>(
	dependencies: Record<string, string | undefined>,
	cwd: string,
	config: Config
): CheckDependenciesResult<Config> {
	if (!dependencies.tailwindcss || !dependencies.svelte) {
		return {
			ok: false,
			config,
			error: error(`This CLI requires Tailwind CSS and Svelte to be installed.\n`),
		};
	}

	const isTailwind3 = semver.satisfies(semver.coerce(dependencies.tailwindcss) ?? "", "^3.0.0");
	const isTailwind4 = semver.satisfies(semver.coerce(dependencies.tailwindcss) ?? "", "^4.0.0");
	const isSvelte5 = semver.satisfies(semver.coerce(dependencies.svelte) ?? "", "^5.0.0");

	if (isTailwind4 && isSvelte5) return { ok: true, config };
 return { ok: false, config, error: error("Valar Svelte requires Svelte 5 and Tailwind CSS 4. No legacy registry is used.") };
}
