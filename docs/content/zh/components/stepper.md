---
title: 步骤流程
description: 带有校验门禁、异步取消、稳定步骤标识和内容关联的步骤流程。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/stepper
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="stepper-demo"><div></div></ComponentPreview>

## 安装与用法

<PMAddComp name="stepper" />

```svelte
<script lang="ts">
  import { Stepper } from "$lib/components/ui/stepper/index.js";
  let current = $state("details");
  const steps = [
    { id: "details", title: "信息" },
    { id: "confirm", title: "确认" },
  ];
</script>

<Stepper {steps} bind:value={current} beforeChange={() => true}>
  {#snippet children({ step, next, previous, pending })}
    <h3>{step.title}</h3>
    <button onclick={previous}>返回</button>
    <button disabled={pending} onclick={next}>继续</button>
  {/snippet}
</Stepper>
```

每个步骤使用稳定、唯一、非空的 `id`，不是数组索引。默认选择首个可用步骤；`defaultValue` 初始化非绑定用法。`onValueChange` 在实际切换或修复不可用当前项时触发。`ref` 指容器，HTML/ARIA 属性传到容器。

## 带校验的多步表单

<ComponentPreview name="stepper-form"><div></div></ComponentPreview>

`beforeChange(from, to, signal)` 对所有前进操作生效：步骤按钮、Enter/Space、snippet 的 next/goTo、组件导出的 goTo。返回 true 才前进；false 或错误字符串保留原步并提示。抛出/拒绝同样展示错误，可重试。该钩子仅校验前进；返回不校验。

`linear=true` 默认只允许前进相邻一步，不能点未来步骤绕过必需校验；禁用相邻项会阻止前进，不自动跳过。`linear=false` 允许自由跳转，但前进仍需当前步骤校验。业务要同时校验中间步骤时，在 beforeChange 明确执行。

内容区域始终挂载，切换仅 hidden，DOM 输入与组件状态得以保留；移除步骤会卸载该面板，跨移除或跨路由的数据应保存在调用方。面板内使用独立 form，避免隐藏的 required 字段参与同一个大表单的原生校验；通过 beforeChange 校验当前步骤，最后由调用方提交完整数据。

## 异步失败、重试与取消

<ComponentPreview name="stepper-async"><div></div></ComponentPreview>

校验中前进操作不可重入，返回仍可用。返回、外部 value 更新、步骤 id/禁用状态变化、校验函数或 linear/disabled 改变会中止请求；旧结果即使忽略 AbortSignal，也不能推进当前流程。卸载时取消。不要在模板中每次渲染创建新的校验函数；使用稳定函数引用。

**直接给 value 赋值是受信任的应用状态更新，不是受检导航。** 应用需要程序化校验时，用 `bind:this` 获得组件并调用 `await stepper.goTo(id)`、`next()` 或 `previous()`；它们返回是否实际切换。外部 value 改变会使待决结果失效。

## 状态、动态步骤和方向

`StepperStep` 支持 `{ id, title, description?, disabled?, completed?, error? }`。只有通过校验离开的步骤或显式 completed 才显示完成，不根据步骤编号伪造完成状态。当前项删除/禁用时选择原位置之前最近的可用项，无则首个可用项，全禁用则无当前项。

使用原生按钮列表与 `aria-current="step"`，内容 region 与按钮互相关联，切换后聚焦内容区。方向键只移动焦点，Enter/Space 激活；Home/End 到可达首尾。横向按继承的 dir 镜像，纵向使用上下箭头。`orientation="vertical"` 纵向排列；横向在窄屏折为竖排但键盘方向仍以 orientation 为准。

组件只管理流程，不替调用方持久化业务数据、发网络请求或提交表单。完整类型为 StepperProps / StepperStep / StepperContext；验收记录在 `standards/porting-records/stepper-vue-to-svelte.md`。
