<script lang="ts">
 import Button from "$lib/registry/ui/button/button.svelte";
 import { siteConfig } from "$lib/config.js";
 import GithubIcon from "./github.svelte";
</script>
<Button href={siteConfig.links.github} target="_blank" rel="noreferrer" size="sm" variant="ghost" aria-label="Valar Svelte GitHub"><GithubIcon /><span class="hidden xl:inline">GitHub</span></Button>
