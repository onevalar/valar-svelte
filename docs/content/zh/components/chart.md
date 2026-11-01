---
title: 图表
description: 精美的图表。基于 LayerChart 构建，可直接复制到项目中。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/chart
---

<script>
	import * as Alert from "$lib/registry/ui/alert/index.js";
	import TriangleAlertIcon from "@lucide/svelte/icons/triangle-alert";
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import Callout from "$lib/components/callout.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";
	import Step from "$lib/components/step.svelte";

	let { viewerData } = $props();
</script>

<ComponentPreview name="chart-bar-interactive" class="-mt-2 [&_.preview]:p-0 [&_.preview]:border-t [&_.preview>div]:shadow-none [&_.preview]:border-none [&_.preview>div]:w-full [&_.preview]:lg:min-h-[404px] [&_[data-slot='card-footer']]:hidden [&_[data-slot='card']]:py-0 [&_[data-slot='card-header'].border-b]:pb-0 [&_[data-slot='card']]:bg-background [&_[data-slot='card']]:border-none" hideCode>

<div></div>

</ComponentPreview>

全新推出 **图表**：一组可直接复制到项目中的图表组件。

图表默认就有出色的视觉效果，与其他组件搭配良好，也能完全定制，贴合项目需要。

[浏览图表库](/charts)。

## 组件

底层使用 [LayerChart](https://next.layerchart.com)。

设计 `Chart` 组件时以组合为核心。**图表由 LayerChart 组件搭建，只在需要的位置引入 `ChartTooltip` 这类自定义组件。**

```svelte showLineNumbers /Chart.Container/ /Chart.Tooltip/
<script lang="ts">
  import * as Chart from "$lib/components/ui/chart/index.js";
  import { BarChart } from "layerchart";

  const data = [
    // ...
  ];
</script>

<Chart.Container>
  <BarChart {data} x="date" y="value">
    {#snippet tooltip()}
      <Chart.Tooltip />
    {/snippet}
  </BarChart>
</Chart.Container>
```

我们没有封装 LayerChart。这意味着不会被某一层抽象绑住。LayerChart 发布新版本后，按官方升级路径升级图表即可。

**组件归你所有**。

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="chart" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

安装 `layerchart`：

</Step>

<PMInstall command="layerchart@latest -D" />

<Step>

将以下颜色加入 CSS 文件。

</Step>

```css title="src/app.css" showLineNumbers
:root {
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
}

.dark {
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
}

@theme inline {
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
}
```

<Step>

将以下代码复制到项目中。

</Step>

</Steps>
{/snippet}
</InstallTabs>

## 你的第一个图表

先搭建第一个图表：一个带坐标轴、网格、工具提示和图例的柱状图。

<Steps>

### 先定义数据

以下数据表示每月桌面端和移动端的用户数。

<Callout class="mt-4">

**注意：**数据可以是任意结构，不必拘泥于下方示例。用 `dataKey` 属性把数据映射到图表。

</Callout>

```svelte title="lib/components/example-chart.svelte" showLineNumbers
<script lang="ts">
  const chartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
  ];
</script>
```

### 定义图表配置

图表配置保存图表的各项设置。可读的文案、图标以及用于主题的颜色令牌都放在这里。

```svelte title="lib/components/example-chart.svelte" showLineNumbers
<script lang="ts">
  import * as Chart from "$lib/components/ui/chart/index.js";

  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "#2563eb",
    },
    mobile: {
      label: "Mobile",
      color: "#60a5fa",
    },
  } satisfies Chart.ChartConfig;
</script>
```

### 构建图表

接下来用 LayerChart 组件搭建图表。本例使用 `BarChart`，它属于 LayerChart 的“Simplified Charts”。

这类组件会处理大量通用的图表骨架，同时留出完整的定制空间。

{#if viewerData}
<ComponentSource item={viewerData} data-llm-ignore/>
{/if}

<ComponentPreview name="chart-bar-demo" class="[&_.preview]:p-4">

<div></div>

</ComponentPreview>

</Steps>

现在得到了一个带 x 轴和网格的分组柱状图。

### 调整坐标轴刻度

目前 x 轴上每个刻度都显示完整的月份名称，接下来把它缩短为前三个字母。

<Steps>

### 为 x 轴添加自定义格式化函数

通过 `props` 属性，可以向组成图表的各个组件传入自定义属性。这里给 x 轴传入一个自定义格式化函数。

```svelte showLineNumbers {21-25}
<Chart.Container config={chartConfig} class="min-h-[200px] w-full">
  <BarChart
    data={chartData}
    xScale={scaleBand().padding(0.25)}
    x="month"
    axis="x"
    tooltipContext={false}
    seriesLayout="group"
    series={[
      {
        key: "desktop",
        label: chartConfig.desktop.label,
        color: chartConfig.desktop.color,
      },
      {
        key: "mobile",
        label: chartConfig.mobile.label,
        color: chartConfig.mobile.color,
      },
    ]}
    props={{
      xAxis: {
        format: (d) => d.slice(0, 3),
      },
    }}
  />
</Chart.Container>
```

<ComponentPreview name="chart-bar-axis-tick-demo" class="[&_.preview]:p-4">

<div></div>

</ComponentPreview>

</Steps>

### 添加工具提示

到目前为止只用了 LayerChart 的 `BarChart`。得益于 `chart` 组件中的一些定制，它默认的视觉效果已经很出色。

要添加工具提示，使用 `chart` 提供的自定义组件 `Chart.Tooltip`。

<Steps>

### 将 `Chart.Tooltip` 组件添加到图表

把 `tooltipContext={false}` 属性换成 `tooltip` 片段，并在片段中放入 `Chart.Tooltip` 组件。

```svelte showLineNumbers {26-28}
<Chart.Container config={chartConfig} class="min-h-[200px] w-full">
  <BarChart
    data={chartData}
    xScale={scaleBand().padding(0.25)}
    x="month"
    axis="x"
    seriesLayout="group"
    series={[
      {
        key: "desktop",
        label: chartConfig.desktop.label,
        color: chartConfig.desktop.color,
      },
      {
        key: "mobile",
        label: chartConfig.mobile.label,
        color: chartConfig.mobile.color,
      },
    ]}
    props={{
      xAxis: {
        format: (d) => d.slice(0, 3),
      },
    }}
  >
    {#snippet tooltip()}
      <Chart.Tooltip />
    {/snippet}
  </BarChart>
</Chart.Container>
```

<ComponentPreview name="chart-bar-tooltip-demo" class="[&_.preview]:p-4">

<div></div>

</ComponentPreview>

</Steps>

### 添加图例

<Steps>

### 将 `legend` 属性设为 `true`

`legend` 属性用于显示图例。我们正在与 LayerChart 合作，加入类似工具提示的 payload 数据，以便更轻松地创建自定义图例。

```svelte showLineNumbers {8}
<Chart.Container config={chartConfig} class="min-h-[200px] w-full">
  <BarChart
    data={chartData}
    xScale={scaleBand().padding(0.25)}
    x="month"
    axis="x"
    seriesLayout="group"
    legend
    series={[
      {
        key: "desktop",
        label: chartConfig.desktop.label,
        color: chartConfig.desktop.color,
      },
      {
        key: "mobile",
        label: chartConfig.mobile.label,
        color: chartConfig.mobile.color,
      },
    ]}
    props={{
      xAxis: {
        format: (d) => d.slice(0, 3),
      },
    }}
  >
    {#snippet tooltip()}
      <Chart.Tooltip />
    {/snippet}
  </BarChart>
</Chart.Container>
```

<ComponentPreview name="chart-bar-legend-demo" class="[&_.preview]:p-4">

<div></div>

</ComponentPreview>

</Steps>

第一个图表完成了。接下来可以看：

- [主题与颜色](/docs/components/chart#主题定制)
- [工具提示](/docs/components/chart#工具提示)

## 图表配置

图表配置用于定义图表的标签、图标和颜色。

它有意与图表数据解耦。

这样可以在多个图表之间共享配置和颜色令牌。当数据或颜色令牌位于远端，或格式不同时，配置也能独立工作。

```svelte
<script lang="ts">
  import MonitorIcon from "@lucide/svelte/icons/monitor";
  import * as Chart from "$lib/components/ui/chart/index.js";

  const chartConfig = {
    desktop: {
      label: "Desktop",
      icon: MonitorIcon,
      // A color like 'hsl(220, 98%, 61%)' or 'var(--color-name)'
      color: "#2563eb",
      // OR a theme object with 'light' and 'dark' keys
      theme: {
        light: "#2563eb",
        dark: "#dc2626",
      },
    },
  } satisfies Chart.ChartConfig;
</script>
```

## 主题定制

图表内置主题支持。可以使用 CSS 变量（推荐），也可以使用任意格式的颜色值，例如 hex、hsl 或 oklch。

### CSS 变量

<Steps>

### 在 CSS 文件中定义颜色

```css {5-6,13-14} title="src/routes/layout.css" showLineNumbers
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  /* ... */
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... */
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
}
```

### 将颜色加入 `chartConfig`

```svelte {5,9} showLineNumbers
<script lang="ts">
  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "var(--chart-1)",
    },
    mobile: {
      label: "Mobile",
      color: "var(--chart-2)",
    },
  } satisfies Chart.ChartConfig;
</script>
```

</Steps>

### hex、hsl 或 oklch

也可以直接在图表配置中定义颜色，格式随你选择。

```svelte showLineNumbers
<script lang="ts">
  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "#2563eb",
    },
  } satisfies Chart.ChartConfig;
</script>
```

### 使用颜色

要在图表中使用主题颜色，按 `var(--color-KEY)` 的格式引用。

#### 组件

```svelte
<Bar fill="var(--color-desktop)" />
```

#### 图表数据

```ts showLineNumbers
const chartData = [
  { browser: "chrome", visitors: 275, color: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, color: "var(--color-safari)" },
];
```

#### Tailwind

```svelte
<Label class="fill-(--color-desktop)" />
```

## 工具提示

图表工具提示由标签、名称、指示器和数值组成。可以组合这些部分来定制工具提示。

<ComponentPreview name="chart-tooltip-demo" class="[&_.preview]:p-0" hideCode>

<div></div>

</ComponentPreview>

用 `hideLabel`、`hideIndicator` 属性可以开启或关闭其中任意一项，用 `indicator` 属性定制指示器样式。

用 `labelKey` 和 `nameKey` 为工具提示的标签和名称指定自定义键。

图表附带 `<Chart.Tooltip>` 组件，用它可以为图表添加自定义工具提示。

### 属性

用以下属性定制工具提示。

| 属性             | 类型                     | 说明                                        |
| :--------------- | :----------------------- | :------------------------------------------ |
| `labelKey`       | string                   | 用于标签的配置键或数据键。                  |
| `nameKey`        | string                   | 用于名称的配置键或数据键。                  |
| `indicator`      | `dot` `line` 或 `dashed` | 工具提示的指示器样式。                      |
| `hideLabel`      | boolean                  | 是否隐藏标签。                              |
| `hideIndicator`  | boolean                  | 是否隐藏指示器。                            |
| `label`          | string                   | 工具提示的自定义标签。                      |
| `labelFormatter` | function                 | 格式化标签的函数。                          |
| `formatter`      | Snippet                  | 用于灵活渲染工具提示的片段。                |

### 颜色

颜色会自动从图表配置中引用。

### 自定义

要用自定义键作为工具提示的标签和名称，传入 `labelKey` 和 `nameKey` 属性。

```svelte showLineNumbers /browser/
<script lang="ts">
  const chartData = [
    { browser: "chrome", visitors: 187, color: "var(--color-chrome)" },
    { browser: "safari", visitors: 200, color: "var(--color-safari)" },
  ];

  const chartConfig = {
    visitors: {
      label: "Total Visitors",
    },
    chrome: {
      label: "Chrome",
      color: "var(--chart-1)",
    },
    safari: {
      label: "Safari",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;
</script>

<Chart.Tooltip labelKey="visitors" nameKey="browser" />
```

此时标签使用 `Total Visitors`，工具提示名称使用 `Chrome` 和 `Safari`。
