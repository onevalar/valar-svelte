# Checkbox 设计规范

- 每个 Checkbox 都要有可点击的标签：给 Checkbox 设 `id`，用 `Field.Label for={id}`（或 Label）关联，并放在 `<Field.Field orientation="horizontal">` 中（检查规则 `valar/input-label`）。
- 一组相关的复选框用 `Field.Set` + `Field.Legend` 说明这一组是什么。
- 用于需要点“保存”“提交”才生效的选项；立即生效的设置用 Switch，多选一用 Radio Group。
- 状态用 `bind:checked`；部分选中（如“全选”下只选了一部分）用 `indeterminate`，不要换图标模拟。
- 放在原生表单中提交时设 `name` 和 `value`。错误状态用 `aria-invalid="true"` 加 `Field.Error`（检查规则 `valar/invalid-via-aria`）。
