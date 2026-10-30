<script lang="ts">
	let { title, description }: { title?: string | null; description?: string | null } = $props();
</script>

<div class="flex h-full w-full bg-black text-white" style="font-family: 'Inter Latin'">
	<div class="absolute inset-y-0 start-16 flex w-[1px] border border-dashed border-stone-700"></div>
	<div class="absolute inset-y-0 end-16 flex w-[1px] border border-dashed border-stone-700"></div>
	<div class="absolute inset-x-0 top-16 flex h-[1px] border border-stone-700"></div>
	<div class="absolute inset-x-0 bottom-16 flex h-[1px] border border-stone-700"></div>
	<div class="absolute end-24 bottom-24 flex flex-row text-white">
		<span style="font-size: 48px">Valar / Svelte</span>
	</div>
	<div class="absolute inset-32 flex w-[896px] flex-col justify-center">
		<div
			class="flex flex-grow-1 flex-col justify-center text-[64px] leading-[1.1]"
			style="text-wrap: balance; font-weight: 600; letter-spacing: -0.04em;"
		>
			{title}
		</div>
		<div
			class="flex-grow-1 text-[40px] leading-[1.5] text-stone-400"
			style="font-weight: 500; text-wrap: balance;"
		>
			{description}
		</div>
	</div>
</div>
