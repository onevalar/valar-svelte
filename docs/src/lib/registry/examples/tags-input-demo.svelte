<script lang="ts">
	import { TagsInput } from "$lib/registry/ui/tags-input/index.js";
	let tags = $state(["Svelte", "中文"]);
</script>

<div class="grid w-full max-w-sm gap-3">
	<label for="tags-basic" class="text-sm font-medium">技术标签 / Tags</label>
	<TagsInput
		id="tags-basic"
		bind:value={tags}
		placeholder="输入后按 Enter，或粘贴多项"
		aria-describedby="tags-hint"
	/>
	<p id="tags-hint" class="text-xs text-muted-foreground">
		逗号分隔；空输入时 Backspace 先选中标签，再按一次删除。
	</p>
	<output class="text-sm break-all text-muted-foreground">{JSON.stringify(tags)}</output>
</div>
