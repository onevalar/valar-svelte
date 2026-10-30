import * as p from "@clack/prompts";
import * as semver from "semver";
import color from "picocolors";
import * as project from "../../utils/project.js";
import { SITE_BASE_URL } from "../../constants.js";
import { highlight } from "../../utils/colors.js";
import { CLIError, error } from "../../utils/errors.js";

/**
 * Runs preflight checks for the `init` command.
 * `init` in this CLI version should only run if the user has a project that
 * is using Tailwind CSS v4 and Svelte v5.
 *
 * If the user is using Tailwind CSS v3 and/or Svelte v4, we need to let them
 * know that they need to upgrade their project in order to use this CLI.
 *
 * @param cwd - The current working directory.
 */
export function preflightInit(cwd: string, options: { skipPreflight: boolean }) {
	const svelte = project.getPackageVersion(cwd, "svelte");
	const tailwindcss = project.getPackageVersion(cwd, "tailwindcss");

	const result = checkInitDependencies({ svelte, tailwindcss });
	if (result.ok) return;

	if (!options.skipPreflight) throw result.error;

	p.note(
		`${color.red(result.error.message)}\nContinuing initialization with ${color.bold("--skip-preflight")}.`
	);
}

type CheckInitDependenciesResult =
	| {
			ok: true;
			error?: null;
	  }
	| {
			ok: false;
			error: CLIError;
	  };

function checkInitDependencies(
	dependencies: Partial<Record<string, string>>
): CheckInitDependenciesResult {
	if (!dependencies.tailwindcss || !dependencies.svelte) {
		return {
			ok: false,
			error: error(
				`This CLI version requires Tailwind CSS v4 and Svelte v5 to initialize a project.\n`
			),
		};
	}

	const isTailwind3 = semver.satisfies(semver.coerce(dependencies.tailwindcss) || "", "^3.0.0");
	const isTailwind4 = semver.satisfies(semver.coerce(dependencies.tailwindcss) || "", "^4.0.0");
	const isSvelte4 = semver.satisfies(semver.coerce(dependencies.svelte) || "", "^4.0.0");
	const isSvelte5 = semver.satisfies(semver.coerce(dependencies.svelte) || "", "^5.0.0");

	// if not Tailwind v4 and Svelte v5 by this point, they are using Tailwind v4 and Svelte v4
	// which is kinda cursed
	if (!isTailwind4 || !isSvelte5) {
		return {
			ok: false,
			error: error(
				`This CLI version requires Tailwind CSS v4 and Svelte v5 to initialize a project.\n`
			),
		};
	}

	return {
		ok: true,
	};
}
