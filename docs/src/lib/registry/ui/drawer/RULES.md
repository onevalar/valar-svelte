# Drawer 设计规范

- 用于移动端从底部拉起、可拖拽关闭的面板；桌面端同样的内容通常改用 Dialog 或 Sheet，按屏幕宽度切换（见 Drawer 文档“Responsive”示例）。
- 每个 `Drawer.Content` 都要有 `Drawer.Title`，不显示时加 `class="sr-only"`（检查规则 `valar/overlay-title`）。
- 方向用 `Drawer.Root` 的 `direction` 属性；拖拽把手只在 `bottom` 方向显示，其他方向要提供 `Drawer.Close` 按钮。
- 需要停在几个固定高度时用 `snapPoints` 和 `bind:activeSnapPoint`，不要自己计算高度。
- 背景缩放（`shouldScaleBackground`，默认开启）需要应用根元素带 `data-vaul-drawer-wrapper` 属性才生效；不需要时设为 `false`。
- 内容区高度有上限，长内容放在 `Drawer.Header` 与 `Drawer.Footer` 之间的可滚动容器中（`overflow-y-auto`）。
- 打开它的按钮通过 `Drawer.Trigger` 的 `child` snippet 渲染 Button（检查规则 `valar/trigger-child-snippet`）。
