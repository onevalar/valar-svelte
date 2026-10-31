import { describe, expect, it } from "vitest";
import {
	applyTokenOverride,
	hexToOklch,
	oklchToHex,
	serializeTokenOverrides,
	tokenOverridePayloadSchema,
} from "../src/lib/features/workbench/token-overrides.js";

describe("global token write-back", () => {
	it("converts between hex and oklch using reference values", () => {
		// Reference: CSS Color 4 conversion of pure sRGB red.
		expect(hexToOklch("#ff0000")).toBe("oklch(0.628 0.258 29.234)");
		expect(oklchToHex("oklch(0.628 0.258 29.234)")).toBe("#ff0000");
		// Grays carry no hue and are written like the upstream themes.
		expect(hexToOklch("#ffffff")).toBe("oklch(1 0 0)");
		expect(oklchToHex("oklch(1 0 0)")).toBe("#ffffff");
		// Alpha survives a color change, so translucent borders stay translucent.
		expect(hexToOklch("#000000", "10%")).toBe("oklch(0 0 0 / 10%)");
		expect(oklchToHex("oklch(1 0 0 / 15%)")).toBe("#ffffff");
	});

	it("only accepts oklch colors, known tokens and bounded rem values", () => {
		const ok = {
			base: "neutral",
			override: { light: { primary: "oklch(0.5 0.2 260)", radius: "0.5rem" } },
		};
		expect(tokenOverridePayloadSchema.safeParse(ok).success).toBe(true);
		for (const override of [
			{ light: { primary: "red" } },
			{ light: { primary: "oklch(0.5 0.2 260); } body { display:none" } },
			{ light: { "not-a-token": "oklch(0.5 0.2 260)" } },
			{ dark: { radius: "0.5rem" } },
			{ light: { radius: "5rem" } },
			{ theme: { "text-sm": "99px" } },
		]) {
			expect(tokenOverridePayloadSchema.safeParse({ base: "neutral", override }).success).toBe(
				false
			);
		}
		expect(tokenOverridePayloadSchema.safeParse({ ...ok, base: "amber" }).success).toBe(false);
	});

	it("merges overrides over the base theme without dropping untouched tokens", () => {
		const base = {
			name: "neutral",
			cssVars: {
				light: { primary: "oklch(0.205 0 0)", border: "oklch(0.922 0 0)" },
				dark: { primary: "oklch(0.922 0 0)" },
			},
		};
		const merged = applyTokenOverride(base, {
			light: { primary: "oklch(0.5 0.2 260)" },
			theme: { "text-sm": "0.9375rem" },
		});
		expect(merged.cssVars).toEqual({
			light: { primary: "oklch(0.5 0.2 260)", border: "oklch(0.922 0 0)" },
			dark: { primary: "oklch(0.922 0 0)" },
			theme: { "text-sm": "0.9375rem" },
		});
		expect(base.cssVars.light.primary).toBe("oklch(0.205 0 0)");
	});

	it("writes only real changes in a stable order", () => {
		const out = serializeTokenOverrides({
			stone: {
				light: { ring: "oklch(0.7 0 0)", primary: "oklch(0.5 0.2 260)" },
				dark: {},
				theme: {},
			},
			neutral: { light: {}, dark: {} },
		});
		expect(out).toBe(
			JSON.stringify(
				{ stone: { light: { primary: "oklch(0.5 0.2 260)", ring: "oklch(0.7 0 0)" } } },
				null,
				"\t"
			) + "\n"
		);
	});
});
