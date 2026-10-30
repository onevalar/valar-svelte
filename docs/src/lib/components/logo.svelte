<script lang="ts">
 import type { SVGAttributes } from "svelte/elements";
 let { ...restProps }: SVGAttributes<SVGElement> = $props();
</script>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" class="size-5" aria-hidden="true" {...restProps}><path d="M6 7 16 25 26 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>
