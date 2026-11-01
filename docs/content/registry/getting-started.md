---
title: Getting Started
description: Build a local registry for Valar Svelte.
---

## Build and preview

Run the following in the Valar repository:

```sh
pnpm build:cli
pnpm --filter docs build:registry
pnpm --filter docs exec vite dev --host 127.0.0.1 --port 5186
```

The component endpoint for the default style is `http://127.0.0.1:5186/registry/styles/vega/button.json`.

## Using components

The CLI ships in this repository as `@valar/svelte-cli` and has not been published. Prepare your project as described in the [installation guide](/docs/installation), then install components with the local CLI.

## Deployment status

No production registry domain is set up yet. Once you deploy, update both `components.json` in your project and the CLI's default URL; do not use the upstream registry as a fallback.
