---
title: CLI
description: The Valar Svelte command line tool, run locally.
---

## Set up the repository

```sh
git clone https://github.com/onevalar/valar-svelte.git
cd valar-svelte
nvm use
pnpm install --frozen-lockfile
pnpm dev
```

These commands assume the repository is already synced. The source lives in the local `valar-svelte` directory. The CLI package is named `@valar/svelte-cli` and has not been published to npm.

## Install components in a target project

The target project needs Svelte 5 and Tailwind CSS 4. Start the local docs site and registry first (currently at `http://127.0.0.1:5186`), then run the following from the root of the Valar repository:

```sh
pnpm --filter @valar/svelte-cli start init --cwd /absolute/path/to/your-app
pnpm --filter @valar/svelte-cli start add button --cwd /absolute/path/to/your-app
```

Pass `--no-deps-install` during init to write the configuration without installing dependencies. The `@valar/svelte-cli/tailwind.css` stylesheet that the CLI injects also ships from this repository. Until the packages are published, build a local tarball with `pnpm --filter @valar/svelte-cli pack` and install that file in the target project. Do not download a package with the same name from npm.

## Registry

By default, the CLI connects only to the local Valar registry. To point it elsewhere, set the `REGISTRY_URL` environment variable or the `registry` field in the target project's `components.json`. Do not point it at an upstream registry: that installs the upstream versions instead.
