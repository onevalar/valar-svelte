# Radio Group 设计规范

- 用于 2–5 个互斥选项且需要一眼看全的场景；选项更多时用 Select，可以多选用 Checkbox，切换视图或模式用 Tabs 或 Toggle Group。
- 整组要有名称：放在 `Field.Set` 中并用 `Field.Legend` 写组名，或给 `RadioGroup.Root` 设 `aria-label`。
- 每个 `RadioGroup.Item` 设 `id` 和 `value`，并用 `Field.Label for={id}` 关联可点击的标签（检查规则 `valar/input-label`）；每项放在 `<Field.Field orientation="horizontal">` 中。
- 用 `bind:value` 绑定选中值；需要默认选中时给出初始值，不要让必选组初始为空又不提示。
- 方向用 `orientation` 属性；方向键在选项间移动，不要给每个选项单独加 Tab 停留。
