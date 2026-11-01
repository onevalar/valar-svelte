---
title: AI 元素
description: 用 Valar Svelte 组件构建智能体界面的模式。
---

<script>
	import LinkedCard from "$lib/components/linked-card.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

AI 元素是构建智能体界面的模式。每种模式都由若干 Valar Svelte 组件组合而成，复制到项目中即可使用。不需要安装任何包，代码归你所有。

[对话](/docs/ai-elements/chat)由[消息滚动容器](/docs/components/message-scroller)中的多个[消息](/docs/ai-elements/message)轮次组成。轮次内智能体执行的步骤，如[推理](/docs/ai-elements/reasoning)、[工具调用](/docs/ai-elements/tool)和[计划](/docs/ai-elements/plan)，都基于[调用链](/docs/components/trace)构建，因此每个步骤的结构一致。

示例使用 [`@ai-sdk/svelte`](https://ai-sdk.dev/docs/getting-started/svelte)。这些模式只读取消息片段，因此可搭配任意消息来源。

## 模式

<div class="mt-6 grid gap-4 sm:grid-cols-2">
  <LinkedCard href="/docs/ai-elements/chain-of-thought" class="items-start gap-1 p-6 text-sm sm:p-6">
    <div class="font-medium">思维链</div>
    <div class="leading-relaxed text-muted-foreground">可展开为智能体执行步骤的摘要。</div>
  </LinkedCard>
  <LinkedCard href="/docs/ai-elements/chat" class="items-start gap-1 p-6 text-sm sm:p-6">
    <div class="font-medium">对话</div>
    <div class="leading-relaxed text-muted-foreground">对话线程。回复流式输出时，消息滚动容器保持当前阅读位置。</div>
  </LinkedCard>
  <LinkedCard href="/docs/ai-elements/checkpoint" class="items-start gap-1 p-6 text-sm sm:p-6">
    <div class="font-medium">检查点</div>
    <div class="leading-relaxed text-muted-foreground">对话中可以返回的位置。</div>
  </LinkedCard>
  <LinkedCard href="/docs/ai-elements/confirmation" class="items-start gap-1 p-6 text-sm sm:p-6">
    <div class="font-medium">确认</div>
    <div class="leading-relaxed text-muted-foreground">工具执行前，请求批准或拒绝的提示。</div>
  </LinkedCard>
  <LinkedCard href="/docs/ai-elements/context" class="items-start gap-1 p-6 text-sm sm:p-6">
    <div class="font-medium">上下文</div>
    <div class="leading-relaxed text-muted-foreground">对话已用掉多少上下文窗口。</div>
  </LinkedCard>
  <LinkedCard href="/docs/ai-elements/file-tree" class="items-start gap-1 p-6 text-sm sm:p-6">
    <div class="font-medium">文件树</div>
    <div class="leading-relaxed text-muted-foreground">智能体改动的文件，以文件夹树呈现。</div>
  </LinkedCard>
  <LinkedCard href="/docs/ai-elements/inline-citation" class="items-start gap-1 p-6 text-sm sm:p-6">
    <div class="font-medium">行内引用</div>
    <div class="leading-relaxed text-muted-foreground">句中的来源标注，悬停时展开。</div>
  </LinkedCard>
  <LinkedCard href="/docs/ai-elements/message" class="items-start gap-1 p-6 text-sm sm:p-6">
    <div class="font-medium">消息</div>
    <div class="leading-relaxed text-muted-foreground">一轮对话。包含用户的消息，以及智能体的回复与其操作。</div>
  </LinkedCard>
  <LinkedCard href="/docs/ai-elements/model-selector" class="items-start gap-1 p-6 text-sm sm:p-6">
    <div class="font-medium">模型选择器</div>
    <div class="leading-relaxed text-muted-foreground">两个菜单。一个选择智能体运行的模型，另一个选择它的思考强度。</div>
  </LinkedCard>
  <LinkedCard href="/docs/ai-elements/plan" class="items-start gap-1 p-6 text-sm sm:p-6">
    <div class="font-medium">计划</div>
    <div class="leading-relaxed text-muted-foreground">智能体打算执行的步骤，以及当前进度。</div>
  </LinkedCard>
  <LinkedCard href="/docs/ai-elements/prompt-input" class="items-start gap-1 p-6 text-sm sm:p-6">
    <div class="font-medium">提示词输入框</div>
    <div class="leading-relaxed text-muted-foreground">带附件和发送按钮的消息输入框。</div>
  </LinkedCard>
  <LinkedCard href="/docs/ai-elements/queue" class="items-start gap-1 p-6 text-sm sm:p-6">
    <div class="font-medium">队列</div>
    <div class="leading-relaxed text-muted-foreground">智能体的待办列表，分为未完成和已完成。</div>
  </LinkedCard>
  <LinkedCard href="/docs/ai-elements/reasoning" class="items-start gap-1 p-6 text-sm sm:p-6">
    <div class="font-medium">推理</div>
    <div class="leading-relaxed text-muted-foreground">智能体流式输出的思考过程。</div>
  </LinkedCard>
  <LinkedCard href="/docs/ai-elements/sources" class="items-start gap-1 p-6 text-sm sm:p-6">
    <div class="font-medium">来源</div>
    <div class="leading-relaxed text-muted-foreground">智能体回复时引用的链接。</div>
  </LinkedCard>
  <LinkedCard href="/docs/ai-elements/stack-trace" class="items-start gap-1 p-6 text-sm sm:p-6">
    <div class="font-medium">堆栈跟踪</div>
    <div class="leading-relaxed text-muted-foreground">失败的工具调用及其堆栈帧。</div>
  </LinkedCard>
  <LinkedCard href="/docs/ai-elements/subagent" class="items-start gap-1 p-6 text-sm sm:p-6">
    <div class="font-medium">子代理</div>
    <div class="leading-relaxed text-muted-foreground">一次子代理运行，包含它的工具调用和结果。</div>
  </LinkedCard>
  <LinkedCard href="/docs/ai-elements/suggestion" class="items-start gap-1 p-6 text-sm sm:p-6">
    <div class="font-medium">建议</div>
    <div class="leading-relaxed text-muted-foreground">简短提示词，一键发送给智能体。</div>
  </LinkedCard>
  <LinkedCard href="/docs/ai-elements/task" class="items-start gap-1 p-6 text-sm sm:p-6">
    <div class="font-medium">任务</div>
    <div class="leading-relaxed text-muted-foreground">智能体执行的步骤，随执行逐步呈现。</div>
  </LinkedCard>
  <LinkedCard href="/docs/ai-elements/terminal" class="items-start gap-1 p-6 text-sm sm:p-6">
    <div class="font-medium">终端</div>
    <div class="leading-relaxed text-muted-foreground">智能体执行的命令，以及流式输出的结果。</div>
  </LinkedCard>
  <LinkedCard href="/docs/ai-elements/test-results" class="items-start gap-1 p-6 text-sm sm:p-6">
    <div class="font-medium">测试结果</div>
    <div class="leading-relaxed text-muted-foreground">智能体运行的一次测试，包含测试套件和失败项。</div>
  </LinkedCard>
  <LinkedCard href="/docs/ai-elements/tool" class="items-start gap-1 p-6 text-sm sm:p-6">
    <div class="font-medium">工具调用</div>
    <div class="leading-relaxed text-muted-foreground">智能体发起的工具调用，从输入到输出。</div>
  </LinkedCard>
</div>

## 开始使用

添加多数模式所依赖的组件：

<PMAddComp name="trace code-block" />

然后打开上面的任一模式，把代码复制到项目中。各页面会列出所需的其他组件。
