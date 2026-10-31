# @valar/svelte-registry

`sv` community add-on that scaffolds a [Valar Svelte custom registry](http://127.0.0.1:5186/docs/registry) into an existing SvelteKit project.

## Usage

This package and the CLI are private and are not available from npm. Build the
workspace, pack `@valar/svelte-cli`, and install its local tarball in the target
project before adding this local add-on:

```sh
# from the Valar repository
pnpm build:cli
pnpm --filter @valar/svelte-cli pack
# from the target SvelteKit project (replace the absolute paths)
pnpm add -D @valar/svelte-cli@file:/absolute/path/to/valar-svelte/packages/cli/valar-svelte-cli-0.1.0.tgz
pnpm dlx sv add file:/absolute/path/to/valar-svelte/sv-addons/registry
```

This add-on:

- depends on the official `tailwindcss` add-on
- writes `registry.json` and the example registry sources under `$lib/registry`
- adds `cn` helpers, theme CSS, and a registry preview page (optional)
- installs the packages needed to author and build a registry
- adds a `build:registry` script

### Options

#### `demo`

Include the registry preview page.

Default: `true`

Pass `demo:true` or `demo:false` on the local add-on specifier.

## Local development

```sh
## create a new minimal project in the `demo` directory
pnpm demo:create

## build and add this add-on to the demo project
pnpm demo:add

## run the tests
pnpm test
```

The demo installs the repository's built CLI using a local `file:` dependency,
never an unpublished npm version. Build the workspace first (`pnpm build:cli`).

You can also install a local build into any project with:

```sh
pnpx sv add file:../path/to/registry
```

## Building the registry (in a generated project)

```sh
pnpm build:registry
```

Registry JSON files are written to `static/r` by default and can be served from your SvelteKit app.

## Documentation

- [Valar Svelte registry docs](http://127.0.0.1:5186/docs/registry)
- [sv community add-ons](https://svelte.dev/docs/cli/community)
