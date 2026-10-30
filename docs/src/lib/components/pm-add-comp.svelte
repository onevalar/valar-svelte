<script lang="ts">
	import PMExecute from "./pm-execute.svelte";

	let { name }: { name: string } = $props();
</script>

<PMExecute command={`@valar/svelte-cli add ${name} --cwd /absolute/path/to/your-app`} />

<p class="text-sm text-muted-foreground">本地开发版本：在 Valar 仓库运行，替换目标项目路径。CLI 尚未发布到 npm。<a href="/docs/installation" class="underline">安装说明</a></p>
