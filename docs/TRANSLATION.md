# 中文翻译规范

本文件约束 `content/zh/**` 下的所有中文文档。修改或新增中文页面时先读一遍，翻译时以这里的术语和语气为准。

英文原文放在 `content/**`，是唯一事实来源；中文放在 `content/zh/**`，目录结构必须与英文一一对应。

## 一、基本要求

1. **先读懂，再动笔。** 逐段理解原文在讲什么，然后用中文重新表达。禁止逐词对译、禁止保留英文语序。
2. **像设计系统文档。** 语气克制、专业、直接，写给正在写界面的开发者。不口语化，也不写成说明书腔。
3. **结构完全对齐。** 标题层级、代码块数量、组件标签、表格行列、列表顺序都要与英文一致。便于逐段对照和后续同步。
4. **只翻译自然语言。** 代码、命令、路径、组件名（`Button`、`Dialog.Root`）、属性名、事件名、CSS 变量、URL、文件名一律保持原样。
5. **演示数据不翻译。** 代码块里的示例文案、demo 组件里的假数据（人名、金额、任务标题等）保留英文。

## 二、术语表

组件名与常用设计术语按此表统一。表里没有的，优先查同目录已有译文，避免同一概念出现两种叫法。

### 组件

| 英文 | 中文 | 英文 | 中文 |
| --- | --- | --- | --- |
| Accordion | 折叠面板 | Alert | 提示框 |
| Alert Dialog | 警告对话框 | Aspect Ratio | 宽高比 |
| Attachment | 附件 | Avatar | 头像 |
| Badge | 徽标 | Breadcrumb | 面包屑导航 |
| Bubble | 气泡 | Button | 按钮 |
| Button Group | 按钮组 | Calendar | 日历 |
| Card | 卡片 | Carousel | 轮播 |
| Chain of Thought | 思维链 | Chart | 图表 |
| Checkbox | 复选框 | Code Block | 代码块 |
| Collapsible | 折叠区域 | Combobox | 组合框 |
| Command | 命令面板 | Context Menu | 右键菜单 |
| Data Table | 数据表格 | Date Picker | 日期选择器 |
| Dialog | 对话框 | Drawer | 抽屉 |
| Dropdown Menu | 下拉菜单 | Empty | 空状态 |
| Field | 表单字段 | Form | 表单 |
| Hover Card | 悬停卡片 | Input | 输入框 |
| Input Group | 输入框组 | Item | 列表项 |
| Kbd | 键帽 | Label | 标签 |
| Marker | 标记 | Menubar | 菜单栏 |
| Message | 消息 | Message Scroller | 消息滚动容器 |
| Native Select | 原生选择器 | Navigation Menu | 导航菜单 |
| Pagination | 分页 | Popover | 弹出层 |
| Progress | 进度条 | Questionnaire | 问卷 |
| Queue | 队列 | Radio Group | 单选按钮组 |
| Resizable | 可调整面板 | Scroll Area | 滚动区域 |
| Select | 选择器 | Separator | 分割线 |
| Sheet | 面板 | Sidebar | 侧边栏 |
| Skeleton | 骨架屏 | Slider | 滑块 |
| Sonner | 消息提示 | Spinner | 加载指示器 |
| Subagent | 子代理 | Switch | 开关 |
| Table | 表格 | Tabs | 标签页 |
| Task | 任务 | Terminal | 终端 |
| Textarea | 多行输入框 | Toggle | 切换按钮 |
| Toggle Group | 切换按钮组 | Tool | 工具调用 |
| Tooltip | 工具提示 | Trace | 调用链 |
| Typography | 排版 | AI Elements | AI 元素 |
| Chat | 对话 | Checkpoint | 检查点 |
| Confirmation | 确认 | Context | 上下文 |
| File Tree | 文件树 | Inline Citation | 行内引用 |
| Model Selector | 模型选择器 | Plan | 计划 |
| Prompt Input | 提示词输入框 | Reasoning | 推理 |
| Sources | 来源 | Stack Trace | 堆栈跟踪 |
| Suggestion | 建议 | Test Results | 测试结果 |
| Introduction | 简介 | | |

### 通用概念

| 英文 | 中文 |
| --- | --- |
| props / prop | 属性 |
| variant | 变体 |
| size | 尺寸 |
| slot | 插槽 |
| snippet | 片段 |
| state | 状态 |
| controlled / uncontrolled | 受控 / 非受控 |
| trigger | 触发器 |
| content | 内容 |
| overlay | 遮罩层 |
| portal | 传送门 |
| accessibility | 无障碍 |
| focus | 焦点 |
| disabled | 禁用 |
| read-only | 只读 |
| placeholder | 占位符 |
| theme | 主题 |
| dark mode | 深色模式 |
| light mode | 浅色模式 |
| design token | 设计令牌 |
| semantic token | 语义令牌 |
| registry | 注册表 |
| installation | 安装 |
| usage | 用法 |
| example / demo | 示例 / 演示 |
| preview | 预览 |
| anatomy | 结构 |
| styling | 样式 |
| composition | 组合 |
| customization | 定制 |
| responsive | 响应式 |
| breakpoint | 断点 |
| server-side rendering | 服务端渲染 |
| hydration | 水合 |
| toast | 轻提示 |
| table of contents | 目录 |

## 三、标题与锚点

常用标题统一译法：

| 英文 | 中文 |
| --- | --- |
| Installation | 安装 |
| Usage | 用法 |
| Examples | 示例 |
| Anatomy | 结构 |
| Accessibility | 无障碍 |
| Styling | 样式 |
| Theming | 主题定制 |
| API Reference | API 参考 |
| Props / API | 属性 / API |
| Basic | 基础用法 |
| With … | 带 … |
| Controlled | 受控用法 |
| Custom … | 自定义 … |
| New Components | 新增组件 |
| All Components | 全部组件 |

锚点由标题文本生成：空格变 `-`，去掉标点，中文保留。

- **同页锚点链接**（`](#section)`）必须改成翻译后的锚点。
- **跨页锚点链接**（`](/docs/components/xxx#section)`）先保持原文的英文锚点，构建前由脚本统一改写。

## 四、语气与措辞

### 要做

- 用短句。一句话讲一件事。
- 省略不必需的主语和"你"。
- 用动词开头写步骤："复制以下代码到项目中。"
- 描述行为时用现在时、主动语态。
- 中英文之间留一个空格：`使用 Svelte 5 和 Tailwind CSS 4`。
- 标点用全角：，。：；？！“”（）；代码内的标点保持半角。
- 引用属性时写作：`variant` 属性、`size="sm"`、传入 `disabled`。

### 不要做

- 不要出现"让我们""请注意""总的来说""旨在""赋能""无缝""强大的"这类词。
- 不要滥用"可以""能够""进行""实现""使得""当……时"。
- 不要为了凑字数加解释性从句。
- 不要保留 `It`、`This`、`You can` 的直译痕迹。
- 不要中英混排：正文说"按钮"，不要写"Button 按钮"；代码里还是 `Button`。
- 不要翻译示例里的文案和演示数据。

### 对照示例

原文：Displays a button or a component that looks like a button.
译文：显示按钮，或外观与按钮一致的组件。

原文：A window overlaid on either the primary window or another dialog window, rendering the content underneath inert.
译文：叠加在主窗口或其他对话框之上的窗口，打开后下层内容不可交互。

原文：Copy and paste the following code into your project.
译文：将以下代码复制到项目中。

原文：Use `showCloseButton={false}` to hide the close button.
译文：传入 `showCloseButton={false}` 隐藏关闭按钮。

原文：Replace the default close control with your own button.
译文：用自定义按钮替换默认的关闭控件。

原文：This component is built with `Trace` and `Code Block`.
译文：该组件基于 `Trace` 和 `Code Block` 构建。

## 五、交付检查

翻译完成后逐项核对：

- [ ] `content/zh` 与 `content` 文件一一对应。
- [ ] frontmatter 只翻译 `title`、`description`，其余字段原样保留。
- [ ] 代码块内容、组件标签、`{#snippet}` 未改动。
- [ ] 标题数量与层级和英文一致。
- [ ] 同页锚点已改写成中文锚点。
- [ ] 术语与术语表一致。
- [ ] 通读一遍，确认没有英文语序和机翻腔。

## 六、工具

```sh
cd docs
pnpm check:i18n     # 校验中英文件是否一一对应、结构是否一致
pnpm fix:anchors    # 按标题顺序把跨页英文锚点改写成中文锚点
```

- 站内链接在编译时自动加 `/zh` 前缀（`mdsx.config.js` 里的 `rehypeLocalizeLinks`），中文 Markdown 里保持和英文一致的 `/docs/...` 路径即可。
- 界面文案不在 Markdown 里，统一放在 `src/lib/i18n/messages.ts`，中英文必须同时补齐，缺键会类型报错。
