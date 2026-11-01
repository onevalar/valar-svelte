# Select 设计规范

- 用于从一组固定选项中选值：2–5 个且需要一眼看全的选项用 Radio Group，需要搜索大量选项用 Popover + Command，触发操作而不是选值用 Dropdown Menu；需要原生行为（移动端系统选择器）时用 Native Select。
- `Select.Root` 必须设 `type="single"` 或 `type="multiple"`；值是字符串（多选为字符串数组），用 `bind:value` 绑定。
- 把选项数组传给 `Select.Root` 的 `items`，触发器里用 `<Select.Value placeholder="…" />` 显示选中项的文字；表单提交时设 `name`。
- `Select.Trigger` 设 `id` 并用 `Field.Label for={id}` 关联（检查规则 `valar/input-label`）；错误状态用 `aria-invalid="true"`（检查规则 `valar/invalid-via-aria`）。
- 尺寸用 `Select.Trigger` 的 `size` 属性（`sm`、`default`），宽度用 `w-*` 档位；不要用 `class` 改高度或圆角。
- 选项多时用 `Select.Group` + `Select.Label` 分组，组间用 `Select.Separator`；每个 `Select.Item` 同时设 `value` 和 `label`。
