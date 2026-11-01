<script lang="ts">
	import { tick, type Snippet } from "svelte";
	import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
	import { Button, buttonVariants } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { DROPDOWN_MENU_SPEC } from "./dropdown-menu-tuning.js";

	let { children }: { children: Snippet } = $props();
	// One flag per pane; closing and reopening replays the exit and enter animations.
	let open = $state({ current: true, before: true });
	let statusBar = $state(true);
	// Selecting an item would close the menu; keep it open so the canvas stays inspectable.
	const keep = (event: Event) => event.preventDefault();

	async function replay(pane: "current" | "before") {
		open[pane] = false;
		const content = document.querySelector<HTMLElement>(
			`[data-tuning-${pane}] [data-slot="dropdown-menu-content"]`
		);
		const duration = content ? parseFloat(getComputedStyle(content).animationDuration) * 1000 : 0;
		await new Promise((resolve) => setTimeout(resolve, duration + 120));
		open[pane] = true;
		await tick();
	}
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="flex items-center justify-end gap-2 border-b px-4 py-2">
		<Button size="sm" variant="outline" onclick={() => replay(pane)}>重播进入与退出</Button>
	</div>
	<!--
		A real Dropdown Menu rendered inline: no portal, no focus trap or scroll lock, ignores
		outside clicks, and lets Escape reach the editor. It always opens below the trigger: a
		pane lower in the scrolling editor would otherwise flip the menu out of its box.
		Hover "邀请成员" for the submenu.
	-->
	<div class="menu-canvas" data-menu-canvas>
		<DropdownMenu.Root bind:open={open[pane]}>
			<DropdownMenu.Trigger class={buttonVariants({ variant: "outline" })}
				>账户</DropdownMenu.Trigger
			>
			<DropdownMenu.Content
				portalProps={{ disabled: true }}
				side="bottom"
				avoidCollisions={false}
				trapFocus={false}
				preventScroll={false}
				interactOutsideBehavior="ignore"
				escapeKeydownBehavior="defer-otherwise-ignore"
				onOpenAutoFocus={keep}
				onCloseAutoFocus={keep}
			>
				<DropdownMenu.Group>
					<DropdownMenu.Label>我的账户</DropdownMenu.Label>
					<DropdownMenu.Item onSelect={keep}>
						个人资料<DropdownMenu.Shortcut>⇧⌘P</DropdownMenu.Shortcut>
					</DropdownMenu.Item>
					<DropdownMenu.Item onSelect={keep}>
						账单<DropdownMenu.Shortcut>⌘B</DropdownMenu.Shortcut>
					</DropdownMenu.Item>
					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger>邀请成员</DropdownMenu.SubTrigger>
						<DropdownMenu.SubContent portalProps={{ disabled: true }}>
							<DropdownMenu.Item onSelect={keep}>邮件</DropdownMenu.Item>
							<DropdownMenu.Item onSelect={keep}>消息</DropdownMenu.Item>
						</DropdownMenu.SubContent>
					</DropdownMenu.Sub>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.CheckboxItem bind:checked={statusBar} onSelect={keep}>
						显示状态栏
					</DropdownMenu.CheckboxItem>
					<DropdownMenu.Item inset onSelect={keep}>对齐的缩进项</DropdownMenu.Item>
					<DropdownMenu.Item disabled>API（禁用）</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Item variant="destructive" onSelect={keep}>退出登录</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
{/snippet}

<ComponentTuner spec={DROPDOWN_MENU_SPEC} {canvas}>{@render children()}</ComponentTuner>

<style>
	.menu-canvas {
		position: relative;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		/* The menu floats out of the flow; leave room for the tallest item spacing. */
		min-height: 580px;
		padding: 32px 16px;
		overflow: hidden;
	}
</style>
