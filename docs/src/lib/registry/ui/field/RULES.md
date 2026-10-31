# Field 设计规范

- 每个输入控件都放在 `Field.Field` 中，并用 `Field.Label for={id}` 关联控件的 `id`；不要只靠 `placeholder` 说明用途（检查规则 `valar/input-label`）。
- 补充说明用 `Field.Description`，校验错误用 `Field.Error`，不要用自定义颜色的文字代替。
- 一组相关字段用 `Field.Set` + `Field.Legend` 包起来，多组之间用 `Field.Separator`。
- 开关、复选框等横向排列时用 `<Field.Field orientation="horizontal">`，不要手写 flex 布局。
- 表单状态与校验交给 Form（Formsnap/Superforms）；Field 只负责布局和语义。
