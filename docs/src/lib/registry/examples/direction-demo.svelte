<script lang="ts">
	import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Slider } from "$lib/registry/ui/slider/index.js";

	let direction = $state<"ltr" | "rtl">("rtl");
	let value = $state(35);
</script>

<div class="grid w-full max-w-lg gap-5" data-direction-demo>
	<label class="flex items-center gap-3 text-sm">
		Direction
		<select
			aria-label="Direction"
			bind:value={direction}
			class="rounded-md border bg-background p-2"
		>
			<option value="rtl">RTL — العربية</option>
			<option value="ltr">LTR — English</option>
		</select>
	</label>
	<div dir={direction} class="grid gap-5 rounded-lg border p-5">
		<Tabs.Root value="account">
			<Tabs.List aria-label="Direction tabs">
				<Tabs.Trigger value="account">الحساب / Account</Tabs.Trigger>
				<Tabs.Trigger value="security">الأمان / Security</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="account" class="text-sm">اتجاه موروث — inherited direction</Tabs.Content>
			<Tabs.Content value="security" class="text-sm"
				>مفاتيح معكوسة — mirrored arrow keys</Tabs.Content
			>
		</Tabs.Root>
		<div class="grid gap-3">
			<p class="text-sm">القيمة / Value: <output>{value}</output></p>
			<Slider type="single" dir={direction} bind:value aria-label="Direction value" max={100} />
		</div>
		<div class="flex flex-wrap gap-3">
			<Popover.Root>
				<Popover.Trigger>
					{#snippet child({ props })}<Button {...props} variant="outline">弹层 / Popover</Button
						>{/snippet}
				</Popover.Trigger>
				<Popover.Content dir={direction} align="start" class="w-64" aria-label="Direction popover">
					<p class="text-sm">محاذاة البداية / logical start</p>
					<p dir="ltr" class="mt-2 text-sm text-muted-foreground">
						Portal keeps context, not DOM inheritance.
					</p>
				</Popover.Content>
			</Popover.Root>
			<DropdownMenu.Root dir={direction}>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}<Button {...props} variant="outline">菜单 / Menu</Button
						>{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="start">
					<DropdownMenu.Item>الحساب / Account</DropdownMenu.Item>
					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger>المزيد / More</DropdownMenu.SubTrigger>
						<DropdownMenu.SubContent side={direction === "rtl" ? "left" : "right"}>
							<DropdownMenu.Item>الإعدادات / Settings</DropdownMenu.Item>
						</DropdownMenu.SubContent>
					</DropdownMenu.Sub>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
		<pre dir="ltr" class="overflow-x-auto rounded-md bg-muted p-3 text-start text-xs"><code
				>const direction = "ltr";</code
			></pre>
	</div>
</div>
