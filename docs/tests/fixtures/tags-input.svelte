<script lang="ts">
	import { TagsInput, type TagsInputProps } from "../../src/lib/registry/ui/tags-input/index.js";
	let settings = $state<TagsInputProps>({
		value: ["one", "two"],
		inputValue: "draft",
		name: "tags",
		dir: "rtl",
	});
	export function set(next: Partial<TagsInputProps>) {
		settings = { ...settings, ...next };
	}
</script>

<TagsInput {...settings} />
