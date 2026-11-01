# Carousel 设计规范

- `Carousel.Root` 渲染 `role="region"`，必须用 `aria-label` 说明轮播的内容；每个 `Carousel.Item` 已标为一张幻灯片。
- 用 `Carousel.Previous`、`Carousel.Next` 提供翻页按钮，它们的读屏文字默认是“上一张”“下一张”，其他语言用 `label` 改。
- 行为用 `opts`（Embla 选项，如 `loop`、`align`）和 `plugins` 配置；需要读取当前页或跳转时用 `setApi` 拿到 API，不要自己监听滚动。
- 自动播放会打断阅读：使用自动播放插件时必须提供暂停按钮，并在悬停和聚焦时暂停。
- 重要内容不要只放在后面几张幻灯片里，用户很少翻到最后。
