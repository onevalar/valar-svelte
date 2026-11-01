---
title: 文件树
description: 智能体改动的文件，以文件夹树的形式呈现。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="file-tree-demo" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

文件树把智能体改动的文件呈现为可展开的文件夹。文件夹是[折叠区域](/docs/components/collapsible)，文件是[按钮](/docs/components/button)。若要表示智能体读取或编辑的单个文件，改用[工具调用](/docs/ai-elements/tool)行。

## 安装

文件树基于[折叠区域](/docs/components/collapsible)和[按钮](/docs/components/button)组件构建。

<PMAddComp name="collapsible button" />

## 用法

递归渲染节点。把每个文件夹的子节点嵌套在对应的 `Collapsible.Content` 中。

```svelte showLineNumbers
{#if node.type === "folder"}
  <Collapsible.Root open class="group/folder">
    <Collapsible.Trigger>
      {#snippet child({ props })}
        <Button
          {...props}
          variant="ghost"
          size="sm"
          class="w-full justify-start"
        >
          <ChevronRightIcon
            class="transition-transform group-data-[state=open]/folder:rotate-90"
          />
          <FolderIcon />
          {node.name}
        </Button>
      {/snippet}
    </Collapsible.Trigger>
    <Collapsible.Content>
      <div class="ml-4 flex flex-col">
        {#each node.children as child (child.path)}
          <FileTreeNode node={child} />
        {/each}
      </div>
    </Collapsible.Content>
  </Collapsible.Root>
{/if}
```

```svelte showLineNumbers
<Button
  variant="ghost"
  size="sm"
  class="w-full justify-start"
  onclick={() => onSelect(node.path)}
>
  <FileIcon />
  {node.name}
</Button>
```

见[折叠区域](/docs/components/collapsible#文件树)。
