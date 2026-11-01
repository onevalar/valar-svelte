# Avatar 设计规范

- 每个 Avatar 都放 `Avatar.Image` 和 `Avatar.Fallback`：图片加载失败或没有图片时显示 Fallback（姓名首字或图标）。
- `Avatar.Image` 必须有 `alt`，写人名或账号名；旁边已有姓名文字时写 `alt=""`（检查规则 `valar/image-alt`）。
- 尺寸只用 `size` 属性（`sm`、`default`、`lg`），不要用 `class` 写 `size-*`。
- 在线状态等标记用 `Avatar.Badge`，并另外用文字或 `aria-label` 表达状态，不要只靠圆点颜色；多个头像用 `Avatar.Group`，超出部分用 `Avatar.GroupCount` 显示数量。
