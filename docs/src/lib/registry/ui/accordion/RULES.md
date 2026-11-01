# Accordion 设计规范

- 用于可以按需展开的次要内容（常见问题、分组设置）；用户必须看到的内容不要折叠起来。只有一块可展开内容时用 Collapsible。
- `Accordion.Root` 必须设 `type="single"`（同时只展开一项）或 `type="multiple"`；每个 `Accordion.Item` 设唯一的 `value`。
- `Accordion.Trigger` 外层渲染为标题，用 `level` 属性设成与页面结构相符的标题级别（默认 3），不要再在 Trigger 里套 `<h3>`。
- 标题写成能看出内容的短句；展开动效、间距跟随组件样式和组件参数，不要用 `class` 改 `duration-*` 或内边距。
