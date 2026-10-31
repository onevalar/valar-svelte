import { presetSchema, type ComponentId, type WorkbenchPreset } from "./model.js";

/** Use only inside the isolated preview document, or the installed application's stylesheet. */
export function createWorkbenchCss(preset: WorkbenchPreset): string {
	const v = presetSchema.parse(preset).values;
	const radius = (c: ComponentId) =>
		v[`${c}.inheritRadius`] ? v["global.radius"] : v[`${c}.radius`];
	const motion = (c: ComponentId, key: string) =>
		v[`${c}.inheritMotion`]
			? v[key === "easing" ? "global.easing" : "global.motionDuration"]
			: v[`${c}.${key}`];
	const buttonBg = v["button.inheritColors"] ? v["global.primary"] : v["button.bg"];
	const buttonText = v["button.inheritColors"] ? v["global.primaryForeground"] : v["button.text"];
	const dialogBg = v["dialog.inheritColors"] ? v["global.background"] : v["dialog.background"];
	const tooltipBg = v["tooltip.inheritColors"] ? v["global.foreground"] : v["tooltip.bg"];
	const tooltipText = v["tooltip.inheritColors"] ? v["global.background"] : v["tooltip.text"];
	const tooltipFont = v["tooltip.inheritFontSize"] ? v["global.fontSize"] : v["tooltip.fontSize"];
	// Unlayered rules beat the registry's layered Tailwind utilities. Individual scale and
	// transform animation preserve Dialog's separate translate: -50% -50% centering.
	return `
[data-slot="button"] {
  border-radius: ${radius("button")}px;
  font-size: ${v["global.fontSize"]}px;
  transition: background-color ${motion("button", "duration")}ms ${motion("button", "easing")}, scale ${motion("button", "duration")}ms ${motion("button", "easing")};
}
[data-slot="button"][data-size="default"] {
  height: ${v["button.height"]}px;
  padding-inline: ${v["button.paddingX"]}px;
}
[data-slot="button"][data-variant="default"] {
  background-color: ${buttonBg};
  color: ${buttonText};
}
[data-slot="button"]:hover:not(:disabled):not([aria-disabled="true"]) {
  scale: ${v["button.hoverScale"]};
}
[data-slot="button"][data-variant="default"]:hover:not(:disabled):not([aria-disabled="true"]) { background-color: ${v["button.hoverBg"]}; }
[data-slot="button"]:active:not(:disabled):not([aria-disabled="true"]) { scale: ${v["button.pressedScale"]}; }
[data-slot="dialog-content"] {
  width: ${v["dialog.width"]}px;
  max-width: calc(100vw - 2rem);
  padding: ${v["dialog.padding"]}px;
  border-radius: ${radius("dialog")}px;
  background-color: ${dialogBg};
  color: ${v["global.foreground"]};
  font-size: ${v["global.fontSize"]}px;
  --wb-offset-y: ${v["dialog.offsetY"]}px;
  --wb-scale: ${v["dialog.scale"]};
}
[data-slot="dialog-overlay"] { background-color: rgb(0 0 0 / ${v["dialog.overlayOpacity"]}); }
[data-slot="dialog-content"][data-state="open"] { animation: wb-panel-in ${motion("dialog", "enterDuration")}ms ${motion("dialog", "easing")} both; }
[data-slot="dialog-content"][data-state="closed"] { animation: wb-panel-out ${motion("dialog", "exitDuration")}ms ${motion("dialog", "easing")} both; }
[data-slot="dialog-overlay"][data-state="open"] { animation: wb-fade-in ${motion("dialog", "enterDuration")}ms ${motion("dialog", "easing")} both; }
[data-slot="dialog-overlay"][data-state="closed"] { animation: wb-fade-out ${motion("dialog", "exitDuration")}ms ${motion("dialog", "easing")} both; }
[data-slot="tooltip-content"] {
  border-radius: ${radius("tooltip")}px;
  padding: ${v["tooltip.padding"]}px;
  font-size: ${tooltipFont}px;
  background-color: ${tooltipBg};
  color: ${tooltipText};
  --wb-offset-y: ${v["tooltip.offsetY"]}px;
  --wb-scale: ${v["tooltip.scale"]};
}
[data-slot="tooltip-content"] > div[data-side] { background-color: ${tooltipBg}; fill: ${tooltipBg}; }
[data-slot="tooltip-content"]:is([data-state="delayed-open"], [data-state="instant-open"], [data-state="open"]) { animation: wb-panel-in ${motion("tooltip", "enterDuration")}ms ${motion("tooltip", "easing")} both; }
[data-slot="tooltip-content"][data-state="closed"] { animation: wb-panel-out ${motion("tooltip", "exitDuration")}ms ${motion("tooltip", "easing")} both; }
[data-slot="accordion"] { gap: ${v["accordion.spacing"]}px; color: ${v["global.foreground"]}; font-size: ${v["global.fontSize"]}px; }
[data-slot="accordion-item"] { border: 1px solid ${v["accordion.borderColor"]}; border-radius: ${radius("accordion")}px; }
[data-slot="accordion-trigger"] { padding: ${v["accordion.triggerPadding"]}px; border-radius: ${radius("accordion")}px; font-size: ${v["global.fontSize"]}px; transition: background-color ${motion("accordion", "duration")}ms ${motion("accordion", "easing")}; }
[data-slot="accordion-content"] { font-size: ${v["global.fontSize"]}px; }
[data-slot="accordion-content"] > div { padding: ${v["accordion.contentPadding"]}px; }
[data-slot="accordion-content"][data-state="open"] { animation: wb-accordion-in ${motion("accordion", "duration")}ms ${motion("accordion", "easing")}; }
[data-slot="accordion-content"][data-state="closed"] { animation: wb-accordion-out ${motion("accordion", "duration")}ms ${motion("accordion", "easing")}; }
@keyframes wb-panel-in { from { opacity: 0; transform: translateY(var(--wb-offset-y)); scale: var(--wb-scale); } to { opacity: 1; transform: translateY(0); scale: 1; } }
@keyframes wb-panel-out { from { opacity: 1; transform: translateY(0); scale: 1; } to { opacity: 0; transform: translateY(var(--wb-offset-y)); scale: var(--wb-scale); } }
@keyframes wb-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes wb-fade-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes wb-accordion-in { from { height: 0; } to { height: var(--bits-accordion-content-height); } }
@keyframes wb-accordion-out { from { height: var(--bits-accordion-content-height); } to { height: 0; } }
@media (prefers-reduced-motion: reduce) {
  [data-slot="button"], [data-slot="dialog-content"], [data-slot="dialog-overlay"], [data-slot="tooltip-content"], [data-slot="accordion-content"], [data-slot="accordion-trigger"] { animation: none !important; transition: none !important; }
  [data-slot="button"]:is(:hover, :active) { scale: 1 !important; }
}
`.trim();
}
