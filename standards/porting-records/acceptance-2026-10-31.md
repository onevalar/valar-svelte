# 2026-10-31 剩余任务共享验收记录

状态：本轮约定范围本地完成；未提交、推送、发布 npm 或部署。执行者 Amp，未独立审阅。遵循转换规范 1.0；用户要求检查剩余任务并按顺序全部完成。

## 1. 顺序与交付边界

1. 测试／环境／本地分发修复：一次性测试入口、跨目录 registry build、本地私有 CLI tarball、初始化保留 tarball、fresh orb nvm 加载。
2. [Number Field](number-field-vue-to-svelte.md)：数值草稿／模型、地区解析、步进、表单、只读及重置。
3. [Tags Input](tags-input-vue-to-svelte.md)：标签／草稿、统一添加校验、IME、键盘、原生表单及重置。
4. [Stepper](stepper-vue-to-svelte.md)：稳定 ID、统一前进门禁、异步取消和过期隔离、动态步骤、数据／焦点关联。
5. [Direction／RTL](direction-bits-ui-to-svelte.md)：原语能力报告、使用指南、代表组合，以及三类子菜单箭头实际修复。不增加第二套 Provider。

每项有公共类型／导出、文档和示例；前三项在 8 个 style 中生成 registry 条目。方向示例是 docs 示例，不是可由 CLI add 安装的独立组件。Input OTP／Sonner／Form 仅做已有能力的源码与接口审查，不重复新增，也不冒充三个系统的全面运行时回归。

## 2. 环境与支持范围

- Linux x64 orb；Node **24.22.2**，pnpm **12.14.0**。
- Svelte **5.57.2**、SvelteKit **2.70.1**、TypeScript **5.9.3**、Tailwind **4.3.3**；仓库 Vite **8.1.5**，独立消费者 Vite **8.3.5**。
- Bits UI **2.20.0**；新增解析依赖 `@internationalized/number` **3.6.9**。固定来源与许可见各记录。
- Chromium **156.0.8078.73**；桌面 1280×1100 / 1280×800、DPR 2，真实 fine pointer／hover 设置；窄屏为 Chromium Pixel 7 设备描述符，DPR 2，确认 `(pointer: coarse)` 并使用 tap。
- 浅色／深色、LTR／RTL／局部 LTR、中文／阿拉伯文／英文混排；德语货币与百分比回归。组合输入为合成事件验证，不是操作系统 IME 实机验证。
- 真实系统输入法、真实屏幕阅读器、物理触摸设备／软键盘、Firefox／Safari 未验证；不作跨浏览器、辅助技术认证或全库 RTL 认证。未做大列表、吞吐量或包体基准。

## 3. 执行的检查与结果

以下命令均使用上述固定工具链，2026-10-31 执行。记录决定性输出，避免仅以临时日志路径代替证据。

| 命令                                                            | 实际结果                                                                                                 |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `bash .agents/setup`                                            | fresh 路径修复后通过；重复运行 32 秒，以 `ready: node v24.22.2, pnpm 12.14.0` 结束                       |
| `pnpm build:cli`                                                | CLI、parity、primitives、addon 构建通过                                                                  |
| `pnpm test`                                                     | **538 项通过**：addon 4、CLI 268、parity 106、primitives 147、docs 13；无跳过 registry 模板测试          |
| `pnpm --filter @valar/svelte-cli exec tsc --noEmit`             | 通过                                                                                                     |
| `pnpm --filter @valar/svelte-registry exec tsc --noEmit`        | addon 对应目录 `sv-addons/registry` 的 TypeScript 检查通过；可在该目录执行 `pnpm exec tsc --noEmit` 重现 |
| `pnpm --filter docs check`                                      | `svelte-check found 0 errors and 0 warnings`                                                             |
| `NODE_OPTIONS=--max-old-space-size=4096 pnpm build`             | 生产 SSR／客户端／预渲染／llms 构建通过；没有执行部署                                                    |
| 改动 TS／Svelte 文件的 scoped ESLint、oxfmt；`git diff --check` | 通过；不宣称未改动的全仓历史格式均符合 formatter                                                         |
| 独立消费者 `pnpm check` / `pnpm build`                          | **0 errors / 0 warnings**；SvelteKit 生产构建通过                                                        |

主站第一次与浏览器／开发服务器并行构建时被系统终止，退出 **137**（内存不足）。关闭这些进程后隔离重跑成功，没有关闭类型检查或修改测试期望来制造通过。构建仍有既有大 chunk、Vine 的 `node:dns/promises` 浏览器 externalization 等警告，不把这些警告描述为本轮修复。

新增或扩展的永久合同回归位于 `docs/tests/{number-field,tags-input,stepper,registry}.test.ts`；使用 Svelte 公共入口、DOM、FormData、焦点和导航结果断言，不测试私有辅助函数。CLI registry 模板回归从工程外传 `--cwd` 构建；addon 回归检查生成的可执行命令与私有依赖策略。

### 原生 reset 的真实失败与修复

浏览器中输入数值后点击原生 reset 按钮，修复前提交模型恢复 `0.3`，但可见 input 为 `""`。事件探针显示后续 reset listener 已看到 `0.3`，说明微任务在浏览器默认清空输入之前执行。仅改成下一任务仍不足以处理“状态本来就等于初始值”的重复 reset。

最终在原生默认动作之后恢复模型和草稿，并显式同步 DOM 值；取消的 reset 不恢复，卸载清理恢复任务。永久回归对连续两次 reset 断言 `0.3`：缺少 DOM 同步时实际为 `""`，该用例先失败后通过。标签测试同时覆盖非空初始草稿 `draft` 的连续重置。真实按钮点击重新验证通过；因此不只依赖 jsdom 的 `form.reset()` 语义。

## 4. 实际分发到独立消费者

消费者创建于 `/tmp/valar-independent-consumer`，不在 pnpm workspace 中；使用 SvelteKit 2／Svelte 5 支持范围，公共 `$lib/components/ui/.../index.js` 导入以及导出的 Props／Step 类型，不引用仓库运行时文件。

实际路径与命令：

1. 在 `packages/cli` 使用 `pnpm pack --pack-destination /tmp` 得到 `valar-svelte-cli-0.1.0.tgz`；消费者 `pnpm add -D /tmp/valar-svelte-cli-0.1.0.tgz`。
2. 运行已安装 CLI 的 `init --help` 核对参数，并实际 init 本地 registry。再次初始化后检查 package.json 的 `@valar/svelte-cli` 仍为 `file:/tmp/valar-svelte-cli-0.1.0.tgz`；不能把未发布私有包替换成 npm latest。
3. 使用已安装 CLI `add number-field tags-input stepper --cwd /tmp/valar-independent-consumer --yes`，并安装 Tabs／Slider／Popover／DropdownMenu／ContextMenu／Menubar 等已有依赖。修复后重新 add 两个输入组件并执行 check/build。
4. 本地 registry 由受监督 docs 服务提供；`direction-demo.svelte` 复制为消费者演示时改为安装后的公共路径。这是示例集成，不是伪造可安装条目。
5. 执行 `pnpm check` 与 `pnpm build`；浏览器验证真实安装的组件、样式与依赖闭包。没有使用 monorepo 的隐式解析路径。

额外尝试 **skipLibCheck=false** 的第三方声明全检查：Bits UI Button／Calendar 仍有 **2 项 TS2590**。标准消费者使用与仓库一致的 skipLibCheck=true，标准检查 0/0；这不是“所有第三方声明均可严格通过”。该上游兼容性边界已单独记录，不在本轮引入第三方类型补丁。消费者还固定 csstype 3.1.3，避免新版已移除类型与 Bits 2.20.0 的不兼容。

## 5. 已执行的浏览器场景

临时验证脚本仅用于验收，完成后删除；以下步骤和独立预期可重现，不将临时脚本作为消费者依赖。

| 场景           | 预期与实际结果                                                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Number Field   | composition 中草稿 1.2 不改变提交模型，结束后模型 1.2；`1.` 保留；PageDown→0、Home→−2、End→2；readonly End 保留 8.5，全部通过                |
| Tags／表单     | 非空 Enter 添加 Valar，不提交；空 Enter 提交 amount=2 及 Svelte／中文／Valar 三个重复 tags 字段；原生 reset 恢复 amount=0.3 和初始标签，通过 |
| 无效输入       | oops 保留且 aria-invalid=true；重复 Svelte 保留草稿并显示错误；form.checkValidity=false，通过                                                |
| Stepper        | 通过后聚焦关联 panel；首次异步失败留在第二步并显示错误，重试到第三步；等待时返回，旧结果不推进；输入数据保留，通过                           |
| 触摸模拟       | coarse pointer=true；tap 数值 0.3→0.4；删除中文；前进／等待／返回后不受过期结果影响；纵向布局无横向溢出，无 pageerror，通过                  |
| Tabs／Slider   | RTL Left／LTR Right 到下一 tab 或数值加 1；方向切换保留 Slider 值，通过                                                                      |
| body Portal    | Popover RTL 右沿／LTR 左沿与 trigger 对齐，误差小于 2 CSS px；Content 方向正确；Escape 关闭；代码块始终 LTR，通过                            |
| 三类子菜单     | Dropdown／Context／Menubar × RTL／LTR 六组合：Left／Right 打开、子菜单物理侧边正确，图标计算 rotate=180deg／none，通过                       |
| SSR／hydration | 独立 SSR 返回初始 0.3、rtl 和当前步骤 ID；客户端 ID 一致；pageerror 与 hydration 警告均为空，通过                                            |
| 深色／窄屏     | 等待颜色过渡完成后检查语义 token；宽窄屏无裁剪、重叠或横向溢出，通过。默认代码块 LTR、ContextMenu 覆盖右击目标均是有意行为                   |

自动测试另覆盖百分比清空、德语货币提交、off-grid 小数步进、标签重复／上限／自定义校验、IME 确认同轮保护、外部更新／只读／禁用、Stepper 异常／重试／防重入／外部更新／拓扑变化／卸载过期结果／中间项删除修复。

## 6. 视觉证据与交付状态

已检查的产物保存于 `.amp/in/artifacts/`，在[交付线程](https://ampcode.com/threads/T-01a18fb6-73d8-7039-9072-9475117325fd)中提供可直接查看的附图和录制，不纳入组件包：

- `consumer-light.png`、`consumer-dark.png`、`consumer-touch-narrow.png`：默认／深色／触摸模拟窄屏。
- `consumer-invalid.png`、`stepper-pending.png`、`stepper-error.png`、`stepper-success.png`：无效／等待／失败／重试成功。
- `direction-{rtl,ltr}-popover.png`、`menu-direction-comparison.jpg`：Portal 对齐和三个菜单的六状态。
- `valar-interactions.mp4` / `.loop.webp`：20 秒真实移动指针交互，数值、标签、Stepper 失败重试、RTL 嵌套菜单；另外按 5 fps 检查步骤区域确认短暂错误状态确实存在。

额外发现的既有共享组件问题：Slider 的 `aria-label` 透传给外层 span，内部 Thumb 未获名称；方向示例的可访问树实际显示无名称的 `slider: 35`。本轮验证方向键和数值，不把它描述为读屏认证。该共享封装的单／多滑块标签合同与回归已单独提出后续修复建议，未在本轮扩展其公共 API。

组件能力差异、14 个维度的适用性与实际结果见各组件记录。必要范围内无已知待实现项；上述真实设备／辅助技术／跨浏览器／严格第三方类型限制明确保留，不声称它们已通过。本地完成不等于提交、合并、发布或部署。
