<script lang="ts">
	import { Tooltip as TooltipPrimitive } from "bits-ui";

	// Valar: the string below is a style class. A style may give it `delay-<ms>` to set the
	// default show delay; installing inlines it. Empty means 0, as upstream.
	const styleDelay = Number(/\bdelay-(\d+)\b/.exec("cn-tooltip-provider")?.[1] ?? 0);

	let { delayDuration = styleDelay, ...restProps }: TooltipPrimitive.ProviderProps = $props();
</script>

<TooltipPrimitive.Provider {delayDuration} {...restProps} />
