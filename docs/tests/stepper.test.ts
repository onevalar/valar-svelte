import { mount, unmount, flushSync } from "svelte";
import { afterEach, expect, it } from "vitest";
import StepperFixture from "./fixtures/stepper.svelte";

let app: ReturnType<typeof mount>;
afterEach(async () => {
	if (app) await unmount(app);
	document.body.innerHTML = "";
});
function render() {
	const target = document.createElement("div");
	document.body.append(target);
	const fixture = mount(StepperFixture, { target });
	app = fixture;
	flushSync();
	return fixture;
}
function current() {
	return document.querySelector('[aria-current="step"]')?.textContent?.trim();
}

it("gates clicks and imperative navigation, preserves panels and focuses associated content", async () => {
	const fixture = render();
	fixture.set({ beforeChange: () => "Required" });
	flushSync();
	const buttons = document.querySelectorAll<HTMLButtonElement>('[data-slot="stepper-trigger"]');
	expect(buttons[2].disabled).toBe(true);
	buttons[1].click();
	await expect.poll(() => document.querySelector('[role="alert"]')?.textContent).toBe("Required");
	expect(current()).toContain("Alpha");
	expect(await fixture.goTo("beta")).toBe(false);
	const input = document.querySelector<HTMLInputElement>('[aria-label="Alpha"]')!;
	input.value = "retained";
	fixture.set({ beforeChange: () => true });
	flushSync();
	expect(await fixture.goTo("beta")).toBe(true);
	flushSync();
	const active = document.querySelector('[data-slot="stepper-content"]:not([hidden])')!;
	expect(active.getAttribute("aria-labelledby")).toBe(
		document.querySelector('[aria-current="step"]')?.id
	);
	expect(document.activeElement).toBe(active);
	expect(await fixture.goTo("alpha")).toBe(true);
	flushSync();
	expect(input.value).toBe("retained");
});

it("prevents duplicate pending navigation and discards success after going back", async () => {
	const fixture = render();
	await fixture.goTo("beta");
	flushSync();
	let finish!: (value: boolean) => void;
	let signal!: AbortSignal;
	fixture.set({
		beforeChange: (_from, _to, abort) => {
			signal = abort;
			return new Promise<boolean>((resolve) => {
				finish = resolve;
			});
		},
	});
	flushSync();
	const first = fixture.goTo("gamma");
	flushSync();
	expect(document.querySelector('[aria-busy="true"]')).not.toBeNull();
	expect(await fixture.goTo("gamma")).toBe(false);
	expect(await fixture.goTo("alpha")).toBe(true);
	flushSync();
	expect(signal.aborted).toBe(true);
	finish(true);
	expect(await first).toBe(false);
	flushSync();
	expect(current()).toContain("Alpha");
});

it("invalidates async results on external updates and topology changes and repairs removed current", async () => {
	const fixture = render();
	let finish!: (value: boolean) => void;
	fixture.set({
		beforeChange: () =>
			new Promise<boolean>((resolve) => {
				finish = resolve;
			}),
	});
	flushSync();
	const first = fixture.goTo("beta");
	fixture.set({ value: "gamma" });
	flushSync();
	finish(true);
	expect(await first).toBe(false);
	expect(current()).toContain("Gamma");
	fixture.set({ value: "alpha" });
	flushSync();
	const second = fixture.goTo("beta");
	fixture.set({
		steps: [
			{ id: "alpha", title: "Alpha" },
			{ id: "beta", title: "Beta", disabled: true },
		],
	});
	flushSync();
	finish(true);
	expect(await second).toBe(false);
	expect(current()).toContain("Alpha");
	fixture.set({ steps: [{ id: "beta", title: "Beta" }] });
	flushSync();
	expect(current()).toContain("Beta");
});

it("shows rejected async errors, permits retry, and moves keyboard focus without activation", async () => {
	const fixture = render();
	fixture.set({
		beforeChange: async () => {
			throw new Error("Offline");
		},
		linear: false,
	});
	flushSync();
	expect(await fixture.goTo("gamma")).toBe(false);
	flushSync();
	expect(document.querySelector('[role="alert"]')?.textContent).toBe("Offline");
	const buttons = document.querySelectorAll<HTMLButtonElement>('[data-slot="stepper-trigger"]');
	buttons[0].focus();
	buttons[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
	flushSync();
	expect(document.activeElement).toBe(buttons[1]);
	expect(current()).toContain("Alpha");
	fixture.set({ style: "direction: rtl" });
	flushSync();
	buttons[0].focus();
	buttons[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
	flushSync();
	expect(document.activeElement).toBe(buttons[1]);
	fixture.set({ orientation: "vertical" });
	flushSync();
	buttons[0].focus();
	buttons[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
	flushSync();
	expect(document.activeElement).toBe(buttons[1]);
	expect(current()).toContain("Alpha");
	fixture.set({ beforeChange: () => true });
	flushSync();
	expect(await fixture.goTo("gamma")).toBe(true);
	flushSync();
	expect(current()).toContain("Gamma");
});

it("repairs a removed middle step backwards and associates explicit errors", async () => {
	const fixture = render();
	await fixture.goTo("beta");
	fixture.set({
		steps: [
			{ id: "alpha", title: "Alpha", error: "Review Alpha" },
			{ id: "gamma", title: "Gamma" },
		],
	});
	flushSync();
	expect(current()).toContain("Alpha");
	const alert = document.querySelector('[role="alert"]')!;
	expect(alert.textContent).toBe("Review Alpha");
	expect(document.querySelector('[aria-current="step"]')?.getAttribute("aria-describedby")).toBe(
		alert.id
	);
});

it("aborts a pending validation on unmount and never accepts its late result", async () => {
	const fixture = render();
	let finish!: (value: boolean) => void;
	let signal!: AbortSignal;
	fixture.set({
		beforeChange: (_from, _to, abort) => {
			signal = abort;
			return new Promise<boolean>((resolve) => {
				finish = resolve;
			});
		},
	});
	flushSync();
	const transition = fixture.goTo("beta");
	await unmount(app);
	expect(signal.aborted).toBe(true);
	finish(true);
	expect(await transition).toBe(false);
});
