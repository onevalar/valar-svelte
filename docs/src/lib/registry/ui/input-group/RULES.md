# Input Group 设计规范

- 输入框前后需要图标、文字、按钮或快捷键提示时，用 `InputGroup.Root` 组合，不要用绝对定位把元素压在 Input 上。
- 框内的输入控件必须用 `InputGroup.Input` 或 `InputGroup.Textarea`，不要放普通 Input；组合的边框、焦点环和错误状态都按这两个控件计算。
- 输入控件同样需要标签：设 `id` 并用 `Field.Label for={id}` 关联，或提供 `aria-label`；搜索框也不例外（检查规则 `valar/input-label`）。
- 附加内容放进 `InputGroup.Addon`，用 `align`（`inline-start`、`inline-end`、`block-start`、`block-end`）定位；纯文字用 `InputGroup.Text`。
- 框内按钮用 `InputGroup.Button`，尺寸只用它的 `size`（`xs`、`sm`、`icon-xs`、`icon-sm`）；只有图标的按钮要有 `aria-label`（检查规则 `valar/button-size-via-prop`、`valar/icon-button-label`）。
- 错误状态设在输入控件上（`aria-invalid="true"`），整个组合会显示错误边框。
