# Number Field 设计规范

- 用于需要精确输入的数字（数量、金额、端口号），代替 `<Input type="number">`；有明确范围且适合拖动时用 Slider Field。
- 设 `id` 并用 `Field.Label for={id}` 关联可见标签（检查规则 `valar/input-label`）。
- 按需设 `min`、`max`、`step`；超出范围或无法解析的输入会自动标为无效，不要再自己用颜色标错（检查规则 `valar/invalid-via-aria`）。
- 加减按钮名称（`decrementLabel`、`incrementLabel`）和 `invalidMessage` 默认是中文，其他语言的界面传对应文案；数字格式默认 `locale="zh-CN"`，其他语言的界面传对应 `locale`。
- 金额、百分比、单位用 `formatOptions`（`Intl.NumberFormatOptions`）格式化，不要把单位拼进值里；值始终是数字或 `undefined`（输入框为空）。
- 放在表单中提交时设 `name`，提交的是未格式化的数字。
