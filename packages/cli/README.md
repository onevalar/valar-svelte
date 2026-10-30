# Valar Svelte

A CLI for adding shadcn components to your project.

## Usage

Use the `init` command to initialize dependencies for a new project.

The `init` command installs dependencies, adds the `cn` util, configures, and sets up CSS variables for the project.

```bash
npx Valar Svelte init
```

## add

Use the `add` command to add components to your project.

The `add` command adds a component to your project and installs all required dependencies.

```bash
npx Valar Svelte add [component]
```

### Example

```bash
npx Valar Svelte add alert-dialog
```

You can also run the command without any arguments to view a list of all available components:

```bash
npx Valar Svelte add
```

## Documentation

Visit http://127.0.0.1:5186 to view the documentation.

## License

Licensed under the [MIT license](https://github.com/onevalar/valar-svelte/blob/main/LICENSE.md).
