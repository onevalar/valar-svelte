# Attachment 设计规范

- 用于聊天输入框、消息和上传列表中的文件或图片；多个附件放进 `Attachment.Group`，它会横向滚动。
- 上传过程用 `state` 表达（`idle`、`uploading`、`processing`、`error`、`done`），不要自己加颜色；出错时在 `Attachment.Description` 写明原因，不要只靠红色。
- `Attachment.Action` 默认只有图标，每个都要有说明动作和对象的 `aria-label`（如“移除 report.pdf”）；`Attachment.Trigger` 覆盖整张卡片且没有文字，也必须有 `aria-label`（检查规则 `valar/icon-button-label`）。
- 图片附件在 `<Attachment.Media variant="image">` 中放 `<img>` 并写 `alt`（检查规则 `valar/image-alt`）。
- 尺寸用 `size`（`default`、`sm`、`xs`），排列用 `orientation`，不要用 `class` 改宽高。
- 只用于展示的附件行没有可聚焦元素时，给 `Attachment.Group` 设 `tabindex={0}`、`role="group"` 和 `aria-label`，键盘用户才能滚动它。
