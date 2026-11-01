# Card 设计规范

- 结构用 `Card.Header`（`Card.Title`、`Card.Description`、右上角操作 `Card.Action`）、`Card.Content`、`Card.Footer`，不要自己写标题样式和分隔线。
- `Card.Title` 渲染为 `div`，不是标题元素：需要进入页面标题层级时，在里面放合适级别的标题元素（如 `<Card.Title><h2>…</h2></Card.Title>`），或传 `role="heading"` 和 `aria-level`。
- 紧凑卡片用 `size="sm"`；内边距、间距和圆角跟随组件样式，不要用 `class` 改 `p-*`、`gap-*`、`rounded-*`。
- 卡片内最多一个主按钮（见 Button 规范）；整张卡片可点击时，用卡片内的主链接或按钮承载点击，不要给 Card 加 `onclick`。
