import { flushSync, mount, unmount } from "svelte";
import { afterEach, expect, it, vi } from "vitest";
import { normalizeHex } from "../src/lib/registry/ui/color-picker/index.js";
import { SliderField } from "../src/lib/registry/ui/slider-field/index.js";

// jsdom has no ResizeObserver; Bits UI's slider only uses it for layout measurements.
globalThis.ResizeObserver ??= class {
	observe() {}
	unobserve() {}
	disconnect() {}
} as unknown as typeof ResizeObserver;

let app: ReturnType<typeof mount> | undefined;
afterEach(async () => {
	if (app) await unmount(app);
	app = undefined;
	document.body.innerHTML = "";
});

it("keeps slider and number box in sync and ignores out-of-range or empty typing", () => {
	const form = document.createElement("form");
	document.body.append(form);
	const onValueChange = vi.fn();
	app = mount(SliderField, {
		target: form,
		props: { label: "高度", value: 32, min: 16, max: 96, name: "height", onValueChange },
	});
	flushSync();
	const input = form.querySelector<HTMLInputElement>('[role="spinbutton"]')!;
	const slider = () => form.querySelector<HTMLElement>('[role="slider"]')!;
	// The visible label names the number box.
	expect(form.querySelector("label")!.htmlFor).toBe(input.id);
	expect(slider().getAttribute("aria-valuenow")).toBe("32");
	const type = (text: string) => {
		input.value = text;
		input.dispatchEvent(new Event("input", { bubbles: true }));
		flushSync();
	};
	type("44");
	expect(slider().getAttribute("aria-valuenow")).toBe("44");
	expect(onValueChange).toHaveBeenLastCalledWith(44);
	type("999");
	expect(slider().getAttribute("aria-valuenow")).toBe("44");
	type("");
	expect(slider().getAttribute("aria-valuenow")).toBe("44");
	expect(onValueChange).toHaveBeenCalledTimes(1);
	slider().dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
	flushSync();
	expect(input.value).toBe("45");
	expect(new FormData(form).get("height")).toBe("45");
});

it("normalizes only three- and six-digit hex colors", () => {
	expect(normalizeHex("#ABC")).toBe("#aabbcc");
	expect(normalizeHex(" 1E40AF ")).toBe("#1e40af");
	for (const bad of ["#1e40a", "#12345678", "red", "#ggg", ""])
		expect(normalizeHex(bad)).toBe(undefined);
});
