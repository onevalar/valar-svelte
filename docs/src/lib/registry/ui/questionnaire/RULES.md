# Questionnaire 设计规范

- 用于一次只显示一题、按顺序回答的问卷；结构为 `Questionnaire.Root` > `Questionnaire.Progress`、`Questionnaire.Item`（`Title`、`Description`、`Choices`／`Input`、`Error`）和 `Questionnaire.Actions`（`Previous`、`Skip`、`Next`、`Submit`）。
- 题目、答案状态、校验、进度和导航都交给 Questionnaire；关闭、取消、保存进度、提交到服务器和题目跳转逻辑由外层页面、卡片或对话框负责。
- 每个 `Questionnaire.Input` 都要有名称：可见标签、`aria-label` 或 `aria-labelledby`，`placeholder` 不能代替。
- 固定选项用 `Questionnaire.Choice`（多选题在 `Questionnaire.Item` 上设 `multiple`），不要自己写单选、复选框；可以跳过的题用 `Questionnaire.Skip` 明确跳过。
- 导航按钮的样式用 `size`、`variant` 属性；需要服务端渲染时传 `items`。
- 进度文字、进度的读屏名称和默认错误提示是中文（“第 1 题，共 3 题”等）；其他语言给 `Questionnaire.Root` 传 `messages`。
