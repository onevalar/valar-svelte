import { DEFAULT_PRESET_CONFIG } from "@valar/svelte-cli/preset";
import { expect, it } from "vitest";
import { buildRegistryBase } from "../src/lib/registry/config.js";

it("initializes styles without replacing the required local CLI with an unpublished npm package", () => {
	const item = buildRegistryBase(DEFAULT_PRESET_CONFIG);
	expect(item.devDependencies).toContain("tw-animate-css");
	expect(item.devDependencies.some((dependency) => dependency.startsWith("@valar/"))).toBe(false);
	expect(item.css).toHaveProperty('@import "@valar/svelte-cli/tailwind.css"');
});
