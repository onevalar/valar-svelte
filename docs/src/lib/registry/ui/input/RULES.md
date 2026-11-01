# Input 设计规范

- 每个 Input 都要有可见标签：放在 `Field.Field` 中，用 `Field.Label for={id}` 关联 Input 的 `id`；`placeholder` 只写示例，不能代替标签（检查规则 `valar/input-label`）。
- 错误状态用 `aria-invalid="true"` 加 `Field.Error`，组件已按 `aria-invalid` 显示错误边框和焦点环；不要用 `class` 直接改成红色边框（检查规则 `valar/invalid-via-aria`）。
- 按内容设置 `type`、`inputmode` 和 `autocomplete`（如 `type="email"`、`autocomplete="email"`），移动端才会弹出正确的键盘并允许自动填充。
- 有范围、步长或需要按地区格式化的数字用 Number Field，不要用 `type="number"`；多行文本用 Textarea；从固定选项中选择用 Select。
- 选择文件用 `<Input type="file" bind:files />`，不要自己写原生 `<input>`（检查规则 `valar/use-form-component`）。
- 高度、圆角、内边距跟随组件样式和组件参数（与 Button 同一套尺寸、圆角档位）；不要用 `class` 改 `rounded-*`、`px-*`。必须与同一行的小号按钮对齐时，只用与该按钮相同的高度档位类，不写像素值。
- 前后要加图标、文字或按钮时用 Input Group，不要用绝对定位把图标压在 Input 上。
