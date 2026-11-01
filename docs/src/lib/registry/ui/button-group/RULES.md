# Button Group 设计规范

- 用于一组紧密相关、连在一起的按钮（如分段操作、按钮加下拉菜单）；只是并排的独立按钮用普通 flex 间距排列即可。
- `ButtonGroup.Root` 渲染 `role="group"`，要用 `aria-label` 说明这组按钮做什么。
- 组内按钮使用相同的 `size`；方向用 `orientation`，组之间需要间距时嵌套多个 ButtonGroup，不要给按钮单独改圆角或边框（组件已处理相邻按钮的圆角和边框）。
- 组内的说明文字用 `ButtonGroup.Text`，分隔用 `ButtonGroup.Separator`；Input、Select 等控件也可以放进组内。
