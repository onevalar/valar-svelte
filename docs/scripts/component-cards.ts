import fs from "node:fs";
import path from "node:path";
import { componentCardSchema, type ComponentCard } from "../src/lib/registry/component-cards.js";

/**
 * Reads every `ui/<name>/meta.json` that carries a Valar card (`meta.valar`) and validates it.
 * An invalid card fails the build with the component name; components without a card are
 * returned in `components` so callers can list them.
 */
export function readComponentCards(uiDir: string): {
	cards: ComponentCard[];
	components: string[];
	rules: Record<string, string>;
} {
	const components = fs
		.readdirSync(uiDir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();
	const cards: ComponentCard[] = [];
	const rules: Record<string, string> = {};
	for (const name of components) {
		const rulesFile = path.join(uiDir, name, "RULES.md");
		if (fs.existsSync(rulesFile)) rules[name] = fs.readFileSync(rulesFile, "utf8");
		const file = path.join(uiDir, name, "meta.json");
		if (!fs.existsSync(file)) continue;
		const json = JSON.parse(fs.readFileSync(file, "utf8"));
		if (!json.meta?.valar) continue;
		const parsed = componentCardSchema.safeParse(json);
		if (!parsed.success)
			throw new Error(`Invalid component card ${name}/meta.json: ${parsed.error.message}`);
		if (parsed.data.name !== name)
			throw new Error(`${name}/meta.json has name "${parsed.data.name}"`);
		cards.push(parsed.data);
	}
	return { cards, components, rules };
}
