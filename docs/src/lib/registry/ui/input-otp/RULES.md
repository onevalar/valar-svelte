# Input OTP 设计规范

- 只用于验证码、一次性密码等固定位数的输入；其他文本用 Input。
- 显式设置 `maxlength`（默认值未必等于你的验证码位数），`InputOTP.Slot` 的数量与之相同；只允许数字时设 `pattern={REGEXP_ONLY_DIGITS}`（从 `bits-ui` 导入）。
- 组件内有一个真实的输入框：用 `aria-label` 命名，或用 `inputId` 设它的 `id` 后由 `Field.Label for` 关联；在 `Field.Description` 中说明验证码发到了哪里。
- 保留默认的 `autocomplete="one-time-code"`，移动端才能从短信自动填入；粘贴整段验证码会自动拆分到各格，不要另做处理。
- 分组用 `InputOTP.Group`，组间用 `InputOTP.Separator`；输满后用 `onComplete` 自动提交时，提交期间设 `disabled`。
- 错误时给每个 `InputOTP.Slot` 设 `aria-invalid`，各格才会显示错误状态；同时用 `Field.Error` 说明原因。
