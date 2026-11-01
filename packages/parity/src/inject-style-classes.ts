import { twMerge } from "cn";
import { stripParityIgnoreComments } from "./parity-ignore.ts";

const SKIP_CN_CLASSES = new Set([
	"cn-menu-translucent",
	"cn-menu-target",
	"cn-logical-sides",
	"cn-rtl-flip",
	"cn-font-heading",
	// Upstream only inlines cn-* on className / cva / mergeProps.
	// These tokens live on other properties (toastOptions.classes.toast,
	// InputOTP containerClassName) so published JSON keeps the token.
	"cn-toast",
	"cn-input-otp",
]);

/**
 * Tailwind arbitrary `calc()` values treat spaces as `_`.
 * `calc(-50%-2px)` and `calc(-50%_-_2px)` compile the same; upstream
 * output uses the underscored form.
 *
 * Hyphens inside `var(--custom-property)` are part of the ident, not
 * minus operators — those must not be spaced.
 */
export function toTailwindArbitraryCalc(value: string): string {
	return value.replace(/\[calc\(([^[\]]+)\)\]/g, (_match, expr: string) => {
		const vars: string[] = [];
		const protectedExpr = expr.replace(/var\((--[\w-]+)\)/g, (raw) => {
			vars.push(raw);
			return `§§${vars.length - 1}§§`;
		});
		const spaced = protectedExpr
			.replaceAll("_", " ")
			.replace(/(?<=[\w%)§])\s*([+*/-])\s*(?=\S)/g, " $1 ")
			.replace(/\s+/g, " ")
			.trim();
		const restored = spaced.replace(/§§(\d+)§§/g, (_m, i: string) => vars[Number(i)]!);
		return `[calc(${restored.replaceAll(" ", "_")})]`;
	});
}

function shouldInlineToken(className: string): boolean {
	if (SKIP_CN_CLASSES.has(className)) return false;
	if (className.endsWith("-logical")) return false;
	return true;
}

function subjectCnClass(selector: string): string | undefined {
	const matches = [...selector.matchAll(/(?:^|[\s.>+~])(cn-[\w-]+)/g)];
	return matches.at(-1)?.[1];
}

/**
 * Last `cn-*` ident in a selector, then merge `@apply` lists like upstream's
 * `createStyleMap`. This is the single implementation used by the docs
 * registry build and the docs site. The published CLI keeps its own
 * postcss-based copy in `packages/cli/src/utils/registry/index.ts` so it
 * does not depend on this private package; keep the two in sync.
 */
export function parseStyleCss(css: string): Record<string, string> {
	const styles: Record<string, string> = {};
	walkStyleRules(css.replace(/\/\*[\s\S]*?\*\//g, ""), styles);
	return styles;
}

/**
 * Layer Valar's own style customizations (`styles/valar/style-*.css`) over the verbatim
 * upstream map. Conflicting utilities are resolved by tailwind-merge so the override wins
 * (`h-8` + `h-11` → `h-11`) while unrelated utilities and variants stay in place.
 */
export function mergeStyleMaps(
	base: Record<string, string>,
	override: Record<string, string>
): Record<string, string> {
	const merged = { ...base };
	for (const [className, classes] of Object.entries(override)) {
		merged[className] = base[className] ? mergeClasses(base[className], classes) : classes;
	}
	return merged;
}

/**
 * Utility groups tailwind-merge does not know: tw-animate's zoom and Valar's motion tiers
 * (`duration-normal`, `ease-enter`). Without this, `zoom-in-95` + `zoom-in-90` both survive
 * and the winner depends on CSS order.
 */
const EXTRA_GROUPS = [/^zoom-in(?:-|$)/, /^zoom-out(?:-|$)/, /^duration-/, /^ease-/];

/** Splits `data-open:zoom-in-95` into its variant prefix and utility, ignoring `:` inside `[]`. */
function splitVariant(token: string): [string, string] {
	let depth = 0;
	for (let i = token.length - 1; i >= 0; i--) {
		const char = token[i];
		if (char === "]") depth++;
		else if (char === "[") depth--;
		else if (char === ":" && depth === 0) return [token.slice(0, i + 1), token.slice(i + 1)];
	}
	return ["", token];
}

const groupKey = (token: string) => {
	const [variant, utility] = splitVariant(token);
	const group = EXTRA_GROUPS.findIndex((pattern) => pattern.test(utility));
	return group === -1 ? undefined : `${variant}#${group}`;
};

/** tailwind-merge plus the groups above: later classes replace earlier ones of the same kind. */
export function mergeClasses(base: string, override: string): string {
	const replaced = new Set(override.split(/\s+/).flatMap((token) => groupKey(token) ?? []));
	const kept = base
		.split(/\s+/)
		.filter((token) => {
			const key = groupKey(token);
			return !key || !replaced.has(key);
		})
		.join(" ");
	return twMerge(kept, override);
}

function walkStyleRules(css: string, styles: Record<string, string>) {
	let i = 0;
	while (i < css.length) {
		const open = css.indexOf("{", i);
		if (open === -1) return;
		const selector = css.slice(i, open).trim();
		const close = matchingBrace(css, open);
		if (close === -1) return;
		const body = css.slice(open + 1, close);
		if (!selector.startsWith("@") || selector.startsWith("@apply")) {
			const apply = immediateApply(body);
			if (apply) {
				for (const part of selector.split(",")) {
					const className = subjectCnClass(part.trim());
					if (!className) continue;
					styles[className] = styles[className] ? `${apply} ${styles[className]}` : apply;
				}
			}
		}
		walkStyleRules(body, styles);
		i = close + 1;
	}
}

function matchingBrace(css: string, open: number): number {
	let depth = 0;
	for (let i = open; i < css.length; i++) {
		if (css[i] === "{") depth++;
		else if (css[i] === "}") {
			depth--;
			if (depth === 0) return i;
		}
	}
	return -1;
}

function immediateApply(body: string): string {
	let direct = "";
	let depth = 0;
	for (const char of body) {
		if (char === "{") depth++;
		else if (char === "}") depth = Math.max(0, depth - 1);
		else if (depth === 0) direct += char;
	}
	// Upstream occasionally omits the `;` on the last `@apply` before `}`.
	return [...direct.matchAll(/@apply\s+([^;]+?)\s*(?:;|$)/g)]
		.map((match) => match[1]!.trim())
		.filter(Boolean)
		.join(" ");
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type PreparedEntry = {
	className: string;
	classes: string;
	tokenRegex: RegExp;
	dedupeRegex: RegExp | undefined;
};

type PreparedStyleMap = {
	/** Inlineable entries, longest token first, with their regexes compiled once. */
	entries: PreparedEntry[];
	/**
	 * Whether any `@apply` list itself contains a `cn-*` token. If so, a replacement can
	 * introduce a token for a later entry, and we must iterate every entry for every file.
	 */
	valuesContainTokens: boolean;
};

const preparedStyleMaps = new WeakMap<Record<string, string>, PreparedStyleMap>();

/**
 * The style map is shared across every file in a registry build, so the sorted entry
 * list and per-entry regexes are computed once per map rather than once per file.
 */
function prepareStyleMap(styleMap: Record<string, string>): PreparedStyleMap {
	const cached = preparedStyleMaps.get(styleMap);
	if (cached) return cached;

	const entries = Object.entries(styleMap)
		.filter(([className]) => shouldInlineToken(className))
		.sort(([a], [b]) => b.length - a.length)
		.map(([className, rawClasses]): PreparedEntry => {
			const classes = toTailwindArbitraryCalc(rawClasses);
			return {
				className,
				classes,
				tokenRegex: new RegExp(`(?<![\\w-])${escapeRegExp(className)}(?![\\w-])`, "g"),
				dedupeRegex: classes
					? new RegExp(`(?<![\\w-])(?:${escapeRegExp(classes)}\\s*){2,}(?![\\w-])`, "g")
					: undefined,
			};
		});

	const prepared: PreparedStyleMap = {
		entries,
		valuesContainTokens: entries.some((entry) => entry.classes.includes("cn-")),
	};
	preparedStyleMaps.set(styleMap, prepared);
	return prepared;
}

/**
 * Replace `cn-*` tokens with the matching style `@apply` utilities.
 *
 * Tokens must be matched as whole class names (longest first) so
 * `cn-attachment` does not rewrite `cn-attachment-media-variant-icon`.
 * Unmapped `cn-*` tokens are stripped, and immediately repeated injected
 * utilities are collapsed — otherwise inlined output repeats CSS that is
 * already on the component (e.g. Attachment.Trigger).
 *
 * Only the entries whose token actually appears in `content` are processed. Most
 * registry files contain no `cn-*` token at all, and those that do use a handful of
 * the ~400 mappings, so this avoids hundreds of full-content regex passes per file.
 *
 * `parity-ignore` comments are removed so they never ship in registry JSON.
 */
export function injectStyleClasses(content: string, styleMap: Record<string, string>): string {
	content = stripParityIgnoreComments(content);
	const { entries, valuesContainTokens } = prepareStyleMap(styleMap);

	// `cn-[\w-]+` is greedy, so each match is a whole token: exactly what `tokenRegex`
	// (bounded by non-word, non-hyphen characters) can match.
	const presentTokens = new Set(content.match(/cn-[\w-]+/g));

	for (const entry of entries) {
		if (!valuesContainTokens && !presentTokens.has(entry.className)) continue;
		content = content.replace(entry.tokenRegex, entry.classes);
		if (entry.dedupeRegex) content = content.replace(entry.dedupeRegex, entry.classes);
	}

	content = content.replace(/(?<![\w-])(cn-[\w-]+)(?![\w-])/g, (token) =>
		SKIP_CN_CLASSES.has(token) ? token : ""
	);

	content = content.replace(
		/(")([^"\\]*)(")/g,
		(_match, open: string, body: string, close: string) =>
			`${open}${body.replace(/ {2,}/g, " ").trim()}${close}`
	);

	content = content.replace(/cn\(\s*""\s*,\s*/g, "cn(");

	return toTailwindArbitraryCalc(content);
}

/**
 * Valar global tokens: hard-coded motion utilities from upstream styles and component source,
 * rewritten to the token utilities defined in `@valar/svelte-cli/tailwind.css`. The token
 * defaults equal these literals, so output looks the same until a token is changed on `/themes`.
 * Applied after `injectStyleClasses` wherever Valar ships components (registry build and the
 * docs' flattened components); `injectStyleClasses` itself stays an upstream-parity transform.
 * Values without a token (e.g. `duration-150`, `duration-1000`, `ease-linear`) stay literal.
 */
export const TOKEN_UTILITIES: Record<string, string> = {
	"duration-100": "duration-fast",
	"duration-200": "duration-normal",
	"duration-300": "duration-slow",
	"ease-[cubic-bezier(0.22,1,0.36,1)]": "ease-enter",
	// Visually the same curve as the one above (upstream uses both).
	"ease-[cubic-bezier(0.23,1,0.32,1)]": "ease-enter",
	"ease-[cubic-bezier(0.7,0,0.84,0)]": "ease-exit",
	"ease-in-out": "ease-standard",
};

const TOKEN_UTILITY_REGEX = new RegExp(
	// A whole class token, optionally after variants (`data-closed:`), never part of a longer one.
	`(?<=^|[\\s"'\`:])(${Object.keys(TOKEN_UTILITIES)
		.map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
		.join("|")})(?=$|[\\s"'\`])`,
	"g"
);

export function applyTokenUtilities(content: string): string {
	return content.replace(TOKEN_UTILITY_REGEX, (token) => TOKEN_UTILITIES[token]!);
}
