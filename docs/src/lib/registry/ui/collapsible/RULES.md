# Collapsible 设计规范

- 用于单块可以展开收起的内容（“显示更多”、高级选项）；多块并列的展开内容用 Accordion。
- `Collapsible.Trigger` 本身就是按钮：要用 Button 样式时通过 `{#snippet child({ props })}` 渲染 Button（检查规则 `valar/trigger-child-snippet`）；只有图标的触发按钮要有 `aria-label`。
- 触发按钮的文字或图标随状态变化（“显示更多”／“收起”），展开状态用 `bind:open` 控制。
