<script lang="ts">
	import { Button } from "$lib/registry/ui/button/index.js";
	import { TagsInput } from "$lib/registry/ui/tags-input/index.js";
	let result = $state("尚未提交");
</script>

<form
	class="grid w-full max-w-sm gap-3"
	onsubmit={(event) => {
		event.preventDefault();
		result = JSON.stringify(new FormData(event.currentTarget).getAll("topics"));
	}}
>
	<label for="tags-form" class="text-sm font-medium">主题（1–3 项，每项至少 2 字）</label>
	<TagsInput
		id="tags-form"
		name="topics"
		required
		max={3}
		validate={(tag) => tag.length >= 2 || "标签至少包含 2 个字符"}
		placeholder="输入主题"
	/>
	<div class="flex gap-2">
		<Button type="submit">提交</Button><Button type="reset" variant="outline">重置</Button>
	</div>
	<output class="text-sm break-all text-muted-foreground">{result}</output>
</form>
