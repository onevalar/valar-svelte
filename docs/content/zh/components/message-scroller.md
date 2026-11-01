---
title: 消息滚动容器
description: 面向对话的滚动容器：锚定轮次、打开已保存的对话记录、跟随流式回复、加载历史时不跳动，并能跳转到任意消息。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/message-scroller
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";

	let { viewerData } = $props();
	import Step from "$lib/components/step.svelte";
</script>

<ComponentPreview name="message-scroller-demo" class="rounded-[34px] sm:rounded-4xl" previewStyle="rhea" previewClassName="h-auto theme-blue bg-surface dark:bg-background p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:py-16">

<div></div>

</ComponentPreview>

## 出色的流式对话体验从何而来

构建对话界面曾经很简单：一个反向排列的列表，配一个输入框。输入消息，它追加到底部；回复到达，列表变长并滚动。就这样。

流式输出打破了这套模型。消息分块到达，而读者可能仍在阅读、滚动，或者视线完全在别处。

难点于是变成了：对话不断变化时，如何守住读者所在的位置。处理不好，体验就会一直跳：人被拉到底部，失去上下文，再费力找回来。

落到实现上，答案都在滚动里：何时跟随、何时停住、何时交给读者决定。出色的流式对话应当做到：

1. **只在读者要求移动时才移动。** 读者正在阅读，就不要把他拉到别处。自动滚动永远不该是默认行为。
2. **只在读者跟随时才跟随。** 读者停在实时边缘，就让流式内容留在视野内；读者滚开了，就让他留在那里。
3. **每一次交互都是信号。** 滚动只是其中一种。选中文字、使用键盘、打开链接、执行搜索，都应让界面停止移动。
4. **新一轮从视口顶部附近开始。** 这样新一轮才有从头读起的地方。
5. **再让回答流入视野。** 回答应当逐渐长进屏幕，而不是一出现就把其他内容全部推开。
6. **保留一部分前文作为上下文。** 提问与回复在视觉上要连贯，前一轮也要留下足够的可见内容，让读者知道自己身在何处。
7. **允许新内容在屏幕外到达。** 对话可以继续流式输出，读者正在看的内容保持不变。
8. **提示视野之外发生了什么。** 让读者清楚回复是否仍在流式输出、是否有新消息到达。
9. **让读者轻松回到最新回复。**“跳到最新”操作应把读者带回来，并恢复跟随。
10. **允许跳到对话中的任意位置。** 长会话需要消息链接、搜索、未读标记和直接导航。
11. **从读者离开的地方重新打开。** 已保存的对话应打开在最后一个有意义的轮次，通常就是最后一条用户消息，而非绝对底部。
12. **布局变化时守住阅读位置。** 图片加载、Markdown 展开、代码块渲染、更早的消息出现在上方，都不该让读者丢失位置。
13. **处理中断，但不夺走位置。** 停止、重试、重新生成、分支或报错，都不该让对话意外移动。
14. **长会话下依然流畅。** 流式文本、Markdown、代码、图片和大量历史，读起来都不应卡顿。
15. **无障碍，但不喧闹。** 保持对话记录可导航、键盘焦点稳定，并以舒适的节奏播报重要事件。

**永远不要违背读者的意图移动视图。**

## 消息滚动容器

消息滚动容器围绕上述行为构建，用来滚动对话记录。`MessageScroller.Provider` 持有滚动状态与记录行的行为：初始位置、流式输出、新一轮锚定、前置历史、可见性和滚动控件。`MessageScroller.Root` 则是在其中渲染的带样式外框。

消息滚动容器的职责限定在滚动视口内，不接管消息、AI 状态、传输、持久化、分支或模型状态。产品代码只需专注于组合消息、标记、工具调用、附件和提示词输入框。

它提供对话所需的滚动行为，不接管对话界面的其余部分；即使对话很长、Markdown 内容很重，依然保持流畅。

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="message-scroller" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

安装 `@valar/svelte-primitives`：

</Step>

<PMInstall command="@valar/svelte-primitives -D" />

<Step>

将以下代码复制到项目中。

</Step>
{#if viewerData}
	<ComponentSource item={viewerData} data-llm-ignore/>
{/if}

</Steps>
{/snippet}
</InstallTabs>

## 用法

```svelte showLineNumbers
<script lang="ts">
  import * as Message from "$lib/components/ui/message/index.js";
  import * as MessageScroller from "$lib/components/ui/message-scroller/index.js";
</script>
```

```svelte showLineNumbers
<MessageScroller.Provider>
  <MessageScroller.Root>
    <MessageScroller.Viewport>
      <MessageScroller.Content>
        {#each messages as message (message.id)}
          <MessageScroller.Item
            messageId={message.id}
            scrollAnchor={message.role === "user"}
          >
            <Message.Root />
          </MessageScroller.Item>
        {/each}
      </MessageScroller.Content>
    </MessageScroller.Viewport>
    <MessageScroller.Button />
  </MessageScroller.Root>
</MessageScroller.Provider>
```

`MessageScroller` 会填满父容器，因此要放在限定了高度的容器内。

```svelte showLineNumbers
<div class="flex h-screen flex-col">
  <MessageScroller.Provider>
    <MessageScroller.Root class="flex-1">
      <!-- transcript -->
    </MessageScroller.Root>
  </MessageScroller.Provider>
</div>
```

## 组合

```svelte showLineNumbers
<MessageScroller.Provider>
  <MessageScroller.Root>
    <MessageScroller.Viewport>
      <MessageScroller.Content>
        <MessageScroller.Item>
          <!-- a message, marker, or row -->
        </MessageScroller.Item>
        <MessageScroller.Item />
        <MessageScroller.Item />
      </MessageScroller.Content>
    </MessageScroller.Viewport>
    <MessageScroller.Button />
  </MessageScroller.Root>
</MessageScroller.Provider>
```

- **`MessageScroller.Provider`**——无样式根组件。持有滚动状态，以及初始位置、自动滚动、锚定、滚动命令和可见性跟踪等行为属性。
- **`MessageScroller.Root`**——带样式的外框。在 provider 内布置视口、内容和控件。
- **`MessageScroller.Viewport`**——可滚动元素。接收原生滚动事件，并在更早的消息前置时保住当前可见行。
- **`MessageScroller.Content`**——对话记录容器。承载各个行，并为新消息提供实时区域的默认值。
- **`MessageScroller.Item`**——对话记录的行边界。内容区的每个直接子元素都要用它包起来，滚动容器才能测量、锚定、保持位置、跟踪可见性并跳转到该行。每一行可以是消息、标记、正在输入提示、分割线、加入/离开事件或“加载更早”行。
- **`MessageScroller.Button`**——滚动控件。滚动到对话记录的开头或结尾；对应方向没有内容时处于 `inert` 状态。

## 核心概念

### 锚定轮次

轮次指对话中开启一段新交流的部分。在简单的 AI 对话里，通常就是用户消息及紧随其后的助手回复。

锚点则是视口应视为该轮次起点的行，用 `scrollAnchor` 标记。新的锚点追加后，视口会把它移到顶部附近，并在其上方露出一部分上一项，让新一轮不至于和上下文脱节。

```svelte showLineNumbers
<!-- This tells the scroller to anchor the user's message for the next turn. -->
<MessageScroller.Item
  messageId={message.id}
  scrollAnchor={message.role === "user"}
/>
```

滚动锚点与消息角色无关。任何行都能成为锚点：用户消息、系统标记、转接事件，或其他任何开启有意义轮次的内容。`MessageScroller` 只需要知道哪一行负责锚定视口。

下例把用户消息设为锚点。发送新消息时，视口把它锚定在顶部附近，助手回复追加在下方。把锚点切到助手消息，就能看到两者的差别。

<ComponentPreview name="message-scroller-anchoring" class="rounded-[34px] sm:rounded-4xl" previewStyle="rhea" previewClassName="h-auto theme-blue bg-surface dark:bg-background p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:py-16">

<div></div>

</ComponentPreview>

### 群聊

群聊里，轮次的边界比“用户消息”更具体。它常常是那条要求模型回应的消息，或“Marcus joined the chat”这样的标记。正在输入提示和历史控件通常不该作为锚点。

由于锚定与角色无关，标记也能像消息一样轻松锚定。

```svelte showLineNumbers
<MessageScroller.Item messageId="marcus-joined" scrollAnchor>
  <Marker.Root variant="separator">
    <Marker.Content>Marcus joined the chat</Marker.Content>
  </Marker.Root>
</MessageScroller.Item>
```

<ComponentPreview name="message-scroller-group-chat" class="rounded-[34px] sm:rounded-4xl" previewStyle="rhea" previewClassName="h-auto theme-blue bg-surface dark:bg-background p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:py-16">

<div></div>

</ComponentPreview>

### 保持上下文可见

新一轮开始时，仍应像同一条连续会话的一部分。`scrollPreviousItemPeek` 在锚点上方保留上一项的一小段，让读者守住上下文，而不是觉得对话在一张白纸上重新开始。

```svelte showLineNumbers
<!-- Keep 64px of the previous turn visible above the newly anchored row. -->
<MessageScroller.Provider scrollPreviousItemPeek={64}>
  <MessageScroller.Root>
    <!-- anchored turns -->
  </MessageScroller.Root>
</MessageScroller.Provider>
```

调整下例中露出的高度，观察它对对话的影响。

<ComponentPreview name="message-scroller-previous-context" class="rounded-[34px] sm:rounded-4xl" previewStyle="rhea" previewClassName="h-auto theme-blue bg-surface dark:bg-background p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:py-16">

<div></div>

</ComponentPreview>

### 跟随实时边缘

读者位于实时边缘时——无论是留在那里还是回到那里——`autoScroll` 让流式回复在增长过程中留在视野内。无论用滚轮、触摸、键盘滚动键还是拖动滚动条，只要离开实时边缘就释放视图；显式跳转到某条消息同样会释放。此后新分块到达，不再移动读者。

`autoScroll` 可与轮次锚定组合使用。新一轮锚定到顶部附近时，视图保持不动，回复在其下方的空间里流式展开。回复填满视口后，读者又回到实时边缘，跟随输出接替锚定。

```svelte showLineNumbers
<MessageScroller.Provider autoScroll>
  <MessageScroller.Root>
    <!-- streamed turns -->
  </MessageScroller.Root>
</MessageScroller.Provider>
```

<ComponentPreview name="message-scroller-streaming" class="rounded-[34px] sm:rounded-4xl" previewStyle="rhea" previewClassName="h-auto theme-blue bg-surface dark:bg-background p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:py-16">

<div></div>

</ComponentPreview>

启用 `autoScroll` 时，调用 `scrollToEnd` 或按下 `MessageScroller.Button` 会重新启用跟随输出，滚开的读者因此能回到实时边缘继续跟随。这段滚到最新消息的程序化滚动执行期间，根组件和视口会暴露 `data-autoscrolling`，便于在过渡过程中按需应用样式。

### 打开已保存会话

在对话记录的绝对末尾重新打开已保存的会话，看起来合理，却常把读者丢进缺少上下文的对话里。更好的默认值是 `"last-anchor"`：显示最后一个有意义的轮次，例如用户最新的一条消息，回复紧随其下。

这样读者一进来就有明确的位置：能看到自己问过什么、回答从哪里开始，并从那里继续读，不必从底部边缘倒推整段对话。

```svelte showLineNumbers
<MessageScroller.Provider defaultScrollPosition="last-anchor">
  <MessageScroller.Root>
    <!-- transcript -->
  </MessageScroller.Root>
</MessageScroller.Provider>
```

<ComponentPreview name="message-scroller-opening-position" class="rounded-[34px] sm:rounded-4xl" previewStyle="rhea" previewClassName="h-auto theme-blue bg-surface dark:bg-background p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:py-16" hideCode>

<div></div>

</ComponentPreview>

`"last-anchor"` 以 `scrollAnchor` 为准，与消息角色无关。若不存在锚点，或最后一个锚定轮次本就完整落在视口内，则回退到 `"end"`。

要在会话开头继续阅读，用 `"start"`；绝对最新的一条消息才是合适的落点，用 `"end"`。

### 避免刷新时闪烁

滚动容器总是从顶部打开。HTML 无法设置 `scrollTop`，所以服务端渲染的对话记录会先显示最早的消息。JavaScript 执行后，`defaultScrollPosition` 移动视图，用户就看到一次跳动。

`defaultScrollPosition` 为 `"end"` 或 `"last-anchor"` 时，在目标位置生效之前，视口带有 `data-pending-scroll`。该属性存在期间，带样式的视口保持隐藏，用户看到的是外框而不是跳动。`"start"` 不需要这样做。

若希望首屏就落在 `"end"`，可在视口之后紧跟一段内联脚本。给视口设置 `id`，滚动到底部，再移除 `data-pending-scroll`。

```svelte showLineNumbers
<script>
  const scrollToEndScript = `(function () {
    var viewport = document.getElementById("messages")
    if (!viewport) {
      return
    }
    viewport.scrollTop = viewport.scrollHeight
    viewport.removeAttribute("data-pending-scroll")
  })()`;
</script>

<MessageScroller.Root>
  <MessageScroller.Viewport id="messages">
    <MessageScroller.Content>
      <!-- transcript -->
    </MessageScroller.Content>
  </MessageScroller.Viewport>
  {@html `<script>${scrollToEndScript}</script>`}
  <MessageScroller.Button />
</MessageScroller.Root>
```

脚本要放在页面里，不要放在滚动容器里。它只对 `"end"` 有效，而且消息必须已经在 HTML 中。使用内容安全策略时，传入 `nonce`。

不要在 `"last-anchor"` 下使用这段脚本。消息在客户端加载时也不用。

### 加载更早消息

加载更早的消息，不应移动读者正在看的对话。更早的行前置到当前记录上方时，`MessageScroller.Viewport` 会保住可见行，让读者在历史消息于上方加载时停在原处。

该行为通过 `preserveScrollOnPrepend` 默认开启。

<ComponentPreview name="message-scroller-load-history" class="rounded-[34px] sm:rounded-4xl" previewStyle="rhea" previewClassName="h-auto theme-blue bg-surface dark:bg-background p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:py-16">

<div></div>

</ComponentPreview>

消息行要使用稳定的 `messageId`。滚动容器因此能锁定具体的行来保持位置，不必靠视口边缘恰好落在哪个像素上来猜。

### 为新消息添加动画

`MessageScroller.Item` 可以直接做动画。保留它的 `messageId` 和 `scrollAnchor`，入场动画使用 transform 和 opacity。

常见的对话模式是：用户消息发送时播放入场动画，助手回复随后流式写入下方的普通行。让用户行从最终位置的下方开始，看起来就像从视口的实时边缘升起。

```svelte showLineNumbers
<MessageScroller.Item
  class="animate-in fade-in slide-in-from-bottom-2 duration-300"
  messageId={message.id}
  scrollAnchor
/>
```

<ComponentPreview name="message-scroller-animation" class="rounded-[34px] sm:rounded-4xl" previewStyle="rhea" previewClassName="h-auto theme-blue bg-surface dark:bg-background p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:py-16">

<div></div>

</ComponentPreview>

行的入场动画不要用 height、margin 或 padding，这些变化会干扰滚动容器的定位计算。读者偏好减少动态效果时，跳过入场动画，滚动行为保持不变。

### 跳转到消息

搜索结果、永久链接、大纲项和工具栏按钮，常需要在消息列表之外驱动对话记录。这类控件使用 `useMessageScroller`。这些 hook 从 `MessageScroller.Provider` 读取数据，因此在 provider 内的任何组件中都能用，包括渲染在 `MessageScroller.Root` 外框之外的控件。

```svelte showLineNumbers
<script lang="ts">
  import { useMessageScroller } from "$lib/components/ui/message-scroller/index.js";

  const { scrollToMessage, scrollToEnd, scrollToStart } = useMessageScroller();
</script>
```

<ComponentPreview name="message-scroller-commands" class="rounded-[34px] sm:rounded-4xl" previewStyle="rhea" previewClassName="h-auto theme-blue bg-surface dark:bg-background p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:py-16" hideCode>

<div></div>

</ComponentPreview>

`scrollToMessage` 以 `MessageScroller.Item` 上的 `messageId` 为目标，因此需要被定位的行要有稳定的 id。目标尚未挂载且无法排队时，`scrollToMessage` 返回 `false`。

`scrollToMessage` 可以在目标行尚未挂载时先把跳转请求排队，用于对话记录挂载期间由客户端解析永久链接的场景。行挂载完成后，缺失的 id 直接返回 `false`，不会启动反复猜测的重试。返回 `true` 只表示滚动已执行或已排队，并不代表该行已进入视野。

### 跟踪阅读位置

用 `useMessageScrollerVisibility` 跟踪读者在对话中的位置。常见用法是目录或跳转菜单，高亮当前锚定的轮次。

```svelte showLineNumbers
<script lang="ts">
  import { useMessageScrollerVisibility } from "$lib/components/ui/message-scroller/index.js";

  const visibility = useMessageScrollerVisibility();
</script>
```

<ComponentPreview name="message-scroller-visibility" class="rounded-[34px] sm:rounded-4xl" previewStyle="rhea" previewClassName="h-auto theme-blue bg-surface dark:bg-background p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:py-16" hideCode>

<div></div>

</ComponentPreview>

`currentAnchorId` 回答“我在哪”，给出当前锚定的轮次；锚点滚出视口上方后，该值仍然保留。`visibleMessageIds` 回答“屏幕上有什么”，按文档顺序返回。

可见性跟踪只在用到时才产生开销。只有存在订阅 `useMessageScrollerVisibility` 的地方才会运行跟踪，行也需要 `messageId` 才能参与。

### 读取滚动状态

需要在 JavaScript 中拿到滚动状态时，用 `useMessageScrollerScrollable`，例如做状态指示器或自定义“跳到最新”控件。它会报告视口还能朝哪些边缘滚动；“位于开头/结尾”取反（`!start` / `!end`），“能否滚动”是 `start || end`。要为滚动容器本身写样式，优先使用 `data-scrollable` 属性。

```svelte showLineNumbers
<script lang="ts">
  import { useMessageScrollerScrollable } from "$lib/components/ui/message-scroller/index.js";

  const scrollable = useMessageScrollerScrollable();
</script>
```

<ComponentPreview name="message-scroller-scrollable" class="rounded-[34px] sm:rounded-4xl" previewStyle="rhea" previewClassName="h-auto theme-blue bg-surface dark:bg-background p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:py-16">

<div></div>

</ComponentPreview>

## 性能

`MessageScroller` 以包含 Markdown 和组合消息行的大型对话记录为基准做了性能测试。

滚动的热路径不经过 Svelte 状态：滚动不触发记录行重渲染，每次滚动不做强制布局，屏幕外的绘制工作也尽量留给浏览器跳过。

滚动位置、锚定和跟随输出以命令式方式跟踪，再通过 `data-*` 属性映射到根组件和视口上，所以滚动和流式输出都不会重渲染记录行。

带样式的 `MessageScroller.Item` 还自带 `content-visibility: auto` 和 `contain-intrinsic-size`。行留在 DOM 中，可被选中、复制、页内查找、SSR 和辅助技术访问，但远离视口的行，浏览器可以跳过渲染工作。

可见性跟踪只在用到时才产生开销。在有人订阅 `useMessageScrollerVisibility` 之前，跳转菜单或当前轮次指示器不产生任何成本。

对对话记录的常见规模来说，这个表现足够从容：数百到数千轮，包含带 Markdown 和组合组件的消息。

## 虚拟化

虚拟化刻意留在基础组件之外。`MessageScroller` 渲染真实 DOM 行，到数千轮规模仍然很快（见[性能](#性能)），因此多数对话记录用不到虚拟化。

记录大到确实需要虚拟化时，把 `MessageScroller.Viewport` 当作滚动元素，由虚拟化器接管行的渲染。

```svelte showLineNumbers
<script lang="ts">
  import { useVirtualizer } from "@valar/svelte-primitives/svelte-virtual";
  import * as Message from "$lib/components/ui/message/index.js";
  import * as MessageScroller from "$lib/components/ui/message-scroller/index.js";

  let {
    messages,
  }: {
    messages: Array<{ id: string; content: import("svelte").Snippet }>;
  } = $props();

  let viewport = $state<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    get count() {
      return messages.length;
    },
    getScrollElement: () => viewport,
    estimateSize: () => 86,
    getItemKey: (index) => messages[index]?.id ?? index,
    overscan: 8,
  });
</script>

<MessageScroller.Provider>
  <MessageScroller.Root>
    <MessageScroller.Viewport bind:ref={viewport}>
      <MessageScroller.Content class="block min-h-full">
        <div
          class="relative w-full"
          style="height: {virtualizer.getTotalSize()}px"
        >
          {#each virtualizer.getVirtualItems() as virtualItem (virtualItem.key)}
            {@const message = messages[virtualItem.index]}
            {#if message}
              <div
                data-index={virtualItem.index}
                class="absolute start-0 top-0 w-full"
                style="transform: translateY({virtualItem.start}px)"
                {@attach (node) => virtualizer.measureElement(node)}
              >
                <Message.Root>{@render message.content()}</Message.Root>
              </div>
            {/if}
          {/each}
        </div>
      </MessageScroller.Content>
    </MessageScroller.Viewport>
    <MessageScroller.Button />
  </MessageScroller.Root>
</MessageScroller.Provider>
```

## 无障碍

`MessageScroller` 让滚动容器可经键盘到达、对话记录可被播报，同时不限定消息界面的具体实现。

`MessageScroller.Viewport` 默认是带标签、可键盘聚焦的滚动区域，使用 `role="region"`、`aria-label="Messages"` 和 `tabindex={0}`，键盘用户可以聚焦对话记录并直接滚动它。

`MessageScroller.Content` 用 `role="log"` 和 `aria-relevant="additions"` 把对话记录标记为实时区域。新行可以被播报，但流式文本的变化不必逐 token 播报。

```svelte showLineNumbers
<MessageScroller.Content aria-busy={status === "streaming"}>
  <!-- messages -->
</MessageScroller.Content>
```

如果希望播报等到整条消息行完成，可在轮次流式输出期间传入 `aria-busy`。

`MessageScroller.Button` 渲染真实的按钮。对应方向没有可滚动内容时，它设置 `inert`、使用 `tabindex={-1}` 并暴露 `data-active="false"`，失效的滚动控件因此不会多占焦点停留点。

## 无样式版本

`MessageScroller` 的行为来自 `@valar/svelte-primitives` 包。需要自定义结构和样式时，从 `@valar/svelte-primitives/message-scroller` 导入无样式部件。

## API 参考

每个部分的属性、data 属性和 hook 都定义在 `@valar/svelte-primitives/message-scroller` 的无样式 `MessageScroller` 基础组件上。带样式组件与无样式部分的用法完全一致。
