import type { ParamMatcher } from "@sveltejs/kit";

/** English is served from the root, so only `/zh` needs an optional route segment. */
export const match: ParamMatcher = (param: string): boolean => param === "zh";
