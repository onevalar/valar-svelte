---
title: Registry
description: The source distribution service for Valar Svelte.
---

The Valar registry serves the source for components, blocks, utilities, and themes. The CLI installs these files into your project so you can keep customizing them.

## Local endpoint

The current endpoint is `http://127.0.0.1:5186/registry`, and each style lives under `styles/<style>`. For example: `/registry/styles/vega/button.json`.

## Build

```sh
pnpm --filter docs build:registry
```

## Usage and extension

Use the CLI from this repository as described in the [installation guide](/docs/installation). The source for extension templates lives in `sv-addons/registry` and is not published as a public npm plugin yet.

Custom items should follow the [registry item schema](/docs/registry/registry-item-json). There is no public registry domain yet, and there is no automatic fallback to the upstream service.
