<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import LanguagesIcon from "@lucide/svelte/icons/languages";
	import { Button } from "$lib/registry/ui/button/index.js";
	import {
		localeFromPathname,
		translateUrl,
		type Locale,
		localeNames,
	} from "$lib/i18n/config.js";
	import { t } from "$lib/i18n/index.js";
	import { cn } from "$lib/utils.js";

	let { class: className }: { class?: string } = $props();

	const current = $derived(localeFromPathname(page.url.pathname));
	const target: Locale = $derived(current === "zh" ? "en" : "zh");
	const label = $derived(localeNames[target]);

	function switchLocale() {
		goto(translateUrl(page.url, target), { noScroll: true });
	}
</script>

<Button
	variant="ghost"
	size="sm"
	class={cn("extend-touch-target gap-1.5 px-2", className)}
	onclick={switchLocale}
	title={t("footer.switchTo", { language: label })}
	aria-label={t("footer.switchTo", { language: label })}
>
	<LanguagesIcon class="size-4" />
	<span class="text-xs font-medium">{current === "zh" ? "EN" : "中文"}</span>
</Button>
