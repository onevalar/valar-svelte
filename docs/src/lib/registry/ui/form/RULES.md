# Form 设计规范

- 用于基于 Formsnap 和 sveltekit-superforms 的表单：校验 schema 写在 superforms 中，每个字段用 `Form.Field {form} name="…"` 绑定，不要自己维护错误状态。
- 控件放进 `Form.Control` 的 `{#snippet children({ props })}`，并把 `props` 展开到控件上（`<Input {...props} />`），这样 `id`、`name`、`aria-invalid` 和说明文字关联会自动生成；不要自己写这些属性。
- 标签用 `Form.Label`（放在 Control 里），说明用 `Form.Description`，错误用 `Form.FieldErrors`；一组字段用 `Form.Fieldset` + `Form.Legend`。
- 提交按钮用 `Form.Button`（等同 `type="submit"` 的 Button），一个表单只有一个主提交按钮；提交期间禁用并显示进度。
- 不使用 superforms 的简单表单不需要 Form，直接用 Field 组件。
