---
name: valar-svelte
description: 使用 Valar Svelte 组件库构建或修改 Svelte／SvelteKit 界面——选组件、安装、组合、按组件自带设计规范（RULES.md）编写并用 lint 检查。适用于含 components.json 的项目、提到 Valar／valar-svelte、“添加组件”或需要写 UI 的任务。
user-invocable: false
allowed-tools: Bash(pnpm exec valar-svelte *), Bash(npx valar-svelte *)
---

# Valar Svelte

Valar Svelte 的组件以源码形式通过 CLI 安装进项目，每个组件可附带设计规范 `RULES.md`。写 UI 时按下面的顺序做，不凭记忆拼凑。

> **CLI：** `valar-svelte` 从 Valar 仓库以本地 tarball 安装（未发布到 npm），用项目的包运行器执行：`pnpm exec valar-svelte`（或 `npx valar-svelte`）。

## 工作流程（必须遵守）

1. **读项目上下文**：`components.json`（`aliases`、`style`、`iconLibrary`），列出 `aliases.ui` 目录下已安装的组件。
2. **选组件**：先查组件目录，按“何时用／何时不用”选择，不要自己写已有组件能做的东西。
   - 有 Valar MCP 时调用 `search_components` / `get_component`（启动：`pnpm exec valar-svelte mcp`）。
   - 否则读 `http://127.0.0.1:5186/llms-small.txt`（每个组件一行，含“不适用→改用”）或 `http://127.0.0.1:5186/registry/catalog.json`。
   - 组件详细用法：`http://127.0.0.1:5186/docs/components/<name>.md`（顶部是说明卡，下面是完整文档）。
3. **安装**：`pnpm exec valar-svelte add <name...>`。不要导入未安装的组件。
4. **按规范编写**：安装后项目 `AGENTS.md` 中 `<!-- valar-svelte:rules:start -->` 区块汇总了通用规则和已装组件的 `RULES.md`；写代码前读它，并遵守下方“关键规则”与 `rules/` 中的写法。
5. **检查**：`pnpm exec valar-svelte lint`，修复所有 error 后再交付。

## 设计方法（由 Valar 维护者编写）

以下文件是页面组合、文案与动效的方法。**内容由维护者本人编写；AI 不得代写或自行补全。** 文件仍是占位时，按组件说明卡和 RULES.md 执行，不要自行发明这些方面的规范。

- [guides/page-composition.md](./guides/page-composition.md) — 页面组合
- [guides/copywriting.md](./guides/copywriting.md) — 界面文案
- [guides/motion.md](./guides/motion.md) — 动效

## Imports (Svelte)

Each component lives in its own folder with an `index.ts` barrel. Match the [installation docs](http://127.0.0.1:5186/docs/installation):

- **Multi-part components** (dialog, select, card, field, tabs, …): `import * as Dialog from "$lib/components/ui/dialog"` then `Dialog.Content`, `Dialog.Title`, `Card.Root`, `Card.Header`, etc. — whatever the barrel exports (short names and/or `Root as …` aliases).
- **Single-component barrels** (only one meaningful component in the folder): **named imports** — `import { Button } from "$lib/components/ui/button"` and `<Button>`, not `import * as Button` + `Button.Root`. Same pattern for `{ Input }`, `{ Badge }`, `{ Spinner }`, `{ Checkbox }`, `{ Separator }`, `{ Skeleton }`, etc.

```ts
import * as Dialog from "$lib/components/ui/dialog";
import { Button } from "$lib/components/ui/button";
import { Separator } from "$lib/components/ui/separator";
```

Use the real aliases from `components.json` (often `$lib/components/ui/...`), not hardcoded paths.

## Principles

1. **Use existing components first.** Check the component catalog (step 2 of the workflow) before writing custom UI.
2. **Use built-in variants before custom styles.** `variant="outline"`, `size="sm"`, etc.
3. **Use semantic colors.** `bg-primary`, `text-muted-foreground` — never raw values like `bg-blue-500`.

## Critical Rules

These rules are **always enforced**. Each links to a file with Incorrect/Correct code pairs.

**Valar component rules come first.** Read the `<!-- valar-svelte:rules:start -->` block in the project's `AGENTS.md` (or each installed component's `RULES.md`) before writing UI, and run the CLI's `lint` command afterwards; fix every error it reports.

### Styling & Tailwind → [styling.md](./rules/styling.md)

- **`class` for layout, not styling.** Never override component colors or typography.
- **No `space-x-*` or `space-y-*`.** Use `flex` with `gap-*`. For vertical stacks, `flex flex-col gap-*`.
- **Use `size-*` when width and height are equal.** `size-10` not `w-10 h-10`.
- **Use `truncate` shorthand.** Not `overflow-hidden text-ellipsis whitespace-nowrap`.
- **No manual `dark:` color overrides.** Use semantic tokens (`bg-background`, `text-muted-foreground`).
- **Use `cn()` for conditional classes.** Don't write manual template literal ternaries.
- **No manual `z-index` on overlay components.** Dialog, Sheet, Popover, etc. handle their own stacking.

### Forms & Inputs → [forms.md](./rules/forms.md)

- **Forms use `Field.FieldGroup` + `Field.Field`.** Never use raw `div` with `space-y-*` or `grid gap-*` for form layout.
- **`InputGroup` uses `InputGroup.Input`/`InputGroup.Textarea`.** Never raw `Input`/`Textarea` inside `InputGroup.Root`.
- **Buttons inside inputs use `InputGroup.Root` + `InputGroup.Addon`.**
- **Option sets (2–7 choices) use `ToggleGroup`.** Don't loop `Button` with manual active state.
- **`Field.FieldSet` + `Field.FieldLegend` for grouping related checkboxes/radios.** Don't use a `div` with a heading.
- **Field validation uses `data-invalid` + `aria-invalid`.** `data-invalid` on `Field`, `aria-invalid` on the control. For disabled: `data-disabled` on `Field`, `disabled` on the control.

### Component Structure → [composition.md](./rules/composition.md)

- **Items always inside their Group.** `Select.Item` → `Select.Group`. `DropdownMenu.Item` → `DropdownMenu.Group`. `Command.Item` → `Command.Group`.
- **Custom triggers.** Wrap controls in `Dialog.Trigger` / `AlertDialog.Trigger`, or control open state with `bind:open` on the root — see component docs.
- **Dialog, Sheet, and Drawer always need a Title.** `Dialog.Title`, `Sheet.Title`, `Drawer.Title` required for accessibility. Use `class="sr-only"` if visually hidden.
- **Use full Card composition.** `Card.Header`/`Card.Title`/`Card.Description`/`Card.Content`/`Card.Footer`. Don't dump everything in `Card.Content`.
- **Button has no `isPending`/`isLoading`.** Compose with `Spinner` inside `Button` + `disabled`; use `data-icon="inline-start"` / `inline-end` on `Spinner` for correct spacing (`import { Button }`, `import { Spinner }`).
- **`Tabs.Trigger` must be inside `Tabs.List`.** Never render triggers directly in `Tabs`.
- **`Avatar` always needs `Avatar.Fallback`.** For when the image fails to load.

### Use Components, Not Custom Markup → [composition.md](./rules/composition.md)

- **Use existing components before custom markup.** Check if a component exists before writing a styled `div`.
- **Callouts use `Alert`.** Don't build custom styled divs.
- **Empty states use `Empty`.** Don't build custom empty state markup.
- **Toast via `svelte-sonner`.** Use `toast()` from `svelte-sonner` with the Sonner component from your UI folder.
- **Use `Separator`** instead of `<hr>` or a `div` with border-only classes.
- **Use `Skeleton`** for loading placeholders. No custom `animate-pulse` divs.
- **Use `Badge`** instead of custom styled spans.

### Icons → [icons.md](./rules/icons.md)

- **Icons in `<Button>` use `data-icon`.** `data-icon="inline-start"` or `data-icon="inline-end"` on the icon.
- **No sizing classes on icons inside components.** Components handle icon sizing via CSS. No `size-4` or `w-4 h-4`.
- **Pass icons as components.** Import from the configured `iconLibrary` (e.g. `@lucide/svelte`), not string keys.

### CLI

- **Presets** — copy the encoded string from the design-system builder on [Valar 文档站](http://127.0.0.1:5186) and pass it to `pnpm exec valar-svelte init --preset <code>`.

## Key Patterns

These are the most common patterns that differentiate correct Valar Svelte code. For edge cases, see the linked rule files above.

```svelte
<script lang="ts">
  import * as Field from "$lib/components/ui/field";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import SearchIcon from "@lucide/svelte/icons/search";
  import { Badge } from "$lib/components/ui/badge";
  import * as Avatar from "$lib/components/ui/avatar";
</script>

<!-- Form layout: Field.FieldGroup + Field.Field, not div + Label. -->
<Field.FieldGroup>
  <Field.Field>
    <Field.FieldLabel for="email">Email</Field.FieldLabel>
    <Input id="email" />
  </Field.Field>
</Field.FieldGroup>

<!-- Validation: data-invalid on Field, aria-invalid on the control. -->
<Field.Field data-invalid>
  <Field.FieldLabel for="email">Email</Field.FieldLabel>
  <Input id="email" aria-invalid />
  <Field.FieldDescription>Invalid email.</Field.FieldDescription>
</Field.Field>

<!-- Icons in buttons: data-icon, no sizing classes. -->
<Button>
  <SearchIcon data-icon="inline-start" />
  Search
</Button>

<!-- Spacing: gap-*, not space-y-*. -->
<div class="flex flex-col gap-4"></div>

<!-- Equal dimensions: size-*, not w-* h-*. -->
<Avatar.Root class="size-10">
  <Avatar.Image src="/u.png" alt="User" />
  <Avatar.Fallback>U</Avatar.Fallback>
</Avatar.Root>

<!-- Status colors: Badge variants or semantic tokens, not raw colors. -->
<Badge variant="secondary">+20.1%</Badge>
```

## Component Selection

选组件的依据只在组件说明卡里（`ui/<name>/meta.json`，汇总为 `catalog.json`、`llms-small.txt`）。按卡片里的“何时用／何时不用→改用”判断；没有说明卡的组件见 `catalog.json` 的 `missingCards`，查阅其文档页后谨慎使用。

## Key Fields

Use `components.json` and the filesystem — not a separate `info` command:

- **`aliases`** → use the actual alias prefix from config (e.g. `$lib/`), never hardcode unrelated projects.
- **`tailwind.css`** → the global CSS file where theme variables live. Edit this file for theme tweaks; don't add a second globals file unless the user already uses one.
- **`style`** → visual treatment (e.g. `nova`, `vega`, …) and registry style path.
- **`iconLibrary`** → determines icon packages (`@lucide/svelte`, `@tabler/icons-svelte`, etc.). Never assume `@lucide/svelte`.
- **`registry`** → where the CLI fetches components; default official registry at `http://127.0.0.1:5186/registry`.
- **`resolvedPaths`** (conceptual) → the CLI resolves `aliases` to absolute paths; list `aliases.ui` on disk to see installed components.

See [cli.md](./cli.md) for commands and flags.

## Updating Components

Use the **`update`** command to pull the latest registry versions of components already in the project. Review changes with `git diff` after `update`.

1. Commit or stash local work.
2. Run `pnpm exec valar-svelte update [component]` or `--all`.
3. Resolve merge conflicts if you had customized files.
4. **Never use `--overwrite` on `add` without the user's explicit approval** when it would destroy intentional edits.

## Quick Reference

```bash
# Initialize Valar Svelte in your project.
pnpm exec valar-svelte init

# Initialize with a preset string from the docs site builder.
pnpm exec valar-svelte init --preset <code>

# Add components (interactive when run with no names).
pnpm exec valar-svelte add
pnpm exec valar-svelte add button card dialog
pnpm exec valar-svelte add --all

# Update components already installed.
pnpm exec valar-svelte update button
pnpm exec valar-svelte update --all --yes

# Check app code against Valar design rules (fix every error).
pnpm exec valar-svelte lint

# Start the local, read-only Valar MCP server (stdio).
pnpm exec valar-svelte mcp

# Build a custom registry (registry authors).
pnpm exec valar-svelte registry build
```

**Registry:** default `http://127.0.0.1:5186/registry` — override in `components.json` if needed.  
**Docs:** [Valar 文档站](http://127.0.0.1:5186)

## Detailed References

- [guides/](./guides/) — 页面组合、文案、动效（维护者编写）

- [rules/forms.md](./rules/forms.md) — Field.FieldGroup, Field.Field, InputGroup, ToggleGroup, Field.FieldSet, validation states
- [rules/composition.md](./rules/composition.md) — Groups, overlays, Card, Tabs, Avatar, Alert, Empty, Toast, Separator, Skeleton, Badge, Button loading
- [rules/icons.md](./rules/icons.md) — data-icon, icon sizing, passing icon components
- [rules/styling.md](./rules/styling.md) — Semantic colors, variants, class, spacing, size, truncate, dark mode, cn(), z-index
- [cli.md](./cli.md) — Commands, flags, registry
- [customization.md](./customization.md) — Theming, CSS variables, extending components
