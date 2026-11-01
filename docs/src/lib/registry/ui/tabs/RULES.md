# Tabs 设计规范

- 用于在同一位置切换同级内容；有先后顺序的步骤用 Stepper，表单中的单选用 Radio Group，需要同时比较的内容不要放进不同标签页。
- 每个 `Tabs.Trigger` 与对应的 `Tabs.Content` 用相同的 `value`；用 `bind:value` 绑定当前标签，需要时同步到网址查询参数。
- 样式只用 `Tabs.List` 的 `variant`（`default`、`line`），不要自己写下划线或背景。
- 标签文字简短；标签较多时让 Tabs.List 横向滚动，不要换成多行。
