import { mount, unmount, flushSync } from "svelte";
import { afterEach, expect, it } from "vitest";
import ControlledNumberField from "./fixtures/number-field.svelte";
import { NumberField } from "../src/lib/registry/ui/number-field/index.js";

let app: ReturnType<typeof mount>;
afterEach(async () => {
	if (app) await unmount(app);
	document.body.innerHTML = "";
});

it("preserves edits, snaps decimal steps, submits numeric values and resets", async () => {
	const form = document.createElement("form");
	document.body.append(form);
	app = mount(NumberField, {
		target: form,
		props: {
			name: "amount",
			defaultValue: 0.3,
			min: -2,
			max: 2,
			step: 0.1,
			"aria-label": "Amount",
		},
	});
	flushSync();
	const input = form.querySelector<HTMLInputElement>('[role="spinbutton"]')!;
	function type(text: string) {
		input.value = text;
		input.dispatchEvent(new Event("input", { bubbles: true }));
		flushSync();
	}
	type("-");
	expect(input.value).toBe("-");
	expect(form.checkValidity()).toBe(false);
	type("-1.");
	expect(input.value).toBe("-1.");
	type("-1.26");
	input.dispatchEvent(new FocusEvent("blur"));
	flushSync();
	expect(input.value).toBe("-1.3");
	expect(new FormData(form).get("amount")).toBe("-1.3");
	input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
	flushSync();
	expect(new FormData(form).get("amount")).toBe("-1.2");
	type("9");
	expect(form.checkValidity()).toBe(false);
	input.dispatchEvent(new FocusEvent("blur"));
	flushSync();
	expect(input.value).toBe("2");
	type("oops");
	input.dispatchEvent(new FocusEvent("blur"));
	flushSync();
	expect(input.value).toBe("oops");
	expect(form.checkValidity()).toBe(false);
	form.reset();
	await expect.poll(() => input.value).toBe("0.3");
	expect(form.checkValidity()).toBe(true);
	form.reset();
	await expect.poll(() => input.value).toBe("0.3");
	type("");
	expect(new FormData(form).get("amount")).toBe("");
});

it("parses localized currency without submitting its display formatting", () => {
	const form = document.createElement("form");
	document.body.append(form);
	app = mount(NumberField, {
		target: form,
		props: {
			name: "price",
			locale: "de-DE",
			step: 0.01,
			formatOptions: { style: "currency", currency: "EUR" },
		},
	});
	flushSync();
	const input = form.querySelector<HTMLInputElement>('[role="spinbutton"]')!;
	input.value = "1.234,56 €";
	input.dispatchEvent(new Event("input", { bubbles: true }));
	input.dispatchEvent(new FocusEvent("blur"));
	flushSync();
	expect(input.value).toBe("1.234,56 €");
	expect(new FormData(form).get("price")).toBe("1234.56");
});

it("handles percent empty, external updates, off-grid stepping and readonly/disabled/reset cancellation", async () => {
	const form = document.createElement("form");
	document.body.append(form);
	const controlled = mount(ControlledNumberField, { target: form });
	app = controlled;
	flushSync();
	const input = form.querySelector<HTMLInputElement>('[role="spinbutton"]')!;
	expect(input.value).toBe("5%");
	input.value = "";
	input.dispatchEvent(new Event("input", { bubbles: true }));
	input.dispatchEvent(new FocusEvent("blur"));
	flushSync();
	expect(new FormData(form).get("rate")).toBe("");
	controlled.set({ value: 18.98, step: 1, formatOptions: {}, locale: "en-US" });
	flushSync();
	input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
	flushSync();
	expect(input.value).toBe("19");
	controlled.set({ value: -1.21, step: 0.1 });
	flushSync();
	input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
	flushSync();
	expect(input.value).toBe("-1.3");
	controlled.set({ value: 0.7, min: 0, max: 2, readonly: true });
	flushSync();
	input.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
	flushSync();
	expect(input.value).toBe("0.7");
	expect(new FormData(form).get("rate")).toBe("0.7");
	controlled.set({ readonly: false, locale: "de-DE" });
	flushSync();
	expect(input.value).toBe("0,7");
	form.addEventListener("reset", (event) => event.preventDefault(), { once: true });
	form.reset();
	await Promise.resolve();
	flushSync();
	expect(input.value).toBe("0,7");
	controlled.set({ disabled: true });
	flushSync();
	expect(new FormData(form).has("rate")).toBe(false);
});
