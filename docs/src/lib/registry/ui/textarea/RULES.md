# Textarea 设计规范

- 与 Input 一样需要可见标签：放在 `Field.Field` 中，用 `Field.Label for={id}` 关联 `id`（检查规则 `valar/input-label`）。
- 错误状态用 `aria-invalid="true"` 加 `Field.Error`，不要用 `class` 改边框颜色（检查规则 `valar/invalid-via-aria`）。
- 高度默认随内容增长（`field-sizing-content`）；可能输入很长内容时，加 `max-h-*` 档位类限制高度，超出部分在框内滚动。
- 有字数上限时同时设 `maxlength` 并用 `Field.Description` 显示剩余字数。
- 一行即可的短文本用 Input；需要格式化的富文本不要用 Textarea 模拟。
- 前后要加按钮或提示文字时用 Input Group 的 `InputGroup.Textarea`。
