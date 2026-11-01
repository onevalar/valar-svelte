# Scroll Area 设计规范

- 用于固定区域内的自定义滚动条（侧栏列表、弹层中的长内容）；整页滚动保持浏览器原生滚动。
- Scroll Area 必须有确定的高度或最大高度（`h-*`、`max-h-*` 档位类，或在 flex 布局中 `flex-1 min-h-0`），否则不会出现滚动。
- 横向滚动设 `orientation="horizontal"`，两个方向都需要时设 `both`。
- 视口可以被键盘聚焦并滚动；区域内容没有标题时给 Scroll Area 设 `aria-label` 说明内容。
