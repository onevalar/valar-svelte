---
title: 数据表格
description: 基于 TanStack Table 构建的表格与数据网格。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/blob/next/docs/src/lib/registry/examples/data-table-demo.svelte
  doc: https://tanstack.com/table/latest/docs/framework/svelte/quick-start
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import Callout from "$lib/components/callout.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
	import Step from "$lib/components/step.svelte";
</script>

<ComponentPreview name="data-table-demo">

<div></div>

</ComponentPreview>

## 简介

数据表格支持的功能多，每个数据集又各不相同，很难做成通用组件。

所以我们没有追求一套放之四海而皆准的方案，而是写了一份指南，帮你搭建自己的数据表格。

从基础的 `<Table />` 组件开始，一步步扩展成功能完整的数据表格。

<Callout>

提示：同一张表格在多处复用时，可以抽成可复用组件。

</Callout>

## 目录

本指南介绍如何用 [TanStack Table](https://tanstack.com/table) 和 `<Table />` 组件搭建自定义数据表格，涵盖以下主题：

- [配置表格特性](#配置表格特性)
- [基础表格](#基础表格)
- [行操作](#行操作)
- [分页](#分页)
- [排序](#排序)
- [筛选](#筛选)
- [可见性](#可见性)
- [行选择](#行选择)
- [可复用组件](#可复用组件)

## 安装

1. 把 `<Table />` 组件加入项目：

<PMAddComp name="table" />

2. 添加 `@tanstack/svelte-table` 依赖。本指南使用 **TanStack Table v9**：

<PMInstall command="@tanstack/svelte-table" />

## 前置条件

接下来搭一张展示近期支付记录的表格，数据结构如下：

```ts showLineNumbers
type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export const data: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "example@gmail.com",
  },
  // ...
];
```

## 项目结构

先创建数据表格所在的路由（这里叫 payments），并建立以下文件：

```txt
routes
└── payments
    ├── columns.ts
    ├── data-table-features.ts
    ├── data-table.svelte
    ├── data-table-actions.svelte
    ├── data-table-checkbox.svelte
    ├── data-table-email-button.svelte
    └── +page.svelte
```

- `columns.ts` 存放列定义。
- `data-table-features.ts` 存放共享的 `features` 对象，声明 TanStack Table 要启用哪些行为。
- `data-table.svelte` 包含 `<Table />` 组件和完整的 `<DataTable />` 组件。
- `data-table-actions.svelte` 包含每一行的操作菜单。
- `data-table-checkbox.svelte` 包含每一行的复选框。
- `data-table-email-button.svelte` 包含可排序的邮箱表头按钮。
- `+page.svelte` 用于渲染并访问 `<DataTable />` 组件。

## 配置表格特性

TanStack Table v9 以特性为中心：需要哪种行为——排序、筛选、分页等——就用 `tableFeatures()` 声明。未注册的部分会被 tree-shaking 移出打包结果。内置的筛选与排序函数同理：列中依赖的函数要注册到 `filterFns` 和 `sortFns`。这里的邮箱筛选使用 `includesString`，字符串列按 `alphanumeric` / `text` 排序。

`features` 对象只定义一次，列定义和 `<DataTable />` 组件共用。

```ts showLineNumbers title="routes/payments/data-table-features.ts"
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
} from "@tanstack/svelte-table";

// New in v9: declare the features this table uses — anything you don't
// register is tree-shaken out of the bundle.
export const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
});

// Pass this as the first generic argument to `ColumnDef`, `Column`, `Table`,
// and `Row` so each type knows which feature APIs are available.
export type DataTableFeatures = typeof features;
```

<Callout class="mt-4">

**说明：** 核心行模型始终包含在内，不需要自行注册。可选特性的行模型由 `create*RowModel()` 创建，再注册到 `features` 对象上，`get*RowModel` 这类表格选项已不再提供。

</Callout>

## 基础表格

先搭一张基础表格。

<Steps>

### 列定义

先用 `createColumnHelper` 定义各列，泛型参数带上表格的特性类型。

```ts showLineNumbers {1-2,14,16-26} title="routes/payments/columns.ts"
import { createColumnHelper } from "@tanstack/svelte-table";
import type { DataTableFeatures } from "./data-table-features.js";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, Payment>();

export const columns = columnHelper.columns([
  columnHelper.accessor("status", {
    header: "Status",
  }),
  columnHelper.accessor("email", {
    header: "Email",
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
  }),
]);
```

<Callout class="mt-4">

**说明：** 列决定表格的核心外观：显示哪些数据，以及如何格式化、排序和筛选。

</Callout>

### `<DataTable />` 组件

接着创建 `<DataTable />` 组件来渲染表格。

`createTable` 必须在组件初始化阶段调用（`<script>` 顶层），才能接入 Svelte 的响应式系统。此后表格自行管理状态：`table.getRowModel()`、`table.atoms.pagination.get()` 这类读取是 rune 响应式的，模板会自动更新，不需要 `$state` 镜像或变更处理函数。`data` 通过 getter 传入，表格每次读到的都是属性的当前值。

```svelte showLineNumbers title="routes/payments/data-table.svelte"
<script lang="ts" generics="TData extends RowData">
  import {
    type ColumnDef,
    type RowData,
    createTable,
    FlexRender,
  } from "@tanstack/svelte-table";
  import * as Table from "$lib/components/ui/table/index.js";
  import { features, type DataTableFeatures } from "./data-table-features.js";

  type DataTableProps<TData extends RowData> = {
    columns: ColumnDef<DataTableFeatures, TData>[];
    data: TData[];
  };

  let { data, columns }: DataTableProps<TData> = $props();

  const table = createTable({
    features,
    get data() {
      return data;
    },
    columns,
  });
</script>

<div class="rounded-md border">
  <Table.Root>
    <Table.Header>
      {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
        <Table.Row>
          {#each headerGroup.headers as header (header.id)}
            <Table.Head colspan={header.colSpan}>
              {#if !header.isPlaceholder}
                <FlexRender {header} />
              {/if}
            </Table.Head>
          {/each}
        </Table.Row>
      {/each}
    </Table.Header>
    <Table.Body>
      {#each table.getRowModel().rows as row (row.id)}
        <Table.Row data-state={row.getIsSelected() && "selected"}>
          {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell>
              <FlexRender {cell} />
            </Table.Cell>
          {/each}
        </Table.Row>
      {:else}
        <Table.Row>
          <Table.Cell colspan={columns.length} class="h-24 text-center">
            No results.
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
```

把 `header` 或 `cell` 实例传给 `<FlexRender />`，它会渲染列定义提供的内容：普通字符串、片段或组件。

<Callout>

**提示**：多处用到 `<DataTable />` 时，可以把它抽到 `components/ui/data-table.svelte`，做成可复用组件。

`<DataTable columns={columns} data={data} />`

</Callout>

<Callout class="mt-4">

**受控状态：** v9 在内部持有表格状态，本指南大部分场景都不必写 `$state` 镜像或变更处理函数。如果表格之外的部分需要持有一部分状态（把筛选同步到 URL、服务端分页等），受控状态依然可用：在[行选择](#行选择)一节会用 `createTableState` 在外部管理行选择状态。详见[迁移指南](https://tanstack.com/table/latest/docs/framework/svelte/guide/migrating)。

</Callout>

### 渲染表格

最后在页面组件中渲染表格。

```ts showLineNumbers title="routes/payments/+page.server.ts"
export async function load() {
  // logic to fetch payments data here
  const payments = await getPayments();
  return {
    payments,
  };
}
```

```svelte showLineNumbers {8} title="routes/payments/+page.svelte"
<script lang="ts">
  import DataTable from "./data-table.svelte";
  import { columns } from "./columns.js";

  let { data } = $props();
</script>

<DataTable data={data.payments} {columns} />
```

</Steps>

## 单元格格式化

把金额单元格格式化为美元金额，同时右对齐。

<Steps>

### 更新列定义

按以下方式更新 amount 列的 `header` 与 `cell` 定义：

```ts showLineNumbers title="routes/payments/columns.ts"
import { createColumnHelper, renderSnippet } from "@tanstack/svelte-table";
import { createRawSnippet } from "svelte";
import type { DataTableFeatures } from "./data-table-features.js";

const columnHelper = createColumnHelper<DataTableFeatures, Payment>();

export const columns = columnHelper.columns([
  columnHelper.accessor("amount", {
    header: () => {
      const amountHeaderSnippet = createRawSnippet(() => ({
        render: () => `<div class="text-end">Amount</div>`,
      }));
      return renderSnippet(amountHeaderSnippet);
    },
    cell: ({ row }) => {
      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      });

      const amountCellSnippet = createRawSnippet<[{ amount: number }]>(
        (getAmount) => {
          const { amount } = getAmount();
          const formatted = formatter.format(amount);
          return {
            render: () =>
              `<div class="text-end font-medium">${formatted}</div>`,
          };
        }
      );

      return renderSnippet(amountCellSnippet, {
        amount: row.original.amount,
      });
    },
  }),
]);
```

`createRawSnippet` 用来创建 Svelte 片段，渲染简单 HTML 元素，这类元素不需要组件那样的完整生命周期和状态能力；之后用 `renderSnippet` 辅助函数渲染该片段。`renderSnippet` 和 `renderComponent` 都直接从 `@tanstack/svelte-table` 导入。

其他单元格和表头也可以用同样的方式格式化。

</Steps>

## 行操作

接下来给表格加行操作，会用到 `<DropdownMenu />` 和 `<Button />` 组件；还没安装的话先安装：

<PMAddComp name="button dropdown-menu" />

<Steps>

### 创建操作组件

先在 `data-table-actions.svelte` 中定义操作菜单。

```svelte showLineNumbers title="routes/payments/data-table-actions.svelte"
<script lang="ts">
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";

  let { id }: { id: string } = $props();
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="ghost"
        size="icon"
        class="relative size-8 p-0"
      >
        <span class="sr-only">Open menu</span>
        <EllipsisIcon />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Group>
      <DropdownMenu.Label>Actions</DropdownMenu.Label>
      <DropdownMenu.Item onclick={() => navigator.clipboard.writeText(id)}>
        Copy payment ID
      </DropdownMenu.Item>
    </DropdownMenu.Group>
    <DropdownMenu.Separator />
    <DropdownMenu.Item>View customer</DropdownMenu.Item>
    <DropdownMenu.Item>View payment details</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
```

### 更新列定义

`<DataTableActions />` 定义好了，接下来加一个 `actions` 列来使用它。这一列不读取数据字段，用 `columnHelper.display` 定义。

```ts showLineNumbers title="routes/payments/columns.ts"
import { createColumnHelper, renderComponent } from "@tanstack/svelte-table";
import DataTableActions from "./data-table-actions.svelte";

export const columns = columnHelper.columns([
  // ...
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { id: row.original.id });
    },
  }),
]);
```

在 `cell` 函数里通过 `row.original` 读取行数据，据此处理该行的操作，例如用 `id` 向 API 发起 DELETE 请求。

</Steps>

## 分页

下面给表格加上分页。

<Steps>

### 分页默认已启用

`features` 对象中注册了 `rowPaginationFeature` 和 `createPaginatedRowModel()`，表格会自动按每页 10 条分页，`createTable` 不用再加配置。自定义每页条数、实现手动分页的做法见[分页文档](https://tanstack.com/table/latest/docs/framework/svelte/guide/pagination)。

### 添加分页控件

用 `<Button />` 组件和 `table.previousPage()`、`table.nextPage()` 两个 API 方法添加翻页控件。

```svelte showLineNumbers title="routes/payments/data-table.svelte"
<script lang="ts" generics="TData extends RowData">
  import { Button } from "$lib/components/ui/button/index.js";

  // ...the rest of the script stays the same
</script>

<div>
  <div class="rounded-md border">
    <Table.Root>
      <!--- ... table implementation -->
    </Table.Root>
  </div>
  <div class="flex items-center justify-end space-x-2 py-4">
    <Button
      variant="outline"
      size="sm"
      onclick={() => table.previousPage()}
      disabled={!table.getCanPreviousPage()}
    >
      Previous
    </Button>
    <Button
      variant="outline"
      size="sm"
      onclick={() => table.nextPage()}
      disabled={!table.getCanNextPage()}
    >
      Next
    </Button>
  </div>
</div>
```

更完整的翻页组件见[可复用组件](#可复用组件)一节。

### 修改每页条数

调用 `table.setPageSize()` 修改每页条数。读取当前分页状态（比如显示页码）用 `table.atoms.pagination.get()`。该读取是 rune 响应式的：放在模板或 `$derived` 中，翻页时会自动更新。

```svelte
<script lang="ts">
  // Rune-reactive read — updates whenever the user changes pages.
  const pagination = $derived(table.atoms.pagination.get());
</script>

<Button variant="outline" size="sm" onclick={() => table.setPageSize(20)}>
  Show 20 rows
</Button>

<div class="text-muted-foreground text-sm">
  Page {pagination.pageIndex + 1} of {table.getPageCount()}
</div>
```

</Steps>

## 排序

让邮箱列支持排序。

`features` 对象中已经注册了 `rowSortingFeature` 和排序行模型，字符串列通过默认 `auto` 设置解析到的 `alphanumeric`、`text` 排序函数同样在其中，因此 `<DataTable />` 不用改动，只需补上界面。

<Steps>

### 定义 `<DataTableEmailButton />` 组件

先创建一个组件，渲染可排序的邮箱表头按钮。

```svelte showLineNumbers title="routes/payments/data-table-email-button.svelte"
<script lang="ts">
  import type { ComponentProps } from "svelte";
  import ArrowUpDownIcon from "@lucide/svelte/icons/arrow-up-down";
  import { Button } from "$lib/components/ui/button/index.js";

  let { variant = "ghost", ...restProps }: ComponentProps<typeof Button> =
    $props();
</script>

<Button {variant} {...restProps}>
  Email
  <ArrowUpDownIcon class="ms-2 size-4" />
</Button>
```

### 让表头单元格可排序

接着更新 `email` 的表头单元格，加上排序控件。

```ts showLineNumbers title="routes/payments/columns.ts"
import { createColumnHelper, renderComponent } from "@tanstack/svelte-table";
import DataTableEmailButton from "./data-table-email-button.svelte";

export const columns = columnHelper.columns([
  // ...
  columnHelper.accessor("email", {
    header: ({ column }) =>
      renderComponent(DataTableEmailButton, {
        onclick: column.getToggleSortingHandler(),
      }),
  }),
]);
```

用户点击表头单元格即可在升序、降序之间切换，表格自动排序。排序状态由表格持有，不用额外处理。

</Steps>

## 筛选

加一个搜索输入框，按邮箱筛选表格中的记录。

`features` 对象中已注册 `columnFilteringFeature`、筛选行模型和 `includesString` 筛选函数，剩下的只是渲染输入框。

<Steps>

### 添加搜索输入框

```svelte showLineNumbers title="routes/payments/data-table.svelte"
<script lang="ts" generics="TData extends RowData">
  import { Input } from "$lib/components/ui/input/index.js";

  // ...the rest of the script stays the same
</script>

<div>
  <div class="flex items-center py-4">
    <Input
      placeholder="Filter emails..."
      value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
      onchange={(e) => {
        table.getColumn("email")?.setFilterValue(e.currentTarget.value);
      }}
      oninput={(e) => {
        table.getColumn("email")?.setFilterValue(e.currentTarget.value);
      }}
      class="max-w-sm"
    />
  </div>
  <div class="rounded-md border">
    <Table.Root><!-- ... --></Table.Root>
  </div>
</div>
```

`email` 列现在可以筛选，其他列也能照此添加。注意：以字符串形式引用筛选函数时，只会解析已注册的函数；若其他列需要别的内置筛选函数，先加到 `data-table-features.ts` 的 `filterFns` 中。自定义筛选的做法见[筛选文档](https://tanstack.com/table/latest/docs/framework/svelte/guide/column-filtering)。

</Steps>

## 可见性

借助 `@tanstack/svelte-table` 的可见性 API，列的显示与隐藏很容易实现。`columnVisibilityFeature` 已在 `features` 对象中注册，只需补上下拉菜单。

<Steps>

### 添加列切换下拉菜单

```svelte showLineNumbers title="routes/payments/data-table.svelte"
<script lang="ts" generics="TData extends RowData">
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";

  // ...the rest of the script stays the same
</script>

<div>
  <div class="flex items-center py-4">
    <Input
      placeholder="Filter emails..."
      value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
      onchange={(e) =>
        table.getColumn("email")?.setFilterValue(e.currentTarget.value)}
      oninput={(e) =>
        table.getColumn("email")?.setFilterValue(e.currentTarget.value)}
      class="max-w-sm"
    />
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Button {...props} variant="outline" class="ms-auto">Columns</Button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        {#each table
          .getAllColumns()
          .filter((col) => col.getCanHide()) as column (column.id)}
          <DropdownMenu.CheckboxItem
            class="capitalize"
            bind:checked={
              () => column.getIsVisible(), (v) => column.toggleVisibility(!!v)
            }
          >
            {column.id}
          </DropdownMenu.CheckboxItem>
        {/each}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
  <div class="rounded-md border">
    <Table.Root><!--...--></Table.Root>
  </div>
</div>
```

这样就有了一个下拉菜单，用来切换列的显示与隐藏。

</Steps>

## 行选择

接下来加行选择。`rowSelectionFeature` 已在 `features` 对象中注册，选中状态由表格跟踪，我们只需渲染复选框。

<Steps>

### 定义 `<DataTableCheckbox />` 组件

先在 `data-table-checkbox.svelte` 中定义复选框组件。

```svelte showLineNumbers title="routes/payments/data-table-checkbox.svelte"
<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";

  let {
    checked = false,
    onCheckedChange = (v) => (checked = v),
    ...restProps
  }: ComponentProps<typeof Checkbox> = $props();
</script>

<Checkbox bind:checked={() => checked, onCheckedChange} {...restProps} />
```

### 更新列定义

组件就绪后，加一个 `select` 列来渲染复选框。

```ts showLineNumbers title="routes/payments/columns.ts"
import { createColumnHelper, renderComponent } from "@tanstack/svelte-table";
import DataTableCheckbox from "./data-table-checkbox.svelte";

export const columns = columnHelper.columns([
  columnHelper.display({
    id: "select",
    header: ({ table }) =>
      renderComponent(DataTableCheckbox, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate:
          table.getIsSomePageRowsSelected() &&
          !table.getIsAllPageRowsSelected(),
        onCheckedChange: (value: boolean) =>
          table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Select all",
      }),
    cell: ({ row }) =>
      renderComponent(DataTableCheckbox, {
        checked: row.getIsSelected(),
        onCheckedChange: (value: boolean) => row.toggleSelected(!!value),
        "aria-label": "Select row",
      }),
    enableSorting: false,
    enableHiding: false,
  }),
  // ...
]);
```

每行出现一个复选框，表头也有一个用于全选的复选框。

<Callout class="mt-4">

**说明：** 在 v9 中，只要当前页有一行被选中，`table.getIsSomePageRowsSelected()` 就返回 `true`，全部选中时同样如此。所以表头复选框的 `indeterminate` 状态要配合 `!table.getIsAllPageRowsSelected()` 判断，全部选中时才清除。

</Callout>

### 在外部管理选择状态

默认由表格内部跟踪选择状态。这里再演示另一种做法：把状态片段放到表格之外（页面需要读取或驱动选择时很有用），只用 `createTableState` 管理这一个片段，其余仍留在内部。在 `@tanstack/svelte-table` 的导入中加入 `createTableState` 和 `type RowSelectionState`，再更新 `createTable`：

```ts showLineNumbers title="routes/payments/data-table.svelte" {1-2,10-15}
// Keep row selection outside the table so the rest of the app can read or update it.
const [rowSelection, setRowSelection] = createTableState<RowSelectionState>(
  {}
);

const table = createTable({
  features,
  get data() {
    return data;
  },
  columns,
  state: {
    get rowSelection() {
      return rowSelection();
    },
  },
  onRowSelectionChange: setRowSelection,
});
```

`rowSelection()` 是基于 rune 的 getter，组件内任何位置都能读取；`setRowSelection` 接受值或更新函数。

### 显示已选行

用 `table.getFilteredSelectedRowModel()` 显示已选行数。

```svelte
<div class="text-muted-foreground flex-1 text-sm">
  {table.getFilteredSelectedRowModel().rows.length} of
  {table.getFilteredRowModel().rows.length} row(s) selected.
</div>
```

</Steps>

## 可复用组件

参见[任务](/examples/tasks)示例，了解如何为数据表格编写可复用组件。
