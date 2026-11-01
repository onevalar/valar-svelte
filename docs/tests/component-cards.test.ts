import path from "node:path";
import { describe, expect, it } from "vitest";
import { readComponentCards } from "../scripts/component-cards.js";
import { buildCatalog, cardMarkdown, llmsSmall } from "../src/lib/registry/catalog.js";
import { REQUIRED_CARDS } from "../src/lib/registry/component-cards.js";

const { cards, components } = readComponentCards(path.resolve("src/lib/registry/ui"));

describe("component cards", () => {
	it("cover every required component", () => {
		const missing = REQUIRED_CARDS.filter((name) => !cards.some((card) => card.name === name));
		expect(missing).toEqual([]);
		const unlisted = components.filter(
			(name) => !(REQUIRED_CARDS as readonly string[]).includes(name)
		);
		expect(unlisted).toEqual([]);
	});

	it("only point to components that exist", () => {
		const broken = cards.flatMap((card) =>
			[
				...card.meta.valar.related,
				...card.meta.valar.whenNotToUse.flatMap((item) => (item.use ? [item.use] : [])),
			]
				.filter((name) => !components.includes(name))
				.map((name) => `${card.name} → ${name}`)
		);
		expect(broken).toEqual([]);
	});

	it("list components without a card instead of dropping them", () => {
		const catalog = buildCatalog(
			cards.filter((card) => card.name !== "accordion"),
			components,
			"http://site"
		);
		expect(catalog.components.length + catalog.missingCards.length).toBe(components.length);
		expect(catalog.missingCards).toEqual(["accordion"]);
		const button = catalog.components.find((c) => c.name === "button")!;
		expect(button.install).toBe("pnpm exec valar-svelte add button");
		expect(button.docs).toBe("http://site/docs/components/button");
	});

	it("render alternatives into the AI-facing text", () => {
		const select = cards.find((card) => card.name === "select")!;
		expect(cardMarkdown(select)).toContain("选项 2–5 个且需要一眼看全：改用 `radio-group`");
		const small = llmsSmall(buildCatalog(cards, components, "http://site"));
		expect(small).toContain("`select`（表单）");
		expect(small).toContain("→radio-group");
	});
});
