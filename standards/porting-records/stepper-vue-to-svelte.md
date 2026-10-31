# Stepper：Vue → Svelte 转换记录

## 1. 基本信息与范围

规范 1.0；2026-10-31，Amp，未独立审阅；状态：完成（本地，未提交；按 VCOMP-003 合同，不声明 Reka 全 API 等价）。

参考 `unovue/shadcn-vue@4d6963aa8a482be7609cb05d3f8b7fe42082b634` 的 `apps/v4/registry/new-york-v4/ui/stepper/`；行为来源 `unovue/reka-ui@0547ab8d0e50d27b89c1829712eebaf509a07e13`（2.11.0）的 `packages/core/src/Stepper/`。MIT / UnoVue，未复制源代码。官方文档 https://reka-ui.com/docs/components/stepper 。

目标 Svelte 5 / TS / Tailwind 4；Node 24.22.2 / pnpm 12.14.0。Bits UI 2.20.0 无流程原语，Tabs 不提供异步导航门禁，因此采用原生按钮/列表/region 的 Svelte 控制器。无新依赖。

## 2. 能力对照与差异

| 来源                      | 本次能力合同                                                | 验证                                                        |
| ------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
| 1-based 数字 step         | 稳定字符串 id / steps 数组，bind:value，defaultValue        | 外部更新、动态删当前首/中间项回归通过                       |
| linear / free             | 线性只允许相邻前进，回退自由；linear=false 可跳转           | 不可达按钮禁用，点击和 goTo 门禁、自由跳转回归通过          |
| active/inactive/completed | 当前/完成/错误/禁用/不可到达/校验中                         | aria-current、aria-busy、错误描述关联、完成状态检查通过     |
| 同步直接推进              | 所有前进 click/key/snippet/导出 goTo 共用 beforeChange 门禁 | 拒绝不前进，重试后前进；原生按钮激活走同一处理，通过        |
| 无异步生命周期处理        | pending、防重入、AbortSignal、token+来源值+拓扑检查         | 重复、回退、外部更新、步骤禁用/移除、卸载后的旧结果回归通过 |
| 无内容 primitive          | 永久挂载、hidden region，与 trigger 稳定 ID 关联            | 换步聚焦关联 panel，返回后原输入仍在，通过                  |
| 键盘/方向                 | 手动激活、roving focus、Home/End、方向键与 RTL              | LTR Right、RTL Left、纵向 Down 只移动焦点不激活，通过       |

不把“编号较小”自动当作已完成。新增 beforeChange、错误与内容语义，数据保留在挂载面板和调用方状态。直接外部赋 value 是受信任的应用状态更新，不受用户导航校验拦截，但会取消旧请求；需要程序化受检导航时用导出的 goTo。只参考行为，不复制 Vue 组件或引入桥接运行时。

## 3. 状态模型

空闲 → 前进校验中 → 成功换步 / 无效或异常留在原步。重复前进不新建请求；回退/外部 value/步骤 id 或禁用拓扑变化/validator 替换/卸载会取消并使旧 token 失效。AbortSignal 交给业务请求，但即使业务忽略 abort 也不能旧结果推进。删除当前项回退至原位置之前最近可用项，无则首个可用项。唯一 id 是调用方合同。

## 4. 逐项验收

| 维度             | 适用性及具体场景                                       | 实际结果及证据                                                                                     |
| ---------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| 状态与数据       | 适用：默认/受控/空或禁用/动态步骤/完成与错误           | 通过：`docs/tests/stepper.test.ts` 6 项合同测试；删除中间当前项回退而非误前进                      |
| 表单语义         | 适用：多步表单校验、输入保留                           | 独立消费者输入返回后保留；示例 beforeChange 校验当前表单；组件自身不是提交控件，无 name/reset 代理 |
| 键盘与焦点       | 适用：原生 Enter/Space、Tab、箭头/Home/End             | 自动回归及浏览器检查通过，方向键仅聚焦，成功后面板聚焦；RTL/纵向不混淆                             |
| 无障碍           | 适用：group/列表/aria-current、busy、region/alert/live | DOM 关联和错误描述回归通过；真实屏幕阅读器未验证                                                   |
| 输入法与国际化   | 适用：标题文本/继承方向/内嵌输入                       | 中文输入由原生 input 保留，方向键尊重 RTL；导航忽略 isComposing；真实系统 IME 未验证               |
| 触摸与指针       | 适用：按钮/等待期间返回/触控布局                       | 桌面操作及 Chromium Pixel 7 touch emulation 的前进/等待/返回通过；真实设备未验证                   |
| 异步与生命周期   | 适用：校验/失败/异常/重复/取消/过期/卸载               | 6 项自动测试覆盖竞态边界；浏览器首次失败、重试、返回后旧结果不推进，通过                           |
| SSR 与 hydration | 适用：稳定 ID/初始当前项与面板                         | 独立消费者 SvelteKit SSR/hydration 无 pageerror 或 mismatch，首屏状态一致                          |
| 弹层与布局       | 适用：容器内面板、隐藏区域/窄屏；自身无 Portal         | 面板始终挂载且 hidden，宽窄及纵向布局检查通过；不添加模态焦点陷阱                                  |
| 视觉与适配       | 适用：浅深/横纵/窄屏/等待/失败/成功                    | 截图检查通过；共享记录提供状态产物及交互视频                                                       |
| 性能与资源       | 适用：并发请求/卸载/重复面板                           | 防重入、abort 与旧结果丢弃测试通过；不作大步骤数量基准，调用方请求需响应 AbortSignal               |
| 安全与隐私       | 适用：标题/错误/业务校验                               | 文本转义，不发送请求或持久化业务数据；校验函数由可信调用方提供，源码核对通过                       |
| 类型与依赖       | 适用：Step/Context/Props、Promise 回调                 | docs 及独立消费者 check 0/0；无新运行时依赖，公共导出通过                                          |
| 分发与集成       | 适用：真实 registry/独立消费者                         | 本地 tarball init/add、独立 check/build、异步表单交互通过                                          |

## 5. 可重复证据

- `pnpm --filter docs exec vitest run tests/stepper.test.ts`：6 项通过；包含拒绝 Promise/重试、重复 pending、回退/外部更新/拓扑变化/卸载使旧结果无效，以及中间项移除回退。
- 浏览器操作：第一步填写数据并继续；第二步前进时显示等待，首次失败保留当前步骤；重试成功到末步。等待时返回第一步，过期结果不得把流程推进；第一步数据仍保留。
- 自动测试另验证触发器的 aria-controls、面板 aria-labelledby、聚焦目标、显式 error 的 aria-describedby；键盘方向变化不改当前步骤。
- 共享环境、完整命令与浏览器产物见[共享验收记录](acceptance-2026-10-31.md)。

## 6. 交付

组件/类型/公共导出 `docs/src/lib/registry/ui/stepper/`；示例 `stepper-demo.svelte` / `stepper-form.svelte` / `stepper-async.svelte`；文档 `docs/content/components/stepper.md`；8 个 style 均生成 stepper.json。

结论：VCOMP-003 约定能力本地完成。外部直接赋 value 是受信任状态更新，不伪装成受检导航；应用应使用 goTo/next/previous 进入门禁。隐藏面板保留数据，但移除步骤/跨路由持久化由调用方承担；每步独立 form 避免隐藏 required 参与同一个大表单的原生校验。真实设备/读屏/系统 IME 未验证。后续更新必须保留统一导航门禁、旧结果隔离、动态步骤修复与数据保留回归。许可和来源见本记录。
