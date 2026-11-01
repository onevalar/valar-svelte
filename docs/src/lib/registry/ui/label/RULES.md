# Label 设计规范

- 表单里优先用 `Field.Label`，它已包含 Label；只在 Field 之外的简单场景直接用 Label。
- 必须用 `for` 指向控件的 `id`，或把控件包在 Label 里，点击标签才能聚焦或切换控件。
- 标签写控件的用途（“邮箱”），不要写“请输入”；必填用文字或 `aria-required` 表达，不要只靠颜色或星号。
