# Slider 设计规范

- 只适合粗略调整的连续值；需要看到或输入精确数值时用 Slider Field（滑块加数字输入框），没有明确范围的数字用 Number Field。
- 滑块必须有名称：设 `aria-label` 或 `aria-labelledby`，多个滑块（范围选择）用 `thumbLabels` 给每个滑块单独命名；`Field.Label for` 无法关联滑块（检查规则 `valar/input-label`）。
- 必须设 `type="single"` 或 `type="multiple"`，并给出 `min`、`max`、`step`；值用 `bind:value`。
- 竖向滑块用 `orientation="vertical"`，并给父容器明确的高度。
