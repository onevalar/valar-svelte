# Dialog 设计规范

- 每个 `Dialog.Content` 都要有 `Dialog.Title`；界面上不想显示标题时给它加 `class="sr-only"`，不要删掉（检查规则 `valar/overlay-title`）。需要补充说明时加 `Dialog.Description`。
- 打开对话框的按钮通过 `Dialog.Trigger` 的 `{#snippet child({ props })}` 把 `props` 传给 `Button`；不要在 Trigger 里再放一个 Button（检查规则 `valar/trigger-child-snippet`）。
- 内边距、内容间距、圆角档位、遮罩不透明度、动效档位和出现时缩放都是组件参数，在 Dialog 文档页的编辑器中调整并写回组件库；不要在 `Dialog.Content` 上用 `class` 改 `p-*`、`gap-*`、`rounded-*`、`duration-*`、`zoom-*`。
- 宽度默认取组件参数的宽度档；个别对话框确需更宽时只加 `sm:max-w-*` 档位类，不写像素任意值。
- 操作按钮放在 `Dialog.Footer`，最多一个主按钮（见 Button 规范）。取消按钮用 `Dialog.Close` 的 `child` snippet 包一个 `variant="outline"` 的 Button。
- 右上角关闭按钮（`showCloseButton`，默认开启）和 `Dialog.Footer` 的 `showCloseButton` 自带的文字默认是“关闭”，其他语言用各自的 `closeLabel` 改。
- 内容可能超出屏幕高度时，给正文区域设 `max-h-*` 档位（可用 `vh` 单位）和 `overflow-y-auto`，或包一层 Scroll Area，让对话框内部滚动。
- 需要在代码中开关时用 `bind:open`；关闭后焦点会自动回到触发按钮，不要手动把焦点移到别处。
- 确认危险操作改用 Alert Dialog；从屏幕边缘滑出的辅助面板用 Sheet；移动端底部面板用 Drawer。
