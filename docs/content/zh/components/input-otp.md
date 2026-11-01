---
title: 一次性密码输入框
description: 可无障碍访问、支持复制粘贴的一次性密码组件。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/input-otp
  doc: https://bits-ui.com/docs/components/pin-input
  api: https://bits-ui.com/docs/components/pin-input#api-reference
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
	import Step from "$lib/components/step.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";

	let { viewerData } = $props();
</script>

<ComponentPreview name="input-otp-demo">

<div></div>

</ComponentPreview>

## 关于

一次性密码输入框基于 Bits UI 的 [PinInput](https://bits-ui.com/docs/components/pin-input) 构建，灵感来自 [@guilherme_rodz](https://twitter.com/guilherme_rodz) 的 Input OTP 组件。

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="input-otp" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

安装 `bits-ui`：

</Step>

<PMInstall command="bits-ui -D" />

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
  import * as InputOTP from "$lib/components/ui/input-otp/index.js";
</script>
```

```svelte showLineNumbers
<InputOTP.Root maxlength={6}>
  {#snippet children({ cells })}
    <InputOTP.Group>
      {#each cells.slice(0, 3) as cell}
        <InputOTP.Slot {cell} />
      {/each}
    </InputOTP.Group>
    <InputOTP.Separator />
    <InputOTP.Group>
      {#each cells.slice(3, 6) as cell}
        <InputOTP.Slot {cell} />
      {/each}
    </InputOTP.Group>
  {/snippet}
</InputOTP.Root>
```

## 模式

用 `pattern` 属性为输入框定义自定义的字符模式。

```svelte showLineNumbers {3,6}
<script lang="ts">
  import * as InputOTP from "$lib/components/ui/input-otp/index.js";
  import { REGEXP_ONLY_DIGITS_AND_CHARS } from "bits-ui";
</script>

<InputOTP.Root maxlength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS}>
  <!-- ... -->
</InputOTP.Root>
```

<ComponentPreview name="input-otp-pattern">

<div></div>

</ComponentPreview>

## 分隔符

用 `<InputOTP.Separator />` 组件在输入分组之间添加分隔符。

<ComponentPreview name="input-otp-separator">

<div></div>

</ComponentPreview>

## 禁用

用 `disabled` 属性禁用输入框。

<ComponentPreview name="input-otp-disabled">

<div></div>

</ComponentPreview>

## 受控用法

用 `bind:value` 控制输入值。

<ComponentPreview name="input-otp-controlled">

<div></div>

</ComponentPreview>

## 无效状态

在插槽上设置 `aria-invalid` 显示错误状态。

<ComponentPreview name="input-otp-invalid">

<div></div>

</ComponentPreview>

## 四位数字

PIN 码的常见形式，使用 `pattern={REGEXP_ONLY_DIGITS}` 属性。

<ComponentPreview name="input-otp-four-digits">

<div></div>

</ComponentPreview>

## 字母数字

用 `REGEXP_ONLY_DIGITS_AND_CHARS` 同时接受字母和数字。

<ComponentPreview name="input-otp-alphanumeric">

<div></div>

</ComponentPreview>

## 表单

<ComponentPreview name="input-otp-form">

<div></div>

</ComponentPreview>
