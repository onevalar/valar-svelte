# Message 设计规范

- Message 负责一条消息的整行布局：头像、对齐、发送者和元信息；带框的消息正文用 Bubble，代理执行的步骤用 Trace，状态和分隔用 Marker。
- 自己发送的消息设 `align="end"`；同一发送者连续的消息放进 `Message.Group`，前几条放空的 `Message.Avatar` 保持对齐。
- 发送者名称放 `Message.Header`，发送状态、时间等放 `Message.Footer`；Footer 里只有图标的操作按钮都要有 `aria-label`（检查规则 `valar/icon-button-label`）。
- 进行中的消息用 `<Marker.Root role="status">` 表达状态，读屏器才会播报。
