# Tags Input 设计规范

- 用于输入多个自由文本值（标签、邮箱、关键词）；从固定选项中多选用 Checkbox 组或可多选的 Select。
- 设 `id` 并用 `Field.Label for={id}` 关联可见标签（检查规则 `valar/input-label`）。
- 默认只用英文逗号分隔：中文界面设 `delimiter={/[,，]/}`，同时支持全角逗号。回车总会添加当前输入。
- 默认文案是中文（删除按钮名称、必填提示、校验错误和读屏播报）；其他语言传 `removeLabel`、`requiredMessage` 和 `messages`。
- 校验写在 `validate`：返回字符串作为错误信息显示，不要在外面另写错误文字；需要上限时设 `max`，默认不允许重复（`allowDuplicates`）。
- 放在表单中提交时设 `name`，每个标签会作为一个同名字段提交；值是字符串数组，用 `bind:value` 绑定。
