# Item 设计规范

- 用于列表中的一行内容（设置项、文件、成员）：媒体放 `Item.Media`（`variant` 为 `icon` 或 `image`），文字放 `Item.Content`（`Item.Title`、`Item.Description`），操作放 `Item.Actions`。
- 样式只用 `variant`（`default`、`outline`、`muted`）和 `size`（`default`、`sm`、`xs`），不要用 `class` 改内边距和圆角。
- 整行可点击时用 `child` snippet 把 `props` 传给 `<a href>` 渲染为链接，不要给 div 加 `onclick`；行内还有其他按钮时不要把整行做成链接，避免嵌套交互元素。
- 多个 Item 放进 `Item.Group`：它渲染 `role="list"`，组内每个 Item 要设 `role="listitem"`；行之间需要分隔线时用 `Item.Separator`。
