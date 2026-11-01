---
title: 模型选择器
description: 两个菜单。一个选择智能体运行的模型，另一个选择它的思考强度。
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="model-selector-demo" previewStyle="rhea" previewClassName="h-auto min-h-0">

<div></div>

</ComponentPreview>

## 安装

模型选择器基于[下拉菜单](/docs/components/dropdown-menu)和[输入框组](/docs/components/input-group)构建。

<PMAddComp name="dropdown-menu input-group" />

## 用法

```svelte showLineNumbers
<script lang="ts">
  import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import * as InputGroup from "$lib/components/ui/input-group/index.js";
</script>
```

```svelte showLineNumbers
<InputGroup.Root>
  <InputGroup.Textarea placeholder="Ask the agent to change your code..." />
  <InputGroup.Addon align="block-end">
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <InputGroup.Button {...props} size="sm">
            GPT-5
            <ChevronDownIcon />
          </InputGroup.Button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start">
        <DropdownMenu.RadioGroup bind:value={model}>
          <DropdownMenu.Group>
            <DropdownMenu.Label>OpenAI</DropdownMenu.Label>
            <DropdownMenu.RadioItem value="gpt-5" closeOnSelect>
              GPT-5
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="gpt-5-mini" closeOnSelect>
              GPT-5 mini
            </DropdownMenu.RadioItem>
          </DropdownMenu.Group>
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <InputGroup.Button {...props} size="sm">
            Medium
            <ChevronDownIcon />
          </InputGroup.Button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start">
        <DropdownMenu.RadioGroup bind:value={effort}>
          <DropdownMenu.RadioItem value="low" closeOnSelect>
            Low
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="medium" closeOnSelect>
            Medium
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="high" closeOnSelect>
            High
          </DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
    <InputGroup.Button type="submit" variant="default" class="ml-auto">
      <ArrowUpIcon />
    </InputGroup.Button>
  </InputGroup.Addon>
</InputGroup.Root>
```

## AI SDK

发送消息时一并传入模型和思考强度，在路由中映射为模型和 provider 选项。

```ts showLineNumbers
chat.sendMessage({ text }, { body: { model, effort } });
```

```ts showLineNumbers title="src/routes/api/chat/+server.ts"
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import type { RequestHandler } from "./$types";

const models = {
  "gpt-5": openai("gpt-5"),
  "gpt-5-mini": openai("gpt-5-mini"),
  "claude-sonnet-4-5": anthropic("claude-sonnet-4-5"),
  "claude-haiku-4-5": anthropic("claude-haiku-4-5"),
};

export const POST: RequestHandler = async ({ request }) => {
  const { messages, model, effort } = (await request.json()) as {
    messages: UIMessage[];
    model: keyof typeof models;
    effort: "low" | "medium" | "high";
  };

  const result = streamText({
    model: models[model] ?? models["gpt-5"],
    messages: await convertToModelMessages(messages),
    providerOptions: {
      openai: { reasoningEffort: effort },
      anthropic: { effort },
    },
  });

  return result.toUIMessageStreamResponse();
};
```

每个 provider 只读取 `providerOptions` 中属于自己的键，其余配置忽略。
