# Tags Input：Vue → Svelte 转换记录

## 1. 基本信息与范围

规范 1.0；2026-10-31，Amp，未独立审阅；状态：完成（本地，未提交；不声明 Reka 全 API 等价）。范围 VCOMP-002。

来源：`unovue/shadcn-vue@4d6963aa8a482be7609cb05d3f8b7fe42082b634`，`apps/v4/registry/new-york-v4/ui/tags-input/`；行为源 `unovue/reka-ui@0547ab8d0e50d27b89c1829712eebaf509a07e13`（2.11.0），`packages/core/src/TagsInput/` 及 browser tests。MIT / UnoVue，未复制源码。官方文档 https://reka-ui.com/docs/components/tags-input 。

目标 Svelte 5 / TypeScript / Tailwind 4，Node 24.22.2 / pnpm 12.14.0。Bits UI 2.20.0 无对应自由文本原语，采用原生 input 和删除按钮；无新依赖、无 Vue 运行时。

## 2. 能力对照及有意差异

| 来源能力             | 本次合同 / 选择                                                                           | 验证                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 数组模型、输入草稿   | bind:value string[]，bind:inputValue 独立；defaultValue；onValueChange/onAdd/onRemove     | 外部值更新、草稿/标签分离、非绑定默认值回归通过                           |
| 添加规则             | 统一 trim、空值拒绝、重复可配置、max=0 无限、delimiter string/RegExp、自定义同步 validate | 粘贴 `a, Alpha ,Alpha,Beta,Gamma,`：保留 Alpha/Beta，拒绝片段留草稿，通过 |
| Enter/Tab/blur/paste | Enter 非空阻止提交，空 Enter 允许；其余按配置，默认 paste 多项开启                        | 合成事件验证 defaultPrevented；真实浏览器键盘/表单步骤见共享记录          |
| 选择/删除/RTL        | input 保持焦点，Backspace 首次选中再删除，方向键/Home/End，删除后确定选择                 | 两阶段删除、RTL 选择后 Delete、删除后 input 焦点回归通过                  |
| IME                  | 组合中及 compositionend 同轮禁止添加/导航，兼容 keyCode 229                               | 合成 composition 确认与下一轮 Enter 只添加一次，通过；真实系统 IME 未验证 |
| 表单                 | 相同 name 重复字段，FormData.getAll(name)，required 按标签数量、reset、外部 form          | required、提交、重置、readonly/disabled 及消费者交互通过                  |

差异：明确 string[] 而非对象身份/深比较混用；不承诺对象标签。用重复 name 而非来源索引字段，避免模糊 CSV；trim 一致，空粘贴片段忽略。增加 readonly、自定义 validate、reset；候选建议不在范围。使用语义 token，逻辑方向布局。

## 3. 状态与集成

单一标签数组与独立草稿、选中索引、错误消息。所有添加路径调用同一校验，禁止直接绕过。外部数组变化取消选择；删除回到相邻标签/输入。readonly/disabled 不改变数组。错误文本通过 live region 和 aria-describedby 关联，转发 HTML 属性/事件，ref 指 input。

## 4. 逐项验收

| 维度             | 适用性及具体场景                                         | 实际结果及证据                                                                   |
| ---------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 状态与数据       | 适用：默认值/外部值/草稿/重复/上限                       | 通过：`docs/tests/tags-input.test.ts` 三项合同测试，错误片段不丢失               |
| 表单语义         | 适用：重复 name/required/invalid/reset/disabled/readonly | 通过：FormData.getAll、原生 checkValidity、重置及独立消费者提交                  |
| 键盘与焦点       | 适用：非空/空 Enter、Tab、两次删除、箭头/Escape          | 通过自动回归和浏览器键盘；删除焦点回输入，非空 Enter 不触发表单提交              |
| 无障碍           | 适用：label/列表/删除按钮/错误与选中播报                 | DOM 名称、aria-describedby/live region 检查通过；真实屏幕阅读器未验证            |
| 输入法与国际化   | 适用：composition 确认/Unicode/RTL/粘贴                  | 合成 IME 同轮保护、中文标签、RTL 删除及选区粘贴检查通过；真实系统 IME 未验证     |
| 触摸与指针       | 适用：删除/窄屏换行                                      | 桌面点击、Chromium Pixel 7 touch emulation 的删除通过；真实触摸设备/软键盘未验证 |
| 异步与生命周期   | 适用：composition 微任务、reset 后置任务与监听清理       | 卸载取消任务并移除监听，非空草稿连续重置回归通过；无网络异步/候选请求            |
| SSR 与 hydration | 适用：稳定 ID、初始数组/草稿                             | 独立消费者 SSR 及 hydration 通过，无 pageerror/hydration 警告                    |
| 弹层与布局       | 适用：长标签/容器换行；自身无 Portal                     | 独立消费者宽窄屏无横向溢出；不提供候选弹层                                       |
| 视觉与适配       | 适用：浅深/窄屏/错误/禁用/只读                           | 截图检查通过，产物见共享记录                                                     |
| 性能与资源       | 适用：多次添加删除/卸载；合理标签数量                    | 连续操作通过；源码核对无全局常驻监听，不承诺大列表虚拟化/吞吐量基准              |
| 安全与隐私       | 适用：用户文本/剪贴板                                    | 仅读取 paste 事件文本，Svelte 转义；无 HTML 执行或远程外传，源码核对通过         |
| 类型与依赖       | 适用：string[]/回调/ref/公共导出                         | docs 及独立消费者 check 0/0；无额外运行时依赖                                    |
| 分发与集成       | 适用：真实 registry 依赖闭包                             | 本地 CLI tarball init/add、独立 check/build 和交互通过                           |

共享测试环境与实际命令见[验收记录](acceptance-2026-10-31.md)。触摸模拟与合成事件不等于物理设备/真实输入法认证。

## 5. 可重复证据

- `pnpm --filter docs exec vitest run tests/tags-input.test.ts`：3 项通过。
- 重现 IME：compositionstart → 输入“中文” → composing Enter → compositionend → 同轮 Enter 均不添加；下一轮 Enter 添加一次且阻止提交；空草稿 Enter 不拦截提交。
- 重现校验：粘贴 `a, Alpha ,Alpha,Beta,Gamma,`，max=2、validate 长度大于 1，提交仅 Alpha/Beta，草稿保留 a/Alpha/Gamma；清空草稿解除错误。RTL 中选择标签再 Delete，焦点保持 input；reset 恢复初始标签。
- 浏览器截图、录制、表单与独立分发命令见共享记录。

## 6. 交付

组件和公共类型导出 `docs/src/lib/registry/ui/tags-input/`；示例 `tags-input-demo.svelte` / `tags-input-form.svelte`；文档 `docs/content/components/tags-input.md`；8 个 style 均生成 tags-input.json。

结论：VCOMP-002 约定能力本地完成。对象标签/自动完成不在本次合同，不把字符串实现描述为完整 Reka API；同步 validate 是明确边界。升级时保留 IME 确认/Enter 提交区分、拒绝文本保留、重复 name 序列化与 readonly/reset 回归。来源许可与差异保存在本记录，未复制 Vue 源码。
