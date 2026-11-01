<script lang="ts">
 import Button from "$lib/registry/ui/button/button.svelte";
 import { siteConfig } from "$lib/config.js";
 import GithubIcon from "./github.svelte";
 import { t } from "$lib/i18n/index.js";
</script>
<Button href={siteConfig.links.github} target="_blank" rel="noreferrer" size="sm" variant="ghost" aria-label={t("header.github")}><GithubIcon /><span class="hidden xl:inline">GitHub</span></Button>
