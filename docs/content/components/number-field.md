---
title: Number Field
description: 可编辑、可步进的本地化数值输入，保留输入中间状态并支持原生表单。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/number-field
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="number-field-demo"><div></div></ComponentPreview>

## 安装

在 Valar 仓库根目录使用本地 CLI，指定已初始化的消费者工程：

<PMAddComp name="number-field" />

手动安装需要 `cn` 和 `@internationalized/number`，并复制组件目录。组件只依赖 Svelte，不包含 Vue 或 React 运行时。

## 用法

```svelte
<script lang="ts">
  import { NumberField } from "$lib/components/ui/number-field/index.js";
  let value = $state<number | undefined>(0.3);
</script>

<label for="amount">金额</label>
<NumberField
  id="amount"
  name="amount"
  bind:value
  min={-2}
  max={2}
  step={0.1}
/>
```

## 状态与编辑合同

- `value` 可绑定；不绑定时通过 `defaultValue` 初始化。`onValueChange` 每次数值实际变化调用一次；空值为 `undefined`，不转成 0。外部值更新会替换正在编辑的文本。
- 文本与数值分离：`-`、`1.` 等文本在编辑时保留。可解析输入实时更新数值；无效输入对应空数值并保留原文，阻止表单提交，不静默恢复旧值。
- 失焦或 Enter 按 `min ?? 0` 为基点吸附到最近步长并限制范围；上下箭头按指定方向到下一格，PageUp/PageDown 移动十格，Home/End 到 min/max。Enter 不阻止合法表单提交。
- 数值采用 JavaScript number，步进后保留 15 位有效数字消除常见浮点噪声；不适用于任意精度金融运算。`step` 必须为正有限数，min ≤ max，数值与范围需与格式精度兼容。
- 不处理滚轮或长按自动重复，避免滚动页面误改值；可重复点击或使用键盘。原生按钮支持触摸点击。

## 表单、空值与无效输入

<ComponentPreview name="number-field-form"><div></div></ComponentPreview>

`name` 提交不带格式的十进制数值字符串，例如 `1234.56`；`form` 支持外部表单。可解析的编辑内容已经反映到 FormData；归一化发生在失焦/Enter/步进，而非读取 FormData 时。直接读取 FormData 不执行 HTML 校验。

`required` 校验空值，解析失败或越界时使用原生约束校验并设置 `aria-invalid`。用 `aria-describedby` 关联业务错误说明，`invalidMessage` 可本地化。重置恢复挂载时的初始值；取消的 reset 不改变值。`disabled` 不提交，`readonly` 保留提交但不可编辑或步进。

## 地区与格式

`locale` 默认为固定的 `zh-CN`，避免服务端与客户端默认地区不同；其他语言的界面传对应 `locale`。可设置 `formatOptions`（Intl.NumberFormatOptions）进行货币、百分比、单位格式化；提交值仍为数值。百分比 `0.05` 显示为 `5%`，步长 `0.01` 表示一个百分点。格式化精度会在规范化时应用到数值模型，显示与提交值一致；清空百分比仍为空，不变成零。

## API

支持输入元素的 HTML/ARIA 属性和事件；`ref` 指向可见 input，`class` 作用于整个控件。`decrementLabel` / `incrementLabel` 自定义按钮无障碍名称。表单状态使用 `disabled` / `readonly` / `required`。完整类型导出为 `NumberFieldProps`。

来源与有意差异、逐项验收见仓库 `standards/porting-records/number-field-vue-to-svelte.md`。
