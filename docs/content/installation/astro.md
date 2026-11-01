---
title: Astro
description: Install and use the local Valar Svelte source.
---

## Prepare the repository

```sh
git clone https://github.com/onevalar/valar-svelte.git
cd valar-svelte
nvm use
pnpm install --frozen-lockfile
pnpm dev
```

These commands assume your checkout is already in sync. The local source lives in the current `valar-svelte` directory. The CLI package is called `@valar/svelte-cli` and has not been published to npm.

## Install components in your project

Your project needs Svelte 5 and Tailwind CSS 4. Start the local docs site and registry (currently at `http://127.0.0.1:5186`), then run the following from the root of the Valar repository:

```sh
pnpm --filter @valar/svelte-cli start init --cwd /absolute/path/to/your-app
pnpm --filter @valar/svelte-cli start add button --cwd /absolute/path/to/your-app
```

You can pass `--no-deps-install` during initialization to write the configuration first. The `@valar/svelte-cli/tailwind.css` file that the CLI injects also comes from this repository. Until the package is published, run `pnpm --filter @valar/svelte-cli pack` to build a local tarball and install that file in your project. Don't install a package of the same name from npm.

## Registry

By default the CLI only connects to the local Valar registry. To use a different address, set the `REGISTRY_URL` environment variable or the `registry` field in your project's `components.json`. Don't point it at the upstream registry, or you'll end up installing upstream versions.
