# Switch 设计规范

- 用于立即生效的开关设置；需要点“保存”才生效的选项用 Checkbox。
- 每个 Switch 都要有可见标签说明它控制什么：设 `id`，用 `Field.Label for={id}` 关联，放在 `<Field.Field orientation="horizontal">` 中，标签在前、开关在后（检查规则 `valar/input-label`）。
- 标签写被控制的功能（“邮件通知”），不要写“开启／关闭”；状态由组件的 `aria-checked` 表达，不要在旁边再加“已开启”文字代替标签。
- 状态用 `bind:checked`；切换会触发耗时请求时，请求期间设 `disabled`，失败时恢复原值并提示。
- 尺寸只用 `size` 属性（`sm`、`default`），不要用 `class` 改宽高。
