---
title: 问卷
description: 支持单选、多选、自由作答和跳过的多步问卷。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/questionnaire
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";

	let { viewerData } = $props();
	import Step from "$lib/components/step.svelte";
</script>

<ComponentPreview name="questionnaire-demo" align="end">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="questionnaire" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

安装 `@valar/svelte-primitives`：

</Step>

<PMInstall command="@valar/svelte-primitives -D" />

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

```svelte showLineNumbers
<script lang="ts">
  import * as Questionnaire from "$lib/components/ui/questionnaire/index.js";

  const items = [
    {
      name: "direction",
      required: true,
      prompt: "What should we prototype next?",
      description: "Choose a direction or write your own.",
      choices: [
        {
          value: "delegation",
          label: "Delegation",
          description: "Show how work moves to a specialist.",
        },
        {
          value: "questions",
          label: "Question prompts",
          description: "Show choices while the interface waits.",
        },
        { value: "both", label: "Both together" },
      ],
      input: { label: "Another answer", placeholder: "Type another answer…" },
    },
    {
      name: "detail",
      required: false,
      prompt: "How much detail should it include?",
      description: "Skip this if you are not sure yet.",
      choices: [
        { value: "focused", label: "Focused" },
        { value: "complete", label: "Complete flow" },
      ],
    },
  ] as const;

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const answers = new FormData(event.currentTarget as HTMLFormElement);
    // answers.get("direction"), answers.getAll(...) for multiple items.
  }
</script>
```

题目集合只定义一次：传给 `Questionnaire.Root`，由它负责进度、操作和快捷键，再逐项映射到各个部件。

```svelte showLineNumbers
<Questionnaire.Root {items} onSubmit={handleSubmit}>
  <Questionnaire.Progress />
  {#each items as question (question.name)}
    <Questionnaire.Item name={question.name} required={question.required}>
      <Questionnaire.Title>{question.prompt}</Questionnaire.Title>
      <Questionnaire.Description
        >{question.description}</Questionnaire.Description
      >
      <Questionnaire.Choices>
        {#each question.choices as choice (choice.value)}
          <Questionnaire.Choice value={choice.value}>
            <span class="font-medium">{choice.label}</span>
            {#if "description" in choice}
              <span class="text-muted-foreground">{choice.description}</span>
            {/if}
          </Questionnaire.Choice>
        {/each}
        {#if "input" in question}
          <Questionnaire.Input
            aria-label={question.input.label}
            placeholder={question.input.placeholder}
          />
        {/if}
      </Questionnaire.Choices>
      <Questionnaire.Error />
    </Questionnaire.Item>
  {/each}
  <Questionnaire.Actions>
    <Questionnaire.Previous />
    <Questionnaire.Skip />
    <Questionnaire.Next />
    <Questionnaire.Submit />
  </Questionnaire.Actions>
</Questionnaire.Root>
```

## 组合

```text
Questionnaire.Root
├── Questionnaire.Progress
├── Questionnaire.Item
│   ├── Questionnaire.Title
│   ├── Questionnaire.Description
│   ├── Questionnaire.Choices
│   │   ├── Questionnaire.Choice
│   │   │   └── Questionnaire.ChoiceDescription
│   │   └── Questionnaire.Input
│   └── Questionnaire.Error
└── Questionnaire.Actions
    ├── Questionnaire.Previous
    ├── Questionnaire.Skip
    ├── Questionnaire.Next
    └── Questionnaire.Submit
```

问卷负责题目的顺序、当前题目、回答状态、校验、进度和导航。外层页面、卡片、对话框或抽屉负责关闭与取消行为、持久化、传输和分支跳转。

## 服务端渲染

传入 `items`，即可在服务端渲染当前题目、进度、操作和答案快捷键。完整行为见 `@valar/svelte-primitives/questionnaire`。

## 多选

题目接受多个固定答案时，传入 `multiple`。

<ComponentPreview name="questionnaire-multiple" align="end">

<div></div>

</ComponentPreview>

## 自由作答

用户除固定选项外还能给出其他答案时，把 `Questionnaire.Input` 与固定选项组合使用。

<ComponentPreview name="questionnaire-freeform" align="end">

<div></div>

</ComponentPreview>

## 显式跳过

可选题目允许有意不答时，加入 `Questionnaire.Skip`。

<ComponentPreview name="questionnaire-skip" align="end">

<div></div>

</ComponentPreview>

## 快捷键

用 `shortcuts` 为每个答案绑定字母或数字键。

<ComponentPreview name="questionnaire-shortcuts" align="end">

<div></div>

</ComponentPreview>

## 自定义校验

把受控导航与 Zod 等外部 schema 结合，校验失败时回到对应题目并显示错误。

<ComponentPreview name="questionnaire-validation" align="end">

<div></div>

</ComponentPreview>

## 受控用法

由宿主状态控制当前题目，例如回到校验未通过的步骤。

<ComponentPreview name="questionnaire-controlled" align="end">

<div></div>

</ComponentPreview>

## 恢复进度

恢复已保存的当前题目和默认答案，再把改动重置回该保存状态。

<ComponentPreview name="questionnaire-resume" align="end">

<div></div>

</ComponentPreview>

## 条件题目

禁用与用户先前回答无关的题目。

<ComponentPreview name="questionnaire-conditional" align="end">

<div></div>

</ComponentPreview>

## 导航状态

读取题目状态，自行决定是否禁用导航，并自定义操作样式。

<ComponentPreview name="questionnaire-navigation-state" align="end">

<div></div>

</ComponentPreview>

## 自定义进度

用进度条的 `child` 片段构建自定义进度指示器。

<ComponentPreview name="questionnaire-progress" align="end">

<div></div>

</ComponentPreview>

## 题目动画

为当前题目添加动画，同时保持进度和导航位置不变。

<ComponentPreview name="questionnaire-animated" align="end">

<div></div>

</ComponentPreview>

## 卡片

把问卷组合进卡片的插槽，同时保留题目标题和描述的语义。

<ComponentPreview name="questionnaire-card" align="end">

<div></div>

</ComponentPreview>

## 对话框

把问卷放进对话框，取消和关闭行为仍由宿主负责。

<ComponentPreview name="questionnaire-dialog" align="end">

<div></div>

</ComponentPreview>

## 无障碍

`Questionnaire.Item` 渲染 `fieldset`，`Questionnaire.Title` 渲染对应的 `legend`。描述和当前错误都关联到当前题目，校验未通过的题目与答案控件暴露 `aria-invalid`。

固定选项保留原生单选按钮和复选框的行为。进度以具名的 progressbar 暴露，导航使用真实按钮，非当前题目和操作被隐藏并设为 inert。切换成功时焦点移到新的当前题目；校验失败时焦点落在可用的答案控件上。

始终为 `Questionnaire.Input` 提供可访问名称，可来自可见标签、`aria-label` 或 `aria-labelledby`。占位符不能当作标签。

## 无样式版本

`Questionnaire` 的行为来自 `@valar/svelte-primitives` 包。需要自定义结构和样式时，从 `@valar/svelte-primitives/questionnaire` 导入无样式部件。

## API 参考

每个部件的属性、data 属性和渲染状态都定义在 `@valar/svelte-primitives/questionnaire` 的无样式 `Questionnaire` 基础组件上。带样式组件继承对应的无样式属性。导航组件还接受按钮的 `size` 和 `variant` 属性；`Questionnaire.Actions` 只在带样式版本中提供，用于布局。
