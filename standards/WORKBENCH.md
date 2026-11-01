# Valar Studio 参数工作台

## 主线决定（2026-10-31）

用户于 2026-10-31 确认：**组件文档页内的按需微调是调参能力的主线**。新组件的调参优先以组件页微调的方式接入。
`/workbench` 的 Studio 保留现有功能和回归，暂不继续扩展到新组件；它的长期定位另行决定。
2026-10-31 站点改版后，主导航只保留“组件、设计 token、文档”；Studio、Blocks、Charts、Create 不再出现在导航，但原地址仍可访问，代码未删除。

## 路线图与下一步（2026-10-31，接手前必读）

已确定的方向：

- 调参主线：组件文档页内按需微调；交互采用**全屏编辑器**（Button 已完成，见下文）。
- 参数分层：全局 token（颜色、`--radius`、字号阶梯）只在全局配置页修改；组件页只调本组件参数，全局 token 只读。
- 首页采用“全局 token／组件／调参”三块（方向 C）；主导航只保留组件、设计 token、文档。
- DialKit 继续使用，直到 Valar 具备其全部控件（对照见文末）；缺什么补什么。

| 顺序 | 任务                                | 状态                        | 要点                                              |
| ---- | ----------------------------------- | --------------------------- | ------------------------------------------------- |
| 1    | Button 组件参数写回组件库           | 完成                        | 写入 `styles/valar/style-*.css`，仅本地开发站可写 |
| 2    | 首页方向 C、导航精简                | 完成                        | Studio 等入口隐藏不删                             |
| 3    | Button 全屏编辑器（方向 B）         | 完成                        | DialKit `inline` 模式                             |
| 4    | 补 Slider Field、Color Picker       | 完成                        | 见组件补充清单 VCOMP-005／006                     |
| 5    | 全局 token 配置页（扩展 `/themes`） | 完成                        | 写入 `styles/valar/tokens.json`，仅本地开发站可写 |
| 6    | 动效、边框宽度 token（第二期）      | 完成                        | 时长四档、曲线三档、边框粗细；见下                |
| 7    | 把全屏编辑器推广到第二个组件        | 完成（Dialog）              | 共用外壳 `component-tuner.svelte`；见下           |
| 8    | 组件自带设计规范（AI 友好）         | 完成（样板：Button、Field） | 见下                                              |
| 9    | 组件说明卡（借鉴 Arc）              | 完成（20 个常用组件）       | `ui/<组件>/meta.json`，是 10–12 步的唯一数据源    |
| 10   | 给 AI 读的资料                      | 完成                        | catalog.json、三种 llms.txt、组件页 `.md`         |
| 11   | Valar 可安装技能包                  | 完成（设计方法待用户编写）  | `skills/valar-svelte`；`guides/` 三个文件为占位   |
| 12   | 本地 MCP 服务 `valar-svelte mcp`    | 完成（本地版）              | 线上版等用户准备好服务器后再做                    |

**下一步**（2026-11-01，第 1–12 步均已完成，最新提交 `e3c095c`）：按下面的“后续任务”从 A1 开始。`skills/valar-svelte/guides/` 的组合、文案、动效内容由用户编写，AI 不要动。

### 后续任务（按顺序；完成一项就在此更新状态）

| 编号 | 任务                                 | 状态 | 说明                                                                                                                          |
| ---- | ------------------------------------ | ---- | ----------------------------------------------------------------------------------------------------------------------------- |
| A1   | 组件编辑器接入 Popover、Sheet        | 待办 | 与 Dialog 同类（遮罩、动效档位、出现时缩放／滑入距离），照 `dialog-tuning.ts` 做；Sheet 的滑入距离属于组件参数                |
| A2   | 接入 Dropdown Menu、Tooltip          | 待办 | 弹层类收尾；Tooltip 的显示延迟属于组件参数                                                                                    |
| A3   | 接入 Input、Select、Textarea         | 待办 | 高度、圆角档位应与 Button 同一套档位，避免组件之间割裂；当前值量取方式参照 Button                                             |
| B1   | 给弹层与表单组件补说明卡 `meta.json` | 待办 | 可与 A 并行；目前 21 个组件有卡，缺卡清单见构建日志或 `catalog.json` 的 `missingCards`；做法见“第 9–12 步的做法”              |
| B2   | 给弹层与表单组件补 `RULES.md`        | 待办 | 目前只有 Button、Field；做法见“第 8 步的做法”                                                                                 |
| B3   | 其余组件补说明卡和 `RULES.md`        | 待办 | B1、B2 之后                                                                                                                   |
| C1   | 用户编写 `guides/` 三份方法          | 用户 | 页面组合、文案、动效；AI 不代写                                                                                               |
| C2   | 线上版 MCP（HTTP）                   | 用户 | 等用户准备好服务器并授权部署后再做                                                                                            |
| C3   | 决定 `/workbench` Studio 去留        | 用户 | 已知问题：Studio 的 `global.motionDuration`（默认 180ms）会覆盖全局动效 token；保留则需改为跟随 token，撤掉则删入口与回归测试 |

**每接入一个组件的清单**（A1–A3 都按此做，全部做完才算完成）：

1. `docs/src/lib/features/workbench/<组件>-tuning.ts`：导出 `TunerSpec`（类型见 `tuner.ts`）——参数、取值校验、`readBaseline`（读当前值；Dialog 读 registry 源码，Button 量取页面元素）、`previewCss`（实时预览）、`overrideClasses`（写回的工具类）、只读 token 列表、独立的 `storageKey`。全局 token 只能选档位，不能在此修改数值。
2. `<组件>-tuner.svelte`：只写画布，外壳用 `<ComponentTuner spec={…}>`；参照 `dialog-tuner.svelte`。
3. `docs/src/lib/components/component-preview-tabs.svelte`：让该组件文档页的首个示例套上编辑器。
4. `style-overrides.ts` 的 `OVERRIDE_RULES`：为该组件每个 `cn-*` 类登记允许的工具类（颜色和任意值不允许）。改完必须重启开发服务 `amp orb service restart docs`。
5. 测试：`docs/tests/workbench.test.ts` 加当前值读取（至少两套样式，如 nova、vega）、写回后的安装源码、白名单拒绝用例；`docs/e2e/workbench.spec.ts` 加编辑器用例（打开、调参生效、并排对比、保存版本、Esc 归还焦点）。
6. 实测：开发站真实写回一次并检查 `static/registry/styles/<样式>/<组件>.json`，之后用 `git checkout` 恢复 `styles/valar/style-*.css` 与 registry 文件；截图检查 1440、390 宽度和深色。
7. 全量检查：`pnpm test`、`pnpm check`、`NODE_OPTIONS=--max-old-space-size=3072 CI=true pnpm build`、docs 目录下 `CI=true pnpm exec playwright test`。
8. 更新本表状态和“第 7 步的做法”中的组件列表；未经用户同意不提交推送。

第 8 步的做法（推广到其他组件时沿用）：

- 规范写在组件目录的 `RULES.md`（`docs/src/lib/registry/ui/<组件>/RULES.md`），中文、每条可执行，能机器检查的注明规则编号；随 registry 一起安装。
- CLI `add` 后把已装组件的规范与通用规则写进消费者项目 `AGENTS.md` 的托管区块（`packages/cli/src/utils/design-rules.ts`）；`valar-svelte lint` 检查可机械判断的规则，error 使命令失败。
- 新增规则时同时更新：`RULES.md`、`design-rules.ts` 的检查、`packages/cli/test/utils/design-rules.test.ts`、安装文档“AI 与设计规范”。
- 后续：为其余组件补 `RULES.md`（优先表单、弹层）；规范中的数值应与全局 token 和组件参数同源，做完第 5 步后改为从 token 生成，避免两套数字。

第 9–12 步的约定（2026-10-31 用户确认，参照 https://uiarc.dev/docs/ai ）：

- 第 9 步：说明卡放在组件目录（如 `meta.json`，与 `RULES.md` 并列），字段包括用途、关键词、分类、何时用／何时不用、无障碍与响应式注意、相关组件；目录、文档、技能包和 MCP 都从它生成，不在别处另写。先覆盖常用的 15–20 个组件，并加检查：缺说明卡的组件逐项列出，不静默跳过。
- 第 11 步：页面组合、文案、动效方法由用户本人编写，AI 只建立文件结构和入口，不代写这些内容。
- 第 12 步：工具参照 Arc 的 search_components、list_components、get_component、get_install_command、get_skill；只读，数据来自第 9、10 步。先做通过 CLI 在本机启动的版本；线上版需要部署网站和域名，等用户准备好服务器并授权后再做。所有组件免费公开，不做 Arc 的登录与 Pro 令牌机制。

第 7 步的做法（2026-11-01 完成，接入新组件时沿用）：

- **共用外壳**：`docs/src/lib/features/workbench/component-tuner.svelte` 负责全屏编辑器的一切共用部分（顶栏、仅草稿／并排对比、浅深色、DialKit 面板、已修改参数、只读全局 token、命名版本与备份、写回确认）。各组件只提供一份参数说明 `TunerSpec`（类型在 `tuner.ts`）和画布：Button 是 `button-tuning.ts`＋`button-tuner.svelte`（变体矩阵），Dialog 是 `dialog-tuning.ts`＋`dialog-tuner.svelte`（内联渲染真实 Dialog，带“重播进入与退出”）。`parameter-dials.svelte` 按参数说明生成 DialKit 面板；`component-preview-tabs.svelte` 决定哪个示例套上编辑器。
- **当前值从哪来**：Button 量取页面上真实按钮的尺寸；Dialog 读取当前样式安装出去的 registry 源码（`parseDialogSource`），所以 8 套样式各自显示自己的默认值。
- **Dialog 参数**：宽度档、内边距、内容间距、圆角档位（含“样式自带”）、遮罩不透明度、动效档位（快／中／慢，只选全局 token 的档位）、出现时缩放（组件自己的动效参数）。改内边距时，带“出血”页脚的样式（如 nova）同步调整页脚负边距，页脚仍贴边。
- **写回白名单**：`style-overrides.ts` 的 `OVERRIDE_RULES` 按每个 `cn-*` 类规定允许的工具类；颜色、任意值、未登记的类一律拒绝。合并用 `packages/parity` 的 `mergeClasses`，补足 tailwind-merge 识别不了的 `zoom-in-*`、`duration-*`、`ease-*`。
- **注意**：开发站的写回校验规则在 vite 配置中加载，改了 `style-overrides.ts` 后要重启开发服务（`amp orb service restart docs`），否则新组件写回会提示“参数无效”。
- 测试：`docs/tests/workbench.test.ts`（Dialog 当前值读取、写回后的安装源码、白名单）、`docs/e2e/workbench.spec.ts`（Dialog 编辑器）、`packages/parity/test/inject-style-classes.test.ts`（`mergeClasses`）。

第 6 步的做法（2026-11-01 完成）：

- **分层**：全局 token 只管“每档多快、用什么曲线、边框多粗”；组件只选档位。组件特有的位移距离、缩放幅度、显示延迟属于组件参数，在组件编辑器中调（Dialog 已有“出现时缩放”）。
- **token**：`motion-duration-fast|normal|slow|interaction`（默认 100／200／300／150ms）、`motion-ease-enter|exit|standard`、`border-width`（1px）。和 `radius` 一样放在主题的 `light` 中、对深浅色都生效；默认值在 `token-overrides.ts` 的 `VALAR_TOKEN_DEFAULTS`，由 `themes.ts` 的 `DEFAULT_BASE_THEMES` 加到每个基础主题（上游主题数据不变），`/themes` 以此为“默认值”比较和恢复。
- **映射**：`packages/cli/src/tailwind.css` 的 `@theme inline` 把它们映射为 `duration-fast` 等工具类、`transition` 的默认时长与曲线、`border` 的默认粗细，并带回退值，旧项目没有这些变量时外观不变；同一文件在“减少动态效果”时把快／中／慢设为 1ms。CLI 写入 CSS 时不再为这些变量生成 `@theme` 镜像（`update-css-vars.ts`）。
- **替换写死值**：上游 `styles/style-*.css` 不改。`packages/parity/src/inject-style-classes.ts` 的 `TOKEN_UTILITIES` 是唯一的对照表（`duration-100→duration-fast`、`200→normal`、`300→slow`、两种快出慢停曲线→`ease-enter`、慢起快走→`ease-exit`、`ease-in-out→ease-standard`），由 `applyTokenUtilities` 在 registry 构建和文档站组件展开时应用。保留写死的：`duration-1000`（输入光标闪烁）、`duration-400`（消息滚动按钮退出）、`ease-linear`（进度、侧边栏宽度）。上游的 `ring-*` 焦点环和卡片描边（`ring-1`）属于各样式的特色，不跟随边框 token。
- **编辑与检查**：`/themes` 的“动效与边框”分组（Slider Field、下拉选曲线）和右侧“动效预览”可重放进入／退出；`valar-svelte lint` 新增警告 `valar/motion-token`，AGENTS.md 规范区块要求只用档位，何时用哪档以用户编写的 `guides/motion.md` 为准。
- 测试：`packages/parity/test/inject-style-classes.test.ts`（对照表）、`docs/tests/token-overrides.test.ts`（格式白名单与默认值）、`packages/cli/test/utils/transformers.test.ts`（CSS 写入）、`design-rules.test.ts`（lint）。

第 9–12 步的做法（2026-10-31 完成）：

- **说明卡**：`docs/src/lib/registry/ui/<组件>/meta.json`，字段与校验在 `docs/src/lib/registry/component-cards.ts`（`title`、`description`、`categories` 六选一，`meta.valar` 下为关键词、何时用、何时不用＋改用组件、无障碍、响应式、相关组件）。`REQUIRED_CARDS` 列出必须有卡的 20 个组件；`docs/tests/component-cards.test.ts` 检查覆盖、引用的组件确实存在。其余组件进入 `catalog.json` 的 `missingCards`，构建日志逐项列出。补卡：新建 `meta.json` 并把组件名加入 `REQUIRED_CARDS`。
- **AI 资料**：`build-registry` 生成 `static/registry/catalog.json`（说明卡＋渲染好的 markdown＋`RULES.md`＋文档链接＋安装命令）和 `static/registry/skills/valar-svelte.json`；`pnpm build` 的 `build:llms` 生成 `llms.txt`（加了 AI 资料入口）、`llms-small.txt`、`llms-full.txt`，组件 `.md` 顶部插入说明卡。文本格式只在 `docs/src/lib/registry/catalog.ts` 中定义。
- **技能包**：`skills/valar-svelte`（由上游 `skills/shadcn-svelte` 改名改写）。`SKILL.md` 开头是 Valar 工作流程：查目录选组件 → `add` → 读 AGENTS.md 规范区块 → `lint`。上游的页面组合建议和组件选择表已删除，选组件只看说明卡。`guides/page-composition.md`、`copywriting.md`、`motion.md` 是占位，**由用户本人编写，AI 不得代写**。
- **MCP**：`packages/cli/src/commands/mcp`＋`src/utils/mcp.ts`，stdio、换行分隔 JSON-RPC，无额外依赖。工具：list_components、search_components、get_component、get_install_command、get_skill，只读。数据来自 `--registry`（URL 或本地目录）、components.json 的 registry 或默认本地站。测试 `packages/cli/test/utils/mcp.test.ts`；用户文档在安装页“给 AI 的组件资料与 MCP”。
- 后续：补齐其余组件说明卡（优先表单、弹层）；用户写好 `guides/` 后，MCP 的 get_skill 自动返回新内容；线上版 MCP（HTTP 传输）等服务器就绪并授权后再做。

第 5 步的做法（全局 token 配置页，`/themes`）：

- 页面左侧编辑一个基础主题（neutral、stone 等 7 个）的颜色 token（浅色、深色分开，按“页面与表面／主次与强调／边框与焦点／图表／侧边栏”分组）、圆角基数 `--radius` 和字号阶梯 `text-xs`～`text-xl`；控件是 Color Picker 和 Slider Field。右侧（窄屏在下方）多组件展示区实时预览草稿，草稿只作用于展示区，不影响站点其他部分。
- 颜色以 OKLCH 存储，Color Picker 使用十六进制，二者在 `docs/src/lib/features/workbench/token-overrides.ts` 换算；带透明度的 token（如深色 `border` 的 10%）改色后保留透明度。
- 写回：确认框列出每项“原值 → 新值”，确认后把**与上游不同的值**整体写入 `docs/src/lib/registry/styles/valar/tokens.json`（按基础主题分节），重建 registry；失败恢复原文件，不自动提交。“恢复上游”后再写回即清空该主题的定制。
- 生效范围：`themes.ts` 把 `tokens.json` 叠加到上游基础主题得到 `BASE_THEMES`，因此 `registry/colors/<主题>.json`、`/init` 预设（`valar-svelte init` 使用）和 `/themes` 预览都会用新值；字号写到 `@theme inline` 的 `--text-*`。文档站自身的外观变量在 `docs/src/app.css`，不随之改变。上游主题数据和 `styles/style-*.css` 保持原样。
- 测试：`docs/tests/token-overrides.test.ts`（换算参考值、输入白名单、合并与序列化）。
- 后续：`RULES.md` 中的数值改为从 token 生成。

## 组件内按需微调：Button 样板

新的建设方向是为现有组件增加按需编辑能力，不重新实现组件，也不扩展 React／Vue。
Button 文档 `/docs/components/button` 的首个示例提供“微调 Button”入口；默认不加载或显示 DialKit 面板。
点击后进入**全屏编辑器**（方向 B，2026-10-31 确认）：顶栏是修改计数、版本名称、保存版本、写回组件库和关闭；左侧画布同时展示 6 个变体 × 4 个尺寸及图标按钮，可切换“仅草稿／并排对比”和浅色／深色；右侧是 **DialKit 2.1.0** 原生 `inline` 嵌入模式面板，加上已修改参数和只读全局 token。
编辑器使用 Valar Dialog，Esc 或关闭按钮退出并把焦点还给“微调 Button”；写回确认使用 Alert Dialog。DialKit 不再浮动，面板自带的 Copy 和版本缩略图（Save version）保留，DialKit 2.1.0 不支持关闭它们。
DialKit 原生缩略图遵循默认的本次会话语义；页面中的命名保存／备份继续负责跨刷新保留，二者不伪装成同一份持久版本。

### 参数分层（2026-10-31 确认）

- **全局 token**：颜色、圆角基数 `--radius`、字号阶梯影响所有组件，组件页只读显示当前值，统一在全局 token 配置页 `/themes` 修改。
- **Button 组件参数**：特小／小／默认／大四个尺寸各自的高度、横向内边距、图文间距（px），以及圆角档位（none～full，具体大小仍由全局圆角基数决定）。
- 尺寸参数作用于该尺寸的所有变体；同档图标按钮跟随高度。带图标一侧的收窄内边距保留上游设定。
- 动效与边框宽度目前没有全局 token，第二期先建立 token 再接入。旧版的单按钮颜色、左右分开的内边距不再提供。

### 写回组件库

- 只在本地开发站（`pnpm dev` 或 orb 的 docs 服务）出现“写回组件库…”；生产构建和预览没有写入接口。
- 确认框列出目标文件和每项“原值 → 新值”。确认后写入 `docs/src/lib/registry/styles/valar/style-<样式>.css`，自动重建 registry 并刷新页面；重建失败会恢复原文件。
- 上游 `styles/style-*.css` 保持原样。构建、文档站和 CLI 安装都会把 Valar 定制文件叠加在上游之上，冲突的工具类以定制为准（如 `h-8` 被 `h-11` 替换）；文件为空时输出与上游完全一致。
- 写入接口只接受 Button 尺寸／间距／圆角档位工具类，拒绝颜色、任意值和其他组件。多次写回会保留之前写入的其他尺寸。
- 写回后的改动和其他源码一样需要提交到 Git 才能保留；不会自动提交、发布或部署。也可以手动编辑定制文件。

### 版本与备份

- 命名版本保存到浏览器 `valar.button-styles.v2`（格式 2，与旧版 v1 不兼容），最多 50 个，同名拒绝覆盖，存储失败保留草稿。
- 对比可选择“当前组件库样式”或历史版本；JSON 备份可在其他浏览器导入，样式不一致时拒绝导入。备份不是安装包。

实现入口：`button-tuning.ts`（参数与类名映射）、`button-tuner.svelte`（画布）、共用外壳 `component-tuner.svelte` 与按需加载的 `parameter-dials.svelte`、`style-overrides.ts`（写入校验与序列化），写入接口在 `docs/vite.config.ts` 的开发服务器中。
单元测试 `docs/tests/workbench.test.ts` 覆盖写回后的安装源码、连续写回保留和非法输入拒绝；浏览器回归 `docs/e2e/workbench.spec.ts` 覆盖实际初值、跨变体影响范围、圆角档位跟随全局基数、只读 token、生产站无写回入口、版本对比恢复与存储失败。

## 当前交付边界

入口：路径 `/workbench`（2026-10-31 起已不在主导航中）。

本轮先打通 Button、Dialog、Tooltip、Accordion 的完整流程，共 65 个全局／组件参数。
这是首批接入，不是四个组件全部 API 参数化，也不是 66 个组件全部完成。
逐项状态以[组件覆盖清单](../docs/src/lib/features/workbench/coverage.ts)和工作台中的“全部组件覆盖清单”为准。
其余 62 个组件尚待接入；不能因为使用全局 token 就标记已接入。

## 设计师使用流程

1. 选择左侧组件；手机上使用“选择组件”下拉框。
2. 在“参数调节”中拖动数值、输入精确数值、选择颜色或切换交互选项。
   数值均标注单位。独立圆角、配色和动效要先关闭对应“继承全局”开关才生效。
   DialKit 的开关文字暂保留 On／Off，分别表示开启／关闭。
3. 在真实组件画布中悬停、按下、打开、关闭或用键盘操作。
   可切换窄画布、深色背景及禁用状态；这些测试状态不作为安装默认值导出。
4. 草稿自动保存在当前浏览器；可撤销／重做最近 50 次参数修改。
   输入版本名称并“保存版本”，可保留最多 20 个具名版本；同名会替换。
   “已存版本”用于恢复，“删除此版本”仅删除本地版本，不修改当前草稿。
5. “导出可安装预设”下载 `valar-preset.json`，包括预设元数据、原生组件源码和 CSS。
   这个文件既可重新“导入”继续编辑，也可交给开发者安装。
   导入失败不会覆盖当前草稿；“重置当前”和“重置全部”均可撤销。

**保存不等于发布。** 当前没有云端账号同步或服务器写入仓库的功能。
浏览器清理、换设备或使用隐私模式可能丢失本地版本，请导出文件备份。
存储不可用时会明确提示；不静默声称已经持久保存。

## 当前参数范围

| 层级      | 首批可调项                                                                                                        |
| --------- | ----------------------------------------------------------------------------------------------------------------- |
| 全局      | 圆角、字号、背景／文字／主色／主色文字、动效时长与缓动                                                            |
| Button    | 继承开关、默认尺寸的高度与横向内边距、主按钮配色、悬停配色与缩放、按压缩放、过渡时长与缓动                        |
| Dialog    | 继承开关、宽度、内边距、圆角、面板背景、遮罩透明度、进入／退出时长、位移、缩放、缓动、Esc／外部点击关闭、关闭图标 |
| Tooltip   | 继承开关、圆角、字号、内边距、背景／文字、显示延迟、首选方向与间隔、进入／退出时长、位移、缩放、缓动              |
| Accordion | 继承开关、圆角、项目间距、边框、标题／内容内边距、展开时长与缓动、单项／多项、禁用                                |

按钮的 outline／ghost 等变体保留自己的配色；icon 等非默认尺寸不被主按钮尺寸覆盖。
Tooltip 的方向是首选方向，碰撞检测仍可能翻转它。
当前缓动为五种 CSS 选项；自由贝塞尔、物理弹簧、时间线以及按状态编辑更多参数仍待扩展。
系统“减少动态效果”始终优先于工作台动画设置。
函数、snippet 和业务校验不伪装成数字参数；后续接入应为它们提供明确的场景控件及能力说明。

## 开发者安装

目标项目需先按安装文档初始化 Svelte 5、Tailwind CSS 4 和 `components.json`，并能访问 Valar registry。
自有包仍为 private，不能从 npm 安装尚未发布的包。可使用仓库 CLI，或打包后的本地 CLI tarball。

从仓库运行：

```sh
pnpm --filter @valar/svelte-cli start add /absolute/path/valar-preset.json --cwd /absolute/path/your-app --yes
```

CLI 按目标项目的别名安装四个原生组件并写入 CSS，不依赖 DialKit 运行时。
交互默认值写入组件源码，调用方显式属性仍可覆盖它们。
Accordion 省略 `type` 时采用预设的默认类型；显式的另一种类型仍保留正确的值类型约束。
若目标项目已有这些组件，应先提交或备份，再审阅覆盖提示，不要盲目使用 `--overwrite`。
导出当前基于 Vega 源码；不声明其他七套样式已经具有相同工作台导出合同。

## 实现与后续覆盖顺序

- [参数合同](../docs/src/lib/features/workbench/model.ts)：中文名称、单位、范围、默认值、继承开关及导入校验。
- [样式生成](../docs/src/lib/features/workbench/styles.ts)：预览和导出共用，包含状态选择器、关键帧与减少动态效果规则。
- [安装文件生成](../docs/src/lib/features/workbench/export.ts)：依赖去重、源码默认值、CSS 和可恢复的元数据。
- 画布使用独立同源 iframe，弹层与样式不污染工作台；消息校验来源及参数合同。
- 主草稿是唯一状态源；切换组件、导入、重置、撤销后重新建立 DialKit 面板，避免使用过期配置。

（Studio 时期的旧顺序，Studio 已暂停扩展：基础展示与布局 → 输入与表单 → 其余弹层与导航 → 日期、图表和复杂组合 → 消息与其他新增组件。当前顺序以文首“路线图与下一步”为准。）
每个组件接入前明确参数及状态合同，完成真实预览、保存恢复、导出和独立安装验证后才更新覆盖状态。
不使用统一 CSS 通配符冒充每个组件已经完成。

## 验收入口

```sh
pnpm test
pnpm check
pnpm build
pnpm --filter docs test:e2e
```

- `docs/tests/workbench.test.ts`：参数范围／注入拒绝、独立导入对象、CSS 与安装文件一致、生成源码编译及 Accordion 类型合同。
- `docs/e2e/workbench.spec.ts`：真实控件编辑、撤销重做、刷新／画布重载、版本恢复、导出再导入、错误输入不覆盖、弹窗焦点及减少动态效果、320／390／768px 与触摸标签页。
- `docs/scripts/check-consumer.ts`：真实 CLI tarball 在工作区外安装下载 JSON，严格检查第三方声明、生产构建，再验证安装后的 58px 按钮、Esc 忽略、650ms Tooltip 延迟／底部方向、多项 Accordion。

2026-10-31 实测：`pnpm test` 共 551 项通过；`pnpm check` 通过，Svelte 检查零错误、零警告；
`NODE_OPTIONS=--max-old-space-size=3072 CI=true pnpm build` 通过；生产预览上的全部 9 项 E2E 通过（含独立消费者）。
桌面默认态、Dialog／Tooltip／Accordion 展开态、手机两个页签的截图已检查；18.7 秒真实指针操作演示已逐帧检查。

浏览器手机验收使用 Chromium Pixel 7 触摸模拟，不等于真实 Android 或 iOS Safari 设备验收。
本记录说明源码与本地运行验收；提交及推送状态以 Git 历史为准，不代表 npm 发布或网站部署。

## DialKit 与 Valar 组件对照（2026-10-31）

规则：Valar 已具备 DialKit 全部控件后才考虑平替；否则继续使用 DialKit，再逐项补足。对照 DialKit 2.1.0 的 15 类控件：开关、下拉、分段、文本、折叠分组、操作按钮 6 项已有；数值滑块（滑块 + 输入）、图片选择 2 项部分具备；颜色、弹簧／缓动曲线、二维拖动板、时间线、版本缩略图、快捷键、浮动面板 7 项缺失。结论：继续使用 DialKit。

本轮补足 **Slider Field**（滑块 + Number Field 组合）与 **Color Picker**（原生色盘 + 十六进制 + 预设，值为 `#rrggbb`），各有文档页、示例、registry 条目和单元测试。剩余缺口按全局 token 配置页等实际需要再补。
