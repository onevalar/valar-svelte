<script lang="ts">
	import * as CodeBlock from "$lib/registry/ui/code-block/index.js";
	import { useHighlightedCode } from "$lib/registry/hooks/use-highlighted-code.svelte.js";
	import Example from "../../../../../routes/[[lang]]/(app)/(layout)/(create)/components/example.svelte";

	const install = useHighlightedCode(
		() => "pnpm --filter @valar/svelte-cli start add code-block",
		() => "bash"
	);
	const dev = useHighlightedCode(
		() => "pnpm dev",
		() => "bash"
	);
</script>

<Example title="Single Line and Empty">
	<div class="flex flex-col gap-4">
		<CodeBlock.Root>
			<CodeBlock.Header>
				<CodeBlock.Title>Install</CodeBlock.Title>
				<CodeBlock.Actions>
					<CodeBlock.CopyButton value="pnpm --filter @valar/svelte-cli start add code-block" />
				</CodeBlock.Actions>
			</CodeBlock.Header>
			<CodeBlock.Content>
				{#each install.current as line, index (index)}
					<CodeBlock.Line code={line} />
				{/each}
			</CodeBlock.Content>
		</CodeBlock.Root>
		<CodeBlock.Root>
			<CodeBlock.Header>
				<CodeBlock.Title>output.log</CodeBlock.Title>
			</CodeBlock.Header>
			<CodeBlock.Content code="" />
		</CodeBlock.Root>
		<CodeBlock.Root>
			<CodeBlock.Content>
				{#each dev.current as line, index (index)}
					<CodeBlock.Line code={line} />
				{/each}
			</CodeBlock.Content>
		</CodeBlock.Root>
	</div>
</Example>
