# Aspect Ratio 设计规范

- 用 `ratio` 属性（如 `ratio={16 / 9}`）固定媒体的宽高比，不要用 padding 技巧或固定高度。
- 内部的图片、视频设 `size-full object-cover`（需要完整显示时用 `object-contain`），图片要有 `alt`（检查规则 `valar/image-alt`）。
