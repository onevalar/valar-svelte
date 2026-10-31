# 2026-10-31 六项优化验收记录

状态：六项约定优化按顺序本地完成并验证；本轮尚未提交、推送或部署。GitHub 工作流已编写，远端执行仍待推送后验证。前一轮组件补充的历史记录保留不改，本记录只描述随后这轮优化。

## 1. 顺序与结果

| 顺序 | 优化                     | 实际结果                                                                                                                                                             |
| ---- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 正式文档手机可用性       | 修复 320px 页头溢出、手机没有搜索入口、标题／来源徽章不换行、搜索弹窗超出低高度视口。保留现有视觉设计与组件交互原语。                                                |
| 2    | Slider 可访问名称        | aria-label／aria-labelledby 交给可聚焦的 Thumb；多个 Thumb 可以用 thumbLabels 分别命名。补齐六个示例的名称与用法文档。                                               |
| 3    | 自有 CI                  | main push／PR：冻结安装、单元测试、工作区检查、生产构建、浏览器与独立消费者回归。固定 Action SHA、只读仓库权限，无发布／部署步骤。                                   |
| 4    | 持久浏览器与独立安装回归 | 新增 Playwright 六项公共行为回归；从本地 CLI tarball 建立工作区外的 SvelteKit 消费者，实际 init／add／check／build／浏览器检查。临时项目自动清理。                   |
| 5    | 严格第三方类型兼容       | 使用明确版本的 pnpm 声明补丁及 packageExtensions，独立消费者在 skipLibCheck=false 下 0 错误／0 警告，10 项公开类型合同断言通过。安装说明明确要求消费者显式带入配置。 |
| 6    | 有测量的加载优化         | 全文索引与搜索引擎首次打开搜索才加载；合并进行中的加载、复用成功缓存、失败可重试。关闭／卸载后不更新旧组件状态，静态导航搜索仍可用。                                 |

永久回归：`docs/e2e/contracts.spec.ts`、`docs/e2e/fixtures/`、`docs/scripts/check-consumer.ts`；运行步骤见 README。测试生产预览而非开发 HMR，CI 的 build 位于 test:e2e 之前。测试会安装第三方依赖，但不会发布自有包或部署网站。

## 2. 环境、命令与证据

Linux x64 orb，Node 24.22.2、pnpm 12.14.0；Svelte 5.57.2、SvelteKit 2.70.1、TypeScript 5.9.3、Bits UI 2.20.0、svelte-toolbelt 0.10.6；仓库其他包的 TypeScript 仍按 catalog 使用 6.0.3。浏览器为 Chromium 156.0.8078.73，DPR 2。

| 检查                                                | 决定性输出                                                                                                                                                 |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                    | Lockfile is up to date, resolution step is skipped；退出 0                                                                                                 |
| `pnpm test`                                         | 538 passed：addon 4、CLI 268、parity 106、primitives 147、docs 13                                                                                          |
| `pnpm check`                                        | 全部工作区通过；docs 与 primitives 均为 svelte-check found 0 errors and 0 warnings                                                                         |
| `NODE_OPTIONS=--max-old-space-size=4096 pnpm build` | SSR、客户端、预渲染及 llms 生成通过，退出 0                                                                                                                |
| `CI=true pnpm --filter docs test:e2e`               | 6 passed (51.5s)，使用 orb 已安装 Chromium 的 executablePath 覆盖                                                                                          |
| 独立消费者                                          | svelte-check found 0 errors and 0 warnings；生产构建通过；PASS independent tarball install, check/build, repeated native reset, tag Enter and named Slider |
| 改动 TS／Svelte 文件的 ESLint 与 oxfmt              | 无诊断；All matched files use the correct format                                                                                                           |
| CI YAML 解析及 `git diff --check`                   | 通过；确认只读权限，生产构建先于 E2E                                                                                                                       |

新增搜索回归在优化前的生产产物上先失败：搜索尚未打开时 Expected 0 requests / Received 1；优化后同一场景通过。还验证首次请求 503 后导航搜索可用、关闭重开重试、等待中关闭重开不重复下载、完成后再次打开使用缓存。

注册表重新生成后共 360 个 JSON 改动：352 个仅将 Bits UI／toolbelt 的版本范围固定到已验证版本；其余 8 个是 Slider 源码与名称改动。逐文件解析比对未发现其他源码漂移。

## 3. 手机、无障碍与交互验收

- Chromium Pixel 7 设备描述符，确认 pointer: coarse、DPR 2，并使用 tap；不是物理手机测试。
- 320／390／768px：Slider、Dialog、Number Field、Tags Input、Stepper、Data Table 正式文档无页面横向溢出。另检查 Installation、Direction；代码块与宽表示例允许在各自容器内横向滚动，不强制长代码挤入手机宽度。
- 手机长菜单实际滚动至 Formsnap 并跳转 `/docs/forms`，菜单关闭；手机搜索 Stepper，缩至 390×360 后输入／结果／关闭按钮仍在视口内，tap Close 可关闭。
- Slider 的 Volume／Minimum／Maximum／First、Second、Third level／Minimum、Maximum temperature 均通过真实浏览器可访问名称查询；键盘 ArrowRight 将 Volume 75 改为 76。
- 金额输入德语货币字符串后提交为 1234.56；重置清空。标签非空 Enter 添加但不提交，空 Enter 正常提交。独立消费者连续两次原生 Reset 都保持初始 0.3。
- Stepper 等待中后退、过期结果不推进、首次失败后重试、成功后关联内容区获得焦点，均通过。
- 浅色／深色、手机菜单、搜索结果、低高度搜索、加载中、失败提示、桌面原布局、安装说明新段落均截图检查；最终截图验收无 pageerror。录制了有真实移动指针、经过相邻控件与结果、搜索输入并用 Enter 导航至 Stepper 的 14.6 秒交互，检查了 4fps 联系表。

最终可审阅截图：`.amp/in/artifacts/opt-{mobile-default,mobile-menu,mobile-search,mobile-short-search,mobile-dark,search-loading,search-error,desktop,installation}.png`。录制为 `opt-interactions.mp4` 与 `opt-interactions.loop.webp`。在交付线程内提供内嵌视觉产物，产物不纳入组件包。

## 4. 严格类型的边界与修复

原始独立消费者启用 skipLibCheck=false 后出现未声明 csstype、Button／Calendar TS2590 等错误。补齐 csstype 后的最小复现仍有两项 TS2590，最新 Bits UI 2.20.2、Svelte 5.57.3 与 TypeScript 6 也复现，不能靠泛化升级解决。

保留仓库版本，补丁仅改生成的声明：将两处 Svelte Component 的绑定键约束检查延后到局部泛型别名，仍使用原始 Props 与精确绑定键；并补上 toolbelt 的 Expand 类型导入。没有 any、忽略诊断、改变运行时或替换公开 Props。packageExtensions 给 Bits／toolbelt 补上其声明实际引用的 csstype 3.1.3。补丁文件保留版本边界，第三方原始许可证不变。

消费者必须显式复制两份补丁并合并 pnpm 配置；CLI 不会自动改写包管理器。独立消费者测试使用文档化的这一完整路径，不借用 monorepo 隐式类型。10 项类型断言检查原始 Props、绑定键及 Button／Calendar 的有效与无效判别组合，避免用宽泛类型消除错误。

本项不宣称所有第三方依赖／版本或整个文档构建工具链都已通过 skipLibCheck=false。显式强行展开超大 `keyof Button.RootProps` 等类型仍可能遇到 TypeScript 自身复杂度限制；本次修复的是包声明在正常检查时触发该展开的问题。

## 5. 生产测量与取舍

同一 orb 上的生产预览；每组 3 次独立浏览器上下文、禁用缓存，390×844 / DPR 2 / Pixel 7，CPU 4 倍限速、下载 1.6 Mbps／上传 0.75 Mbps／延迟 150ms。页面为 `/docs/components/slider`；networkidle 后固定观察 10 秒，始终不打开搜索，然后打开搜索并输入 `upstream-source-manifest`，等第一项全文结果可见。以下时间均取中位数；首次结果时间含 tap／输入／DOM 工作，不是纯索引计算时长。

| 指标                           |     优化前 |     优化后 |
| ------------------------------ | ---------: | ---------: |
| 未打开搜索的搜索专属请求       |          2 |          0 |
| 搜索专属解码字节               |    786,895 |          0 |
| 搜索专属传输字节（含响应开销） |    117,027 |          0 |
| 观察期全部资源解码字节         |  4,269,715 |  3,483,124 |
| LCP                            |   2,232 ms |   2,260 ms |
| 首次全文结果                   | 1,317.5 ms | 1,802.6 ms |

节省的是用户不使用搜索时的后台下载／索引构建，观察期解码资源减少约 18.4%。LCP 没有可宣称的改善；首次全文搜索在该限速条件下多等待约 0.49 秒，是按需加载的明确取舍。菜单中的静态导航不依赖该索引，加载／失败状态有可读提示，后续打开复用成功缓存。未做无测量依据的全站拆包，也不宣称解决了所有既有大 chunk。

原始三次测量、条件与中位数导出到 `.amp/in/artifacts/opt-performance.json`。

## 6. 未冒充完成的事项

- GitHub CI 已配置、本地等价命令通过，尚未推送，因此不能称远端 CI 已绿。
- 没有发布 npm 包、部署站点、浏览器／屏幕阅读器认证；真实手机、系统软键盘、Safari／Firefox 未验证。
- 冷启动 Vite dev 的扫描器把 CodeBlock 模板字符串中的 React 导入当成真实依赖，日志伴随 HMR／hydration 错误；一次开发服务器回归为 5 通过／1 手机导航超时。持续回归改用生产预览后六项通过，没有通过跳过测试或添加 React 依赖来掩盖。该既有开发扫描问题另行建议修复，不包含在本轮六项约定中。
- 构建仍有既有大 chunk、浏览器 externalization／插件耗时等提示，不将它们描述为本轮全部解决。
