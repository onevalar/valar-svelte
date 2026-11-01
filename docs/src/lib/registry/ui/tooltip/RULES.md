# Tooltip 设计规范

- 根布局放一次 `Tooltip.Provider`，包住所有会出现提示的内容；没有 Provider 时 `Tooltip.Root` 会报错。Sidebar 的 `Sidebar.Provider` 已自带一个。
- 显示延迟由 `Tooltip.Provider` 的 `delayDuration` 统一决定（属于组件参数），不要在单个 Tooltip 上另设不同的延迟。
- 提示只放简短的纯文字说明；不要放按钮、链接、输入框等可操作内容，它们无法聚焦和点击，改用 Popover（检查规则 `valar/tooltip-no-interactive`）。
- 提示不能代替名称：只有图标的按钮仍然要写 `aria-label`（见 Button 规范），Tooltip 只是给鼠标用户的补充。
- 触屏设备没有悬停，关键信息不要只放在提示里。
- 触发元素必须可聚焦：给 `Tooltip.Trigger` 设 `class={buttonVariants({ ... })}`，或用 `child` snippet 渲染 Button（检查规则 `valar/trigger-child-snippet`）；不要给纯文字或禁用的按钮加提示，禁用按钮收不到悬停和焦点。
- 方向用 `side` 属性（默认 `top`），碰撞时会自动翻转；不要用 `class` 改定位或动效。
