# Calendar 设计规范

- 值是 `@internationalized/date` 的日期对象（如 `CalendarDate`、`today(getLocalTimeZone())`），不是 JavaScript `Date`；用 `bind:value` 绑定，并设 `type="single"` 或 `type="multiple"`。
- 默认 `locale="zh-CN"`，月份和星期显示中文；其他语言的界面传对应 `locale`（如 `en-US`）；需要周一开始时设 `weekStartsOn={1}`。
- 可选范围用 `minValue`、`maxValue`，不可选的日期用 `isDateDisabled`；不要只在提交时才拒绝。
- 生日等跨度很大的日期用 `captionLayout="dropdown"` 提供年月下拉，不要让用户一个月一个月翻。
- 日期选择框（Date Picker）用 Popover + Calendar，触发按钮显示已选日期，照日期选择器文档的组合写法；选择日期区间用 Range Calendar。
- 不要用 `class` 改日期格子的尺寸和圆角，它们跟随组件样式。
