# Number Field：Vue → Svelte 转换记录

## 1. 基本信息与范围

- 规范 1.0；日期 2026-10-31；执行 Amp，未独立审阅；状态：完成（本地，未提交；按下述范围验收，不声明 Reka 全 API 等价）。
- 范围依据：VCOMP-001 及用户“按顺序全部完成”。保留编辑、步进、格式、空值、表单与无障碍合同。
- 参考 `unovue/shadcn-vue` 提交 `4d6963aa8a482be7609cb05d3f8b7fe42082b634` 的 `apps/v4/registry/new-york-v4/ui/number-field/`；行为参考 `unovue/reka-ui` 提交 `0547ab8d0e50d27b89c1829712eebaf509a07e13`（2.11.0）的 `packages/core/src/NumberField/` 及测试。两者 MIT，版权见各仓库 LICENSE。未复制 Vue 实现代码。
- 目标 Svelte 5、TypeScript、Tailwind 4；Node 24.22.2、pnpm 12.14.0。Bits UI 2.20.0 没有对应原语，选择 Svelte 原生 input/button。
- 新依赖 `@internationalized/number` 3.6.9（lockfile），Adobe Apache-2.0；源码 gitHead `1abc52dd5ad238143f168912963ff3ad932547a4`。直接消费带许可证的包，不复制或重许可源代码。官方 API：https://react-spectrum.adobe.com/internationalized/number/NumberParser.html 。
- 仅使用现有语义主题 token 和逻辑方向样式，不重设计全库。支持现代浏览器；不承诺任意精度、真实设备或辅助技术认证。

## 2. 能力对照

| 来源行为      | Svelte 行为 / 实现                                     | 有意差异                                               | 验证                                                                          |
| ------------- | ------------------------------------------------------ | ------------------------------------------------------ | ----------------------------------------------------------------------------- |
| model/default | bind:value/defaultValue，onValueChange                 | 空值 undefined；可解析编辑实时反映模型                 | 受控外部更新、空值及非绑定默认值回归通过                                      |
| 草稿/规范化   | 独立 text，blur/Enter/step 规范化                      | 无效文本保留并阻止提交，不静默回滚                     | `-`、`-1.`、`-1.26 → -1.3`、越界钳位通过                                      |
| 地区/格式     | Adobe NumberParser + Intl.NumberFormat                 | 固定默认地区 en-US；格式精度应用到提交模型             | 德语 `1.234,56 € → 1234.56`；百分比 5% 清空仍为空，通过                       |
| keyboard      | arrows/Page/Home/End，IME guard                        | 不提供 wheel/hold repeat，避免误改；原生点击和键盘步进 | 自动测试含 off-grid `18.98 → 19`、负小数、readonly Home；浏览器交互见共享验收 |
| form          | name 数字字符串、required/disabled/readonly/form/reset | 增加原生 reset；FormData 不触发归一化                  | 提交、重置、取消重置、禁用不提交、只读保留值通过                              |

## 3. 状态与集成

单一 bindable 数值 + 独立编辑字符串。内部回声不格式化；外部更新覆盖草稿。空/无效/范围错误/有效/只读/禁用分别处理。同步解析，无业务请求；reset 在原生默认动作后的任务恢复模型和 DOM，卸载取消该任务并移除表单监听。HTML/ARIA/事件转发到 input，ref 指 input，class 指容器。控制模式不在运行中切换。

## 4. 逐项验收

| 维度             | 适用性及场景                                  | 实际结果及证据                                                                             |
| ---------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 状态与数据       | 适用：初始/外部/空/边界                       | 通过：`docs/tests/number-field.test.ts` 三项合同测试；输入回声不重格式化                   |
| 表单语义         | 适用：name/required/reset/disabled/readonly   | 通过：FormData、原生 checkValidity、重置及取消重置；独立消费者实际提交                     |
| 键盘与焦点       | 适用：Tab、方向/Page/Home/End/Enter           | 通过：自动回归及浏览器步进/失焦；按键共用只读守卫，原生按钮可键盘激活                      |
| 无障碍           | 适用：名称/spinbutton/描述/invalid            | 通过 DOM 语义及约束校验检查；真实屏幕阅读器未验证，不作为辅助技术认证                      |
| 输入法与国际化   | 适用：组合状态/选区/粘贴/地区                 | 通过合成组合事件、浏览器编辑及德语/百分比回归；真实系统输入法未验证                        |
| 触摸与指针       | 适用：按钮/窄屏/页面滚动                      | 通过桌面点击及 Chromium Pixel 7 touch emulation，tap 从 0.3 到 0.4；真实设备/软键盘未验证  |
| 异步与生命周期   | 适用：reset 后置任务及监听清理；无业务请求    | 通过取消 reset、连续 reset 回归与卸载清理检查；不提供长按计时器或网络异步                  |
| SSR 与 hydration | 适用：固定 locale 和初始文本                  | 通过独立 SvelteKit SSR/客户端挂载，无 hydration/pageerror；见共享记录                      |
| 弹层与布局       | 适用：表单组合、min-w-0；自身无 Portal/滚动锁 | 通过表单与窄屏组合；不新增定位或焦点陷阱                                                   |
| 视觉与适配       | 适用：浅深/窄屏/无效/禁用/只读                | 通过截图检查；见共享记录中的浅深及触摸窄屏产物                                             |
| 性能与资源       | 适用：连续输入和卸载；非大列表                | 连续编辑/步进无丢字符；源码核对 effect/监听清理；未作吞吐量或包体基准承诺                  |
| 安全与隐私       | 适用：不可信输入文本                          | Svelte 文本转义；无 HTML 执行、远程请求、统计或外传；源码核对通过                          |
| 类型与依赖       | 适用：公共类型、解析依赖                      | docs check 0/0；独立消费者公共 NumberFieldProps 导入检查通过，解析器在 registry 依赖闭包内 |
| 分发与集成       | 适用：本地 CLI tarball + registry             | 实际 init/add、独立 check/build/交互通过，不依赖 monorepo 路径                             |

## 5. 可重复证据

- 自动回归：`pnpm --filter docs exec vitest run tests/number-field.test.ts`，3 项通过；完整检查、环境、分发步骤及浏览器结果见[共享验收记录](acceptance-2026-10-31.md)。
- 重现：输入 `-`、`-1.` 保留原文；输入 `-1.26` 失焦为 `-1.3`，上箭头为 `-1.2`；越界 `9` 在提交前 invalid、失焦钳为 `2`；`oops` 不被静默丢弃。重置恢复 `0.3`。
- 地区测试验证显示与提交的独立预期，不从实现推导期望。百分比清空回归避免解析器把空字符串变零。

## 6. 交付

组件 `docs/src/lib/registry/ui/number-field/`（含 index 公共导出）；示例 `number-field-demo.svelte` / `number-field-form.svelte`；文档 `docs/content/components/number-field.md`；registry 已由现有脚本生成到 8 个 style 的 number-field.json。

结论：VCOMP-001 约定能力本地完成；不提供 Reka 的全部 API、滚轮/长按重复或任意精度数值。真实系统输入法、物理设备和读屏未验证，集成项目仍应按自己的支持环境验收。后续升级必须保留编辑草稿、off-grid 方向步进、百分比清空与原生表单回归。来源/许可与有意差异保存在本记录；依赖原许可证随安装包保留。
