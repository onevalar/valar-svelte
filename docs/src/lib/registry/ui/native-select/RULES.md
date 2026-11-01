# Native Select 设计规范

- 用于需要浏览器原生行为的场景：移动端系统选择器、无 JavaScript 的表单、很长的简单列表。需要自定义选项样式或分组标题时用 Select。
- `NativeSelect.Root` 设 `id` 并用 `Field.Label for={id}` 关联，或提供 `aria-label`（检查规则 `valar/input-label`）；错误状态用 `aria-invalid="true"`（检查规则 `valar/invalid-via-aria`）。
- 选项用 `NativeSelect.Option`，分组用 `NativeSelect.OptGroup`；没有默认值时第一项写成 `value=""` 的提示项。
- 尺寸用 `size` 属性（`sm`、`default`）；不要再写原生 `<select>`（检查规则 `valar/use-form-component`）。
