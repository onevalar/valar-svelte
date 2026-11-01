# Popover 设计规范

- 用于点击后出现、可以操作的轻量面板，如小表单、筛选、选择器；纯文字提示用 Tooltip，一组操作命令用 Dropdown Menu，较长流程用 Dialog。
- 打开它的按钮通过 `Popover.Trigger` 的 `{#snippet child({ props })}` 渲染 Button（检查规则 `valar/trigger-child-snippet`）。
- 面板有标题时用 `Popover.Header`、`Popover.Title`、`Popover.Description`，不要自己写加粗文字。
- 位置用 `side`、`align`、`sideOffset` 属性；面板会自动翻转并保持在视口内，不要用 `class` 写定位。
- 内容组件自带内边距时（如 Command、Calendar）才给 `Popover.Content` 加 `p-0`；需要与触发按钮同宽时用 `w-(--bits-popover-anchor-width)`，其他宽度用 `w-*` 档位，不写像素值。
- 搜索选择（Combobox）用 Popover + Command，日期选择用 Popover + Calendar，照对应文档的组合写法，不要另做一个下拉组件。
- 面板里的操作完成后需要关闭时，用 `bind:open` 设为 `false` 或用 `Popover.Close`；关闭后焦点回到触发按钮。
