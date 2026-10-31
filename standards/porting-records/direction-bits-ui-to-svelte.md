# Direction / RTL：Bits UI → Valar Svelte 能力评估

## 1. 基本信息与范围

规范 1.0；2026-10-31，Amp，未独立审阅；状态：完成（本地，未提交）。VCOMP-004 是能力评估、文档示例与发现缺口的修复，不是复制 Vue Provider，也不是全库 RTL 认证。

核对 Bits UI 2.20.0 固定提交 `cd055a1be01a9dc06d255ff2d3c1c482c1061aed` 的 public exports、internal/locale.ts、roving-focus-group.ts、bits/slider、bits/menu、utilities/portal 与 floating-layer。MIT，原依赖许可保留在包内；未复制其源码。参考 https://bits-ui.com/docs/utilities/bits-config 。目标环境 Svelte 5 / Node 24.22.2 / pnpm 12.14.0。

## 2. 能力与缺口

| 来源能力                             | 目标用法                             | 差异与影响                       | 验证                                                            |
| ------------------------------------ | ------------------------------------ | -------------------------------- | --------------------------------------------------------------- |
| 无统一 DirectionProvider             | 原生 dir + 已有组件的显式 dir        | 不建立双重方向状态               | 固定版本 exports 与 BitsConfig 源码核对通过                     |
| Tabs 计算 DOM 方向                   | 父节点动态 dir；局部 LTR             | 键盘与 CSS 一致                  | RTL Left/LTR Right 激活下一 tab，通过                           |
| Slider 显式 dir 默认 ltr             | 同时传容器及 Slider                  | 不能只设置祖先 dir               | RTL Left 增加/LTR Right 增加，方向切换保留值，通过              |
| Portal 保留 context，不保留 DOM 继承 | Popover.Content dir + align=start    | body Portal 不继承原容器方向     | RTL 右沿/LTR 左沿对齐触发器，Escape 关闭，通过                  |
| Menu Root dir、物理 side 独立        | Root dir，SubContent 选择 left/right | 开关子菜单方向键和视觉侧边需一致 | Dropdown/Context/Menubar 六种方向组合的按键、箭头旋转与位置通过 |

发现并修复实际缺口：DropdownMenu、ContextMenu、Menubar 的 `cn-rtl-flip` 原先只是标记，不产生镜像。三个 SubTrigger 改用 `ms-auto rtl:rotate-180`，不是增加会误伤纵向图标的全局翻转规则；8 个 style 的 registry JSON 已同步。没有发现必须新增全局 Provider 才能表达代表组合的缺口。其余组件/业务区块不是本轮全库 RTL 认证范围。

## 3. 状态与集成

示例由一个 direction 状态驱动原生容器、Slider、Menu Root、Popover Content；Tabs 从 DOM 读取；代码块明确 dir=ltr。SSR 初始固定 rtl，不依赖浏览器 locale。方向切换不重建业务值。

## 4. 逐项验收

| 维度             | 适用性及具体场景                        | 实际结果及证据                                                                                       |
| ---------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 状态与数据       | 适用：动态 RTL/LTR 与局部覆盖           | 切换后 Slider 值保留、DOM 方向与控件显式方向一致，通过                                               |
| 表单语义         | 不适用：本例不提交表单                  | 本轮不新增字段序列化或重置行为，原组件合同保持不变                                                   |
| 键盘与焦点       | 适用：Tabs/Slider、菜单开关、Escape     | RTL/LTR Tabs/Slider 检查及六种菜单组合通过；原生/Bits 焦点机制保留                                   |
| 无障碍           | 适用：tablist/slider/menu 名称与方向    | DOM 语义、键盘行为检查通过；真实读屏未验证                                                           |
| 输入法与国际化   | 适用：阿拉伯文/中文/英文混排与局部 LTR  | 方向继承/覆盖、混排及代码块方向检查通过；无新文本编辑器，不新增 IME 处理                             |
| 触摸与指针       | 适用：选择器/Slider/按钮及菜单          | 桌面指针打开/悬停与 Chromium touch emulation 布局检查通过；真实设备未验证                            |
| 异步与生命周期   | 适用：浮层挂载/关闭；不含业务请求       | 多次打开/关闭、方向切换后交互通过；无新全局监听或异步控制器                                          |
| SSR 与 hydration | 适用：固定 rtl 首屏，稳定 ID            | 独立消费者 SSR 及 hydration 无 mismatch/pageerror；不由 navigator 推断初始方向                       |
| 弹层与布局       | 适用：body Portal、逻辑起点、嵌套子菜单 | Popover 两方向对齐、三个菜单两方向物理侧边检查通过；Portal context 与 DOM 继承区别已记入文档         |
| 视觉与适配       | 适用：浅深、窄屏、打开子菜单            | 已检查截图；过渡完成后深色 token 正确；无横向溢出，ContextMenu 覆盖右击目标属于正常浮层行为          |
| 性能与资源       | 适用：方向切换/浮层生命周期             | 复用已有原语，不引入 Provider/观察器/运行时依赖；未作全库性能基准                                    |
| 安全与隐私       | 适用：示例文本与本地状态                | 无 HTML 执行、外部业务请求或统计；源码核对通过                                                       |
| 类型与依赖       | 适用：既有 dir/Content/side API         | docs 与独立消费者 check 0/0，Bits UI 2.20.0；无新依赖                                                |
| 分发与集成       | 适用：已有菜单修复需真实安装            | 三类菜单从实际 registry 安装；方向 demo 是文档示例，复制到独立消费者并改为公共路径，不冒充可安装组件 |

## 5. 证据与交付

用法：`docs/content/direction.md`；代表组合：`docs/src/lib/registry/examples/direction-demo.svelte`；菜单修复位于三类组件的 `*-sub-trigger.svelte`。文档示例经文档 registry 展示，不是 CLI add 的独立组件条目。

浏览器步骤：RTL 下 Account 聚焦后 Left 到 Security；Slider Left 增值；Popover 打开后逻辑 start 贴触发器右沿；切 LTR 后对应按键与对齐反向，值不重置；代码块始终 LTR。Dropdown/Context/Menubar 的 RTL Left 打开左侧子菜单，LTR Right 打开右侧子菜单；图标计算 rotate 为 180deg/none。

环境、命令、六种菜单状态拼图与交互录制见[共享验收记录](acceptance-2026-10-31.md)。结论：VCOMP-004 约定评估与代表组合完成；没有声称所有业务区块、图表、ScrollArea 或第三方控件都已完成双向化。真实设备、真实读屏和跨浏览器仍未验证，集成项目应按支持范围补验。
