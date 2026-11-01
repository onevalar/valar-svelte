# Resizable 设计规范

- 结构为 `Resizable.PaneGroup`（`direction` 设 `horizontal` 或 `vertical`）> `Resizable.Pane` 和 `Resizable.Handle`；不要自己写拖拽调整宽度。
- 每个 Pane 设 `defaultSize`，并用 `minSize` 保证内容不会被拖到不可用；可以收起的面板设 `collapsible`。
- 需要让拖动结果在刷新后保留时，给 PaneGroup 设唯一的 `autoSaveId`。
- 分隔条可以用键盘方向键调整，需要明显的拖拽提示时设 `withHandle`；窄屏下考虑改为上下堆叠或用 Tabs 切换。
