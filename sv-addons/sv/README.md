# @valar/svelte-sv

`sv` community add-on that runs the [Valar Svelte](http://127.0.0.1:5186) CLI.

## Usage

```sh
# add it during project creation
npx sv create my-project --add @Valar Svelte
# or add it afterwards
npx sv add @Valar Svelte
```

This add-on:

- depends on the official `tailwindcss` add-on
- runs `Valar Svelte init` (interactive prompts)
- runs `Valar Svelte add` (interactive prompts)

## Local development

```sh
pnpm demo:create
pnpm demo:add
pnpm build
```

## Documentation

- [Valar Svelte docs](http://127.0.0.1:5186/docs)
- [sv community add-ons](https://svelte.dev/docs/cli/community)
