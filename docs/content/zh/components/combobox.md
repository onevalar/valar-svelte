---
title: 组合框
description: 带建议列表的自动补全输入框。
component: true
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import CodeCollapsibleWrapper from "$lib/components/code-collapsible-wrapper.svelte";
</script>

<ComponentPreview name="combobox-demo">

<div></div>

</ComponentPreview>

## 安装

组合框由 `<Popover />` 和 `<Command />` 组件组合而成。

安装步骤见[弹出层](/docs/components/popover#安装)和[命令面板](/docs/components/command#安装)组件。

## 用法

<CodeCollapsibleWrapper >

```svelte title="lib/components/example-combobox.svelte"
<script lang="ts">
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import { tick } from "svelte";
  import * as Command from "$lib/components/ui/command/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { Button } from "$lib/components/ui/button/index.js";

  const frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"];

  let open = $state(false);
  let value = $state("");
  let triggerRef = $state<HTMLButtonElement>(null!);

  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  function closeAndFocusTrigger() {
    open = false;
    tick().then(() => {
      triggerRef.focus();
    });
  }
</script>

<Popover.Root bind:open>
  <Popover.Trigger bind:ref={triggerRef}>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="outline"
        class="w-[200px] justify-between font-normal"
        role="combobox"
        aria-expanded={open}
      >
        {value || "Select a framework"}
        <ChevronDownIcon class="text-muted-foreground" />
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-[200px] p-0">
    <Command.Root>
      <Command.Input placeholder="Search framework..." />
      <Command.List>
        <Command.Empty>No items found.</Command.Empty>
        <Command.Group>
          {#each frameworks as framework (framework)}
            <Command.Item
              value={framework}
              data-checked={value === framework}
              onSelect={() => {
                value = framework;
                closeAndFocusTrigger();
              }}
            >
              {framework}
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
```

</CodeCollapsibleWrapper>

## 基础用法

带框架列表的简单组合框。

<ComponentPreview name="combobox-basic">

<div></div>

</ComponentPreview>

## 分组

用 `<Command.Group />` 和 `<Command.Separator />` 给列表项分组。

<ComponentPreview name="combobox-groups">

<div></div>

</ComponentPreview>

## 自定义列表项

在 `<Command.Item />` 内渲染自定义组件。

<ComponentPreview name="combobox-custom">

<div></div>

</ComponentPreview>

## 无效

传入 `aria-invalid` 属性，把组合框标记为无效。

<ComponentPreview name="combobox-invalid">

<div></div>

</ComponentPreview>

## 禁用

传入 `disabled` 属性禁用组合框。

<ComponentPreview name="combobox-disabled">

<div></div>

</ComponentPreview>

## 弹出

在 `<Popover.Trigger />` 上使用 `child` 片段，即可用按钮或其他组件触发组合框。把 `<Command.Input />` 放进 `<Popover.Content />` 内。

<ComponentPreview name="combobox-popup">

<div></div>

</ComponentPreview>
