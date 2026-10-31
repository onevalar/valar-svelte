---
title: Tags Input
description: 支持中文输入法、键盘导航、校验和原生表单的标签输入。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/tags-input
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="tags-input-demo"><div></div></ComponentPreview>

## 安装与用法

<PMAddComp name="tags-input" />

```svelte
<script lang="ts">
  import { TagsInput } from "$lib/components/ui/tags-input/index.js";
  let tags = $state<string[]>([]);
  let draft = $state("");
</script>

<label for="topics">主题</label>
<TagsInput
  id="topics"
  name="topics"
  bind:value={tags}
  bind:inputValue={draft}
/>
```

仅依赖 Svelte 和 `cn`，不捆绑自动完成或另一框架运行时。

## 添加与校验

`value: string[]` 与 `inputValue: string` 相互独立。`defaultValue` 初始化非绑定用法；外部数组更新取消标签选择。所有添加路径统一 trim；空白标签拒绝。`allowDuplicates=false` 默认按字符串区分大小写去重；`max=0` 默认无限制。

`delimiter` 默认逗号，可为非空字符串或 RegExp（不要使用捕获分组/零宽分隔符）。`addOnPaste=true` 将粘贴的多项逐项校验，忽略空片段；拒绝的片段保留在草稿，不静默丢弃。`addOnPaste=false` 不自动拆分粘贴文本。`addOnTab`、`addOnBlur` 默认为 false。

`validate(tag)` 返回 true/false 或错误字符串，必须是同步函数。业务异步建议/搜索放在调用方，不改变基础添加合同。`onValueChange` 在数组更新时调用，随后 `onAdd(tag)` / `onRemove(tag)`；`onInvalid(tag, reason)` 报告拒绝。可通过 `removeLabel(tag)` 本地化按钮名称。

## 键盘与输入法

- 非空草稿 Enter 添加并阻止表单提交；空草稿 Enter 可正常提交。开启 addOnTab 后，非空 Tab 添加并保持输入焦点，空 Tab 正常离开。
- 光标位于输入开头且无选区时，Backspace 首次选择末标签，再按 Backspace/Delete 删除；左右键导航，RTL 自动反向。标签被选择时 Home/End 到首/尾，Escape 取消选择并清除错误。
- 组合输入中、keyCode 229，以及 compositionend 同一轮事件都不执行标签命令，防止确认中文时误添加。
- 删除后焦点回到输入，选择相邻标签。原生删除按钮可通过 Tab 操作。`readonly` 禁止添加删除但仍提交，`disabled` 不提交。

## 表单与错误

<ComponentPreview name="tags-input-form"><div></div></ComponentPreview>

标签使用重复的 `name` 字段提交，以 `new FormData(form).getAll("topics")` 读取；不是 CSV 或 JSON 单字段。空数组没有提交字段。`form` 可指定外部表单。`required` 要求至少一个已提交标签，草稿不代替标签；错误通过原生约束校验阻止提交，并显示和关联错误文字。

重置恢复挂载时的标签与草稿，取消 reset 不改变状态；回退数据由调用方保留。HTML/ARIA 属性及输入事件传到 input；`ref` 指向 input，`class` 指向外框。支持长 Unicode 文本换行；不提供虚拟化，适用于合理数量的标签。

来源与验收见仓库 `standards/porting-records/tags-input-vue-to-svelte.md`。
