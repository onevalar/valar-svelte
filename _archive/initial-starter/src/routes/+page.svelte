<script lang="ts">
 import { Button } from '#lib/components/ui/button/index.js';
 import { Badge } from '#lib/components/ui/badge/index.js';
 import { Input } from '#lib/components/ui/input/index.js';
 import * as Card from '#lib/components/ui/card/index.js';
 let dark = $state(false);
 let name = $state('');
 let saved = $state(false);
</script>

<svelte:head>
 <title>Valar Svelte · Component workshop</title>
 <meta name="description" content="Valar 的个人 Svelte 组件库，基于 shadcn-svelte，持续定制与创造。" />
</svelte:head>

<div class:dark class="min-h-screen bg-background text-foreground" style:color-scheme={dark ? 'dark' : 'light'}>
 <div class="mx-auto max-w-5xl px-6 py-8 md:px-10">
  <header class="flex items-center justify-between border-b pb-6">
   <a href="/" class="text-sm font-semibold tracking-tight">VALAR / SVELTE</a>
   <Button variant="outline" size="sm" onclick={() => (dark = !dark)} aria-pressed={dark}>深色模式</Button>
  </header>
  <main>
   <section class="py-16 md:py-24">
    <Badge variant="secondary">个人组件库 · 起始版本</Badge>
    <h1 class="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">从基础开始，<br />做自己的组件。</h1>
    <p class="mt-6 max-w-xl text-base leading-7 text-muted-foreground">基于 shadcn-svelte 的开放源码，调整每一个细节，也创造全新的交互。这里是 Valar 的组件工作台。</p>
    <div class="mt-8 flex flex-wrap gap-3">
     <Button href="#components">浏览组件</Button>
     <Button variant="outline" href="https://github.com/onevalar/valar-svelte">GitHub 仓库 ↗</Button>
    </div>
   </section>
   <section id="components" class="scroll-mt-8 border-t py-10" aria-labelledby="components-title">
    <div class="mb-8 flex items-baseline justify-between"><h2 id="components-title" class="text-xl font-semibold">基础组件</h2><span class="text-sm text-muted-foreground">01 — 04</span></div>
    <div class="grid gap-5 md:grid-cols-2">
     <Card.Root>
      <Card.Header><Card.Title>Button</Card.Title><Card.Description>操作、层级与状态。</Card.Description></Card.Header>
      <Card.Content class="flex flex-row flex-wrap items-center gap-3">
       <Button>主要操作</Button><Button variant="secondary">次要操作</Button><Button variant="outline">描边</Button><Button variant="ghost">轻量</Button><Button variant="destructive">危险操作</Button><Button disabled>不可用</Button>
      </Card.Content>
     </Card.Root>
     <Card.Root>
      <Card.Header><Card.Title>Badge</Card.Title><Card.Description>紧凑的标签与信息标记。</Card.Description></Card.Header>
      <Card.Content class="flex flex-row flex-wrap gap-3"><Badge>默认</Badge><Badge variant="secondary">草稿</Badge><Badge variant="outline">原创组件</Badge><Badge variant="destructive">需关注</Badge></Card.Content>
     </Card.Root>
     <Card.Root>
      <Card.Header><Card.Title>Input</Card.Title><Card.Description>保留原生表单与键盘行为。</Card.Description></Card.Header>
      <Card.Content>
       <form class="space-y-4" onsubmit={(event) => { event.preventDefault(); saved = true; }}>
        <label for="component-name" class="text-sm font-medium">组件名称</label>
        <Input id="component-name" placeholder="例如：Command Menu" bind:value={name} oninput={() => (saved = false)} required />
        <div class="flex items-center gap-3"><Button type="submit" variant="outline">试用表单</Button><span role="status" class="text-sm text-muted-foreground">{saved ? `已提交演示：${name}` : '仅本页演示，不会保存'}</span></div>
       </form>
      </Card.Content>
     </Card.Root>
     <Card.Root>
      <Card.Header><Card.Title>Card</Card.Title><Card.Description>可组合的内容容器。</Card.Description></Card.Header>
      <Card.Content><p class="text-sm leading-7 text-muted-foreground">标题、说明、内容和操作区域独立组合。当前展示的是上游基线，后续可直接修改源码和语义主题变量。</p></Card.Content>
      <Card.Footer><Badge variant="outline">可自由定制</Badge></Card.Footer>
     </Card.Root>
    </div>
   </section>
   <section class="border-t py-10">
    <h2 class="text-xl font-semibold">源码就是组件库</h2>
    <p class="mt-3 text-sm leading-7 text-muted-foreground">在 src/lib/components/ui 中定制组件，在 registry.json 中登记。构建后通过 /r/button.json 等地址分发源码。</p>
    <pre class="mt-5 overflow-x-auto rounded-lg border bg-muted/40 p-5 text-sm"><code>npm run registry:build</code></pre>
   </section>
  </main>
  <footer class="border-t py-6 text-xs text-muted-foreground">Valar Svelte · Built on shadcn-svelte · Made to evolve</footer>
 </div>
</div>
