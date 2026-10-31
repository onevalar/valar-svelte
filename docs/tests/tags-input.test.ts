import { mount, unmount, flushSync } from "svelte";
import { afterEach, expect, it } from "vitest";
import ControlledTags from "./fixtures/tags-input.svelte";
import { TagsInput } from "../src/lib/registry/ui/tags-input/index.js";

let app: ReturnType<typeof mount>;
afterEach(async () => {
	if (app) await unmount(app);
	document.body.innerHTML = "";
});
function type(input: HTMLInputElement, text: string) {
	input.value = text;
	input.dispatchEvent(new InputEvent("input", { bubbles: true }));
	flushSync();
}
function key(input: HTMLInputElement, name: string, composing = false) {
	const event = new KeyboardEvent("keydown", {
		key: name,
		isComposing: composing,
		bubbles: true,
		cancelable: true,
	});
	input.dispatchEvent(event);
	flushSync();
	return event;
}

it("does not add on IME confirmation, then adds once and preserves Enter form behavior", async () => {
	const form = document.createElement("form");
	document.body.append(form);
	app = mount(TagsInput, { target: form, props: { name: "tags", required: true } });
	flushSync();
	const input = form.querySelector<HTMLInputElement>('[type="text"]')!;
	expect(form.checkValidity()).toBe(false);
	input.dispatchEvent(new CompositionEvent("compositionstart"));
	type(input, "中文");
	key(input, "Enter", true);
	expect(new FormData(form).getAll("tags")).toEqual([]);
	input.dispatchEvent(new CompositionEvent("compositionend"));
	key(input, "Enter");
	expect(new FormData(form).getAll("tags")).toEqual([]);
	await Promise.resolve();
	expect(key(input, "Enter").defaultPrevented).toBe(true);
	expect(new FormData(form).getAll("tags")).toEqual(["中文"]);
	expect(form.checkValidity()).toBe(true);
	expect(key(input, "Enter").defaultPrevented).toBe(false);
	key(input, "Backspace");
	expect(new FormData(form).getAll("tags")).toEqual(["中文"]);
	key(input, "Backspace");
	expect(new FormData(form).getAll("tags")).toEqual([]);
});

it("uses one validation path for paste, duplicates and max without losing rejected text", () => {
	const form = document.createElement("form");
	document.body.append(form);
	app = mount(TagsInput, {
		target: form,
		props: { name: "tags", max: 2, validate: (tag) => tag.length > 1 || "Too short" },
	});
	flushSync();
	const input = form.querySelector<HTMLInputElement>('[type="text"]')!;
	const paste = new Event("paste", { cancelable: true, bubbles: true });
	Object.defineProperty(paste, "clipboardData", {
		value: { getData: () => "a, Alpha ,Alpha,Beta,Gamma," },
	});
	input.dispatchEvent(paste);
	flushSync();
	expect(new FormData(form).getAll("tags")).toEqual(["Alpha", "Beta"]);
	expect(input.value).toBe("a,Alpha,Gamma");
	expect(form.checkValidity()).toBe(false);
	type(input, "");
	key(input, "Enter");
	expect(form.checkValidity()).toBe(true);
});

it("supports external updates, RTL selection, readonly, disabled and native reset", async () => {
	const form = document.createElement("form");
	document.body.append(form);
	const controlled = mount(ControlledTags, { target: form });
	app = controlled;
	flushSync();
	const input = form.querySelector<HTMLInputElement>('[type="text"]')!;
	type(input, "");
	input.focus();
	// jsdom does not compute inherited dir; use explicit CSS as the browser does for RTL.
	input.style.direction = "rtl";
	key(input, "ArrowRight");
	key(input, "Delete");
	await Promise.resolve();
	flushSync();
	expect(new FormData(form).getAll("tags")).toEqual(["one"]);
	expect(document.activeElement).toBe(input);
	controlled.set({ value: ["external"], readonly: true });
	flushSync();
	type(input, "new");
	key(input, "Enter");
	expect(new FormData(form).getAll("tags")).toEqual(["external"]);
	controlled.set({ readonly: false, disabled: true });
	flushSync();
	expect(new FormData(form).getAll("tags")).toEqual([]);
	controlled.set({ disabled: false });
	flushSync();
	form.reset();
	await expect.poll(() => input.value).toBe("draft");
	expect(new FormData(form).getAll("tags")).toEqual(["one", "two"]);
	form.reset();
	await expect.poll(() => input.value).toBe("draft");
});
