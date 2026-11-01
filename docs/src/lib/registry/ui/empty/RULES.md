# Empty 设计规范

- 用于列表、表格、搜索结果为空时的占位：用 `Empty.Header` 包 `Empty.Media`、`Empty.Title`、`Empty.Description`，下一步操作放进 `Empty.Content`。
- 标题说明当前状态（“还没有项目”），说明文字告诉用户怎么做；尽量提供一个能解决问题的主按钮（如“新建项目”“清除筛选”）。
- `Empty.Title` 渲染为 `div`：需要进入页面标题层级时在里面放合适级别的标题元素。
- 图标用 `<Empty.Media variant="icon">`，不要自己写带背景色的图标容器。
