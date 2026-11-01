---
title: 侧边栏
description: 可组合、可换主题、可定制的侧边栏组件。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/sidebar
---

<script>
	import ComponentPreview from '$lib/components/component-preview.svelte';
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import Steps from "$lib/components/steps.svelte";
	import Step from "$lib/components/step.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	let { viewerData } = $props();
	import DocsFigure from "$lib/components/docs-figure.svelte";
	import Callout from "$lib/components/callout.svelte";
</script>

<DocsFigure caption="折叠为图标的侧边栏。">
<ComponentPreview type="block" name="demo-sidebar-icon" title="Sidebar" class="w-full">

<div></div>

</ComponentPreview>
</DocsFigure>

侧边栏是最难构建的组件之一。它处在应用的核心位置，内部往往包含大量相互关联的部分。

现在有了一套可靠的基础：可组合、可换主题、可定制。

[浏览区块库](/blocks)。

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="sidebar" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

将以下代码复制到项目中。

</Step>
{#if viewerData}
	<ComponentSource item={viewerData} data-llm-ignore/>
{/if}

</Steps>
{/snippet}
</InstallTabs>

## 用法

```svelte showLineNumbers title="src/routes/+layout.svelte"
<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import AppSidebar from "$lib/components/app-sidebar.svelte";

  let { children } = $props();
</script>

<Sidebar.Provider>
  <AppSidebar />
  <main>
    <Sidebar.Trigger />
    {@render children?.()}
  </main>
</Sidebar.Provider>
```

```svelte showLineNumbers title="src/lib/components/app-sidebar.svelte"
<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
</script>

<Sidebar.Root>
  <Sidebar.Header />
  <Sidebar.Content>
    <Sidebar.Group />
    <Sidebar.Group />
  </Sidebar.Content>
  <Sidebar.Footer />
</Sidebar.Root>
```

## 结构

- **Sidebar.Provider** — 管理侧边栏的折叠状态，并向子组件提供侧边栏上下文。
- **Sidebar.Root** — 侧边栏主体的可折叠面板。
- **Sidebar.Header** — 固定在顶部；用于品牌标识、标题或工作区切换。
- **Sidebar.Footer** — 固定在底部；用于用户菜单、设置或操作。
- **Sidebar.Content** — 位于顶部与底部区域之间的可滚动区域。
- **Sidebar.Group** — 将相关导航归为一组，可带标签、操作与内容区域。
- **Sidebar.Menu** / **Sidebar.MenuItem** — 菜单结构，用于链接、徽标、操作与嵌套子菜单。
- **Sidebar.Rail** — 用于调整侧边栏宽度的拖拽滑轨。
- **Sidebar.Inset** — 使用 `inset` 变体时包裹主内容。
- **Sidebar.Trigger** — 切换侧边栏展开或折叠的控件。

<img src="/img/sidebar/sidebar-structure.png" width="716" height="420" alt="侧边栏结构" class="border dark:hidden rounded-lg overflow-hidden mt-6 w-full" />

<img src="/img/sidebar/sidebar-structure-dark.png" width="716" height="420" alt="侧边栏结构" class="border hidden dark:block rounded-lg overflow-hidden mt-6 w-full" />

## Sidebar.Provider

`Sidebar.Provider` 组件用于向 `Sidebar.Root` 组件提供侧边栏上下文。整个应用应始终包裹在 `Sidebar.Provider` 中。

### 属性

| 属性           | 类型                      | 说明                                                                           |
| -------------- | ------------------------- | ------------------------------------------------------------------------------ |
| `open`         | `boolean`                 | 侧边栏的展开状态，可绑定。                                                     |
| `onOpenChange` | `(open: boolean) => void` | 回调。非受控时在侧边栏展开状态变化之后触发，受控时在侧边栏展开或关闭之前触发。 |

### 宽度

应用中只有一个侧边栏时，可用 `constants.ts` 里的 `SIDEBAR_WIDTH` 和 `SIDEBAR_WIDTH_MOBILE` 常量设置侧边栏宽度。

```ts showLineNumbers title="src/lib/components/ui/sidebar/constants.ts"
export const SIDEBAR_WIDTH = "16rem";
export const SIDEBAR_WIDTH_MOBILE = "18rem";
```

应用中有多个侧边栏时，通过 `style` 属性里的 `--sidebar-width` 和 `--sidebar-width-mobile` CSS 变量分别设置。

```svelte showLineNumbers
<Sidebar.Provider
  style="--sidebar-width: 20rem; --sidebar-width-mobile: 20rem;"
>
  <Sidebar.Root />
</Sidebar.Provider>
```

### 键盘快捷键

Mac 上用 `cmd+b`、Windows 上用 `ctrl+b` 快捷键触发侧边栏。

```ts showLineNumbers title="src/lib/components/ui/sidebar/constants.ts"
export const SIDEBAR_KEYBOARD_SHORTCUT = "b";
```

## Sidebar.Root

`Sidebar.Root` 是渲染可折叠侧边栏的主组件。

### 属性

| 属性          | 类型                              | 说明               |
| ------------- | --------------------------------- | ------------------ |
| `side`        | `left` or `right`                 | 侧边栏所在的一侧。 |
| `variant`     | `sidebar`, `floating`, or `inset` | 侧边栏的变体。     |
| `collapsible` | `offcanvas`, `icon`, or `none`    | 侧边栏的折叠方式。 |

| 属性        | 说明                             |
| ----------- | -------------------------------- |
| `offcanvas` | 从左侧或右侧滑入的可折叠侧边栏。 |
| `icon`      | 折叠为图标的侧边栏。             |
| `none`      | 不可折叠的侧边栏。               |

<Callout>

**注意：** 使用 `inset` 变体时，记得用 `Sidebar.Inset` 组件包裹主内容。

</Callout>

```svelte showLineNumbers
<Sidebar.Provider>
  <Sidebar.Root variant="inset" />
  <Sidebar.Inset>
    <main>
      {@render children?.()}
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
```

## useSidebar

`useSidebar` 函数用于控制侧边栏。它返回响应式类实例，因此不能解构；同时必须在组件生命周期内调用。

```svelte showLineNumbers
<script lang="ts">
  import { useSidebar } from "$lib/components/ui/sidebar/index.js";

  const sidebar = useSidebar();

  sidebar.state;
  sidebar.open;
  sidebar.setOpen(true);
  sidebar.openMobile;
  sidebar.setOpenMobile(true);
  sidebar.isMobile;
  sidebar.toggle();
</script>
```

| 属性            | 类型                      | 说明                               |
| --------------- | ------------------------- | ---------------------------------- |
| `state`         | `expanded` or `collapsed` | 侧边栏的当前状态。                 |
| `open`          | `boolean`                 | 侧边栏是否展开。                   |
| `setOpen`       | `(open: boolean) => void` | 设置侧边栏的展开状态。             |
| `openMobile`    | `boolean`                 | 移动端侧边栏是否展开。             |
| `setOpenMobile` | `(open: boolean) => void` | 设置移动端侧边栏的展开状态。       |
| `isMobile`      | `boolean`                 | 是否为移动端。                     |
| `toggle`        | `() => void`              | 切换侧边栏，桌面端与移动端均适用。 |

## Sidebar.Header

用 `Sidebar.Header` 组件在侧边栏顶部添加固定区域。

```svelte showLineNumbers title="src/lib/components/app-sidebar.svelte"
<Sidebar.Root>
  <Sidebar.Header>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            {#snippet child({ props })}
              <Sidebar.MenuButton {...props}>
                Select Workspace
                <ChevronDown class="ms-auto" />
              </Sidebar.MenuButton>
            {/snippet}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>
              <span>Acme Inc</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>
</Sidebar.Root>
```

## Sidebar.Footer

用 `Sidebar.Footer` 组件在侧边栏底部添加固定区域。

```svelte showLineNumbers
<Sidebar.Root>
  <Sidebar.Footer>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton>
          <User2 /> Username
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Footer>
</Sidebar.Root>
```

## Sidebar.Content

`Sidebar.Content` 组件用于包裹侧边栏的内容，`Sidebar.Group` 组件就放在这里。该区域可滚动。

```svelte showLineNumbers
<Sidebar.Root>
  <Sidebar.Content>
    <Sidebar.Group />
    <Sidebar.Group />
  </Sidebar.Content>
</Sidebar.Root>
```

## Sidebar.Group

用 `Sidebar.Group` 组件在侧边栏内创建分区。

一个 `Sidebar.Group` 包含 `Sidebar.GroupLabel`、`Sidebar.GroupContent`，以及可选的 `Sidebar.GroupAction`。

```svelte showLineNumbers
<Sidebar.Group>
  <Sidebar.GroupLabel>Application</Sidebar.GroupLabel>
  <Sidebar.GroupAction>
    <Plus /> <span class="sr-only">Add Project</span>
  </Sidebar.GroupAction>
  <Sidebar.GroupContent></Sidebar.GroupContent>
</Sidebar.Group>
```

要让 `Sidebar.Group` 可折叠，用 `Collapsible` 包裹。

```svelte showLineNumbers
<Collapsible.Root open class="group/collapsible">
  <Sidebar.Group>
    <Sidebar.GroupLabel>
      {#snippet child({ props })}
        <Collapsible.Trigger {...props}>
          Help
          <ChevronDown
            class="ms-auto transition-transform group-data-[state=open]/collapsible:rotate-180"
          />
        </Collapsible.Trigger>
      {/snippet}
    </Sidebar.GroupLabel>
    <Collapsible.Content>
      <Sidebar.GroupContent />
    </Collapsible.Content>
  </Sidebar.Group>
</Collapsible.Root>
```

## Sidebar.Menu

`Sidebar.Menu` 组件用于在 `Sidebar.Group` 内构建菜单。

<img src="/img/sidebar/sidebar-menu.png" width="716" height="420" alt="侧边栏菜单" class="border dark:hidden rounded-lg overflow-hidden mt-6 w-full" />

<img src="/img/sidebar/sidebar-menu-dark.png" width="716" height="420" alt="侧边栏菜单" class="border hidden dark:block rounded-lg overflow-hidden mt-6 w-full" />

```svelte showLineNumbers
<Sidebar.Menu>
  {#each projects as project (project.name)}
    <Sidebar.MenuItem>
      <Sidebar.MenuButton>
        {#snippet child({ props })}
          <a href={project.url} {...props}>
            <project.icon />
            <span>{project.name}</span>
          </a>
        {/snippet}
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  {/each}
</Sidebar.Menu>
```

## Sidebar.MenuButton

`Sidebar.MenuButton` 组件用于在 `Sidebar.MenuItem` 内渲染菜单按钮。

默认渲染为按钮，也可以传入 `child` 片段渲染其他元素，例如 `<a>` 标签。

传入 `isActive` 属性可将菜单项标记为激活状态。

```svelte showLineNumbers
<Sidebar.MenuButton isActive>
  {#snippet child({ props })}
    <a href="##" {...props}>Home</a>
  {/snippet}
</Sidebar.MenuButton>
```

## Sidebar.MenuAction

`Sidebar.MenuAction` 组件用于在 `Sidebar.MenuItem` 内渲染菜单操作。

```svelte showLineNumbers
<Sidebar.MenuItem>
  <Sidebar.MenuButton>
    {#snippet child({ props })}
      <a href="##" {...props}>
        <House />
        <span>Home</span>
      </a>
    {/snippet}
  </Sidebar.MenuButton>
  <Sidebar.MenuAction>
    <Plus /> <span class="sr-only">Add Project</span>
  </Sidebar.MenuAction>
</Sidebar.MenuItem>
```

## Sidebar.MenuSub

`Sidebar.MenuSub` 组件用于在 `Sidebar.Menu` 内渲染子菜单。

```svelte showLineNumbers
<Sidebar.MenuItem>
  <Sidebar.MenuButton />
  <Sidebar.MenuSub>
    <Sidebar.MenuSubItem>
      <Sidebar.MenuSubButton />
    </Sidebar.MenuSubItem>
  </Sidebar.MenuSub>
</Sidebar.MenuItem>
```

## Sidebar.MenuBadge

`Sidebar.MenuBadge` 组件用于在 `Sidebar.MenuItem` 内渲染徽标。

```svelte showLineNumbers
<Sidebar.MenuItem>
  <Sidebar.MenuButton />
  <Sidebar.MenuBadge>24</Sidebar.MenuBadge>
</Sidebar.MenuItem>
```

## Sidebar.MenuSkeleton

`Sidebar.MenuSkeleton` 组件用于为 `Sidebar.Menu` 渲染骨架屏。

```svelte showLineNumbers
<Sidebar.Menu>
  {#each Array.from({ length: 5 }) as _, index (index)}
    <Sidebar.MenuItem>
      <Sidebar.MenuSkeleton />
    </Sidebar.MenuItem>
  {/each}
</Sidebar.Menu>
```

## Sidebar.Trigger

用 `Sidebar.Trigger` 组件渲染一个切换侧边栏的按钮。

```svelte showLineNumbers
<script lang="ts">
  import { useSidebar } from "$lib/components/ui/sidebar/index.js";

  const sidebar = useSidebar();
</script>

<button onclick={() => sidebar.toggle()}>Toggle Sidebar</button>
```

## Sidebar.Rail

`Sidebar.Rail` 组件用于在 `Sidebar.Root` 内渲染滑轨。滑轨也能用来切换侧边栏。

```svelte showLineNumbers
<Sidebar.Root>
  <Sidebar.Header />
  <Sidebar.Content>
    <Sidebar.Group />
  </Sidebar.Content>
  <Sidebar.Footer />
  <Sidebar.Rail />
</Sidebar.Root>
```

## 受控侧边栏

用 `bind:open` 控制侧边栏。

```svelte showLineNumbers
<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";

  let open = $state(false);
</script>

<Sidebar.Provider bind:open>
  <Sidebar.Root />
</Sidebar.Provider>
```

## 主题定制

侧边栏的主题由以下 CSS 变量定义。

```css
:root {
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.439 0 0);
}
```

## 样式

以下是一些按不同状态为侧边栏编写样式的技巧。

```svelte
<Sidebar.Root collapsible="icon">
  <Sidebar.Content>
    <Sidebar.Group class="group-data-[collapsible=icon]:hidden" />
  </Sidebar.Content>
</Sidebar.Root>
```

```svelte
<Sidebar.MenuItem>
  <Sidebar.MenuButton />
  <Sidebar.MenuAction
    class="peer-data-[active=true]/menu-button:opacity-100"
  />
</Sidebar.MenuItem>
```
