---
title: Formsnap
description: 使用 Formsnap、Superforms 和 Zod 构建表单。
links:
  doc: https://formsnap.dev
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/form
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
</script>

表单并不简单。它是 Web 应用中最常见的部分，也是最复杂的部分之一。

设计良好的 HTML 表单具备以下特点：

- 结构清晰，语义正确。
- 易于使用，键盘即可完成操作。
- 具备无障碍支持，使用 ARIA 属性和规范的标签。
- 支持客户端与服务端校验。
- 样式统一，与应用其余部分保持一致。

本指南用 [formsnap](https://formsnap.dev)、[sveltekit-superforms](https://superforms.rocks) 和 [zod](https://zod.dev) 构建表单。

## 特性

`Valar Svelte` 的 `Form` 组件基于 `formsnap` 和 `sveltekit-superforms` 封装，提供以下能力：

- 可组合的表单构建组件。
- 表单字段组件，用于划定表单状态的作用范围。
- 表单校验支持 [Zod](https://zod.dev)，以及 [Superforms](https://superforms.rocks) 支持的其他校验库。
- 按状态为表单字段添加正确的 `aria` 属性。
- 在表单中直接使用 [选择器](/docs/components/select)、[单选按钮组](/docs/components/radio-group)、[开关](/docs/components/switch)、[复选框](/docs/components/checkbox)，以及其他表单组件。

本指南假定你已了解 [Superforms](https://superforms.rocks) 和 [Formsnap](https://formsnap.dev) 的基本用法。如果不熟悉，请先阅读它们的文档。

## 结构

```svelte showLineNumbers
<form>
  <Form.Field>
    <Form.Control>
      <Form.Label />
      <!-- Any Form input component -->
    </Form.Control>
    <Form.Description />
    <Form.FieldErrors />
  </Form.Field>
</form>
```

## 示例

```svelte showLineNumbers
<form method="POST" use:enhance>
  <Form.Field {form} name="email">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Email</Form.Label>
        <Input {...props} bind:value={$formData.email} />
      {/snippet}
    </Form.Control>
    <Form.Description />
    <Form.FieldErrors />
  </Form.Field>
</form>
```

## 安装

<PMAddComp name="form" />

## 用法

<Steps>

### 创建表单 schema

用 Zod schema 描述表单结构。Zod 的用法见 [Zod 文档](https://zod.dev)。示例中把它放在页面组件同目录的 `schema.ts` 里，你也可以放在任意位置。

```ts title="src/routes/settings/schema.ts" showLineNumbers
import { z } from "zod";

export const formSchema = z.object({
  username: z.string().min(2).max(50),
});

export type FormSchema = typeof formSchema;
```

### 配置 load 函数

```ts title="src/routes/settings/+page.server.ts" showLineNumbers
import type { PageServerLoad } from "./$types.js";
import { superValidate } from "sveltekit-superforms";
import { formSchema } from "./schema";
import { zod4 } from "sveltekit-superforms/adapters";

export const load: PageServerLoad = async () => {
  return {
    form: await superValidate(zod4(formSchema)),
  };
};
```

### 创建表单组件

这个示例里，把 load 函数返回的 `form` 作为属性传给组件。为保证类型正确，使用 `sveltekit-superforms` 的 `SuperValidated` 类型，并传入表单 schema 的类型。

```svelte title="src/routes/settings/settings-form.svelte" showLineNumbers
<script lang="ts">
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { formSchema, type FormSchema } from "./schema";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zod4Client } from "sveltekit-superforms/adapters";

  let { form: initialForm }: { form: SuperValidated<Infer<FormSchema>> } =
    $props();

  const form = superForm(initialForm, {
    validators: zod4Client(formSchema),
  });

  const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance>
  <Form.Field {form} name="username">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Username</Form.Label>
        <Input {...props} bind:value={$formData.username} />
      {/snippet}
    </Form.Control>
    <Form.Description>This is your public display name.</Form.Description>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Button>Submit</Form.Button>
</form>
```

展开 `Form.Control` 组件提供的 `attrs` 对象，`name`、`id` 和无障碍属性都会应用到输入框上。`Form.Label` 通过 `for` 属性自动关联输入框，无需另行处理。

### 使用组件

把 load 函数返回数据中的 `form` 传给上面创建的组件。

```svelte title="src/routes/settings/+page.svelte" showLineNumbers
<script lang="ts">
  import type { PageData } from "./$types.js";
  import SettingsForm from "./settings-form.svelte";
  let { data }: { data: PageData } = $props();
</script>

<SettingsForm form={data.form} />
```

### 创建 Action

```ts title="src/routes/settings/+page.server.ts" showLineNumbers {1-2,13-25}
import type { PageServerLoad, Actions } from "./$types.js";
import { fail } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { formSchema } from "./schema";

export const load: PageServerLoad = async () => {
  return {
    form: await superValidate(zod4(formSchema)),
  };
};

export const actions: Actions = {
  default: async (event) => {
    const form = await superValidate(event, zod4(formSchema));
    if (!form.valid) {
      return fail(400, {
        form,
      });
    }
    return {
      form,
    };
  },
};
```

### 完成

到此完成。这个表单类型安全，支持客户端与服务端校验，无障碍完整。

<ComponentPreview name="form-demo">

<div></div>

</ComponentPreview>

</Steps>

## 后续步骤

更多用法见 [Formsnap](https://formsnap.dev) 和 [Superforms](https://superforms.rocks) 文档。

## 示例

其他 `Form` 组件的示例见以下链接：

- [复选框](/docs/components/checkbox#form)
- [日期选择器](/docs/components/date-picker#form)
- [输入框](/docs/components/input#表单)
- [单选按钮组](/docs/components/radio-group#form)
- [选择器](/docs/components/select#form)
- [开关](/docs/components/switch#form)
- [多行输入框](/docs/components/textarea#form)
