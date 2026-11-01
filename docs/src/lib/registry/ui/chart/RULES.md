# Chart 设计规范

- 每个图表都定义 `ChartConfig`，每个系列写 `label` 和 `color`；颜色用主题 token `var(--chart-1)`～`var(--chart-5)`，不要写十六进制或调色板色值（检查规则 `valar/chart-color-token`）。
- 图表放在 `Chart.Container` 中，传入 `config`；容器默认按 `aspect-video` 比例取高度，需要其他高度时用 `aspect-*`、`h-*` 档位类。
- 悬停数值用 `Chart.Tooltip`，系列名和颜色从 config 读取，不要另写一份。
- 图表本身对读屏器不友好：在标题或说明中写出结论（如“本月访问量比上月高 12%”），关键数据另外提供表格或文字。
- 不要只靠颜色区分系列：系列多于两个时显示图例，必要时配合不同的线型或直接标注数值。
