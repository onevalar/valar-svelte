# Toggle Group 设计规范

- `ToggleGroup.Root` 必须设 `type="single"`（多选一，如对齐方式）或 `type="multiple"`（如加粗、斜体）；用 `bind:value` 绑定。
- 整组用 `aria-label` 说明用途；只有图标的 `ToggleGroup.Item` 都要有 `aria-label`。
- `variant`、`size` 设在 Root 上，所有项保持一致；需要项之间留空时用 `spacing`，不要给项单独改圆角或边框。
- 切换视图或模式且各视图内容差异较大时用 Tabs。
