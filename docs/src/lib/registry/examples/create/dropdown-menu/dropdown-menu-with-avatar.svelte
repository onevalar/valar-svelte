<script lang="ts">
	import * as Avatar from "$lib/registry/ui/avatar/index.js";
	import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";
</script>

<Example title="With Avatar">
	<div class="flex items-center justify-between gap-4">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button size="lg" variant="outline" class="justify-start md:max-w-[200px]" {...props}>
						<Avatar.Root>
							<Avatar.Image src="/favicon.svg" alt="Shadcn" />
							<Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-semibold">Valar</span>
							<span class="truncate text-xs text-muted-foreground"> hello@example.com </span>
						</div>
						<IconPlaceholder
							lucide="ChevronsUpDownIcon"
							tabler="IconSelector"
							hugeicons="UnfoldMoreIcon"
							phosphor="CaretUpDownIcon"
							remixicon="RiArrowUpDownLine"
							class="ml-auto text-muted-foreground"
						/>
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-(--anchor-width) min-w-56">
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<IconPlaceholder
							lucide="BadgeCheckIcon"
							tabler="IconRosetteDiscountCheck"
							hugeicons="CheckmarkBadgeIcon"
							phosphor="CheckCircleIcon"
							remixicon="RiCheckboxCircleLine"
						/>
						Account
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<IconPlaceholder
							lucide="CreditCardIcon"
							tabler="IconCreditCard"
							hugeicons="CreditCardIcon"
							phosphor="CreditCardIcon"
							remixicon="RiBankCardLine"
						/>
						Billing
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<IconPlaceholder
							lucide="BellIcon"
							tabler="IconBell"
							hugeicons="NotificationIcon"
							phosphor="BellIcon"
							remixicon="RiNotificationLine"
						/>
						Notifications
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>
					<IconPlaceholder
						lucide="LogOutIcon"
						tabler="IconLogout"
						hugeicons="LogoutIcon"
						phosphor="SignOutIcon"
						remixicon="RiLogoutBoxLine"
					/>
					Sign Out
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button variant="ghost" size="icon" {...props}>
						<Avatar.Root>
							<Avatar.Image src="/favicon.svg" alt="Valar" />
							<Avatar.Fallback>LR</Avatar.Fallback>
						</Avatar.Root>
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" side="top">
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<IconPlaceholder
							lucide="BadgeCheckIcon"
							tabler="IconRosetteDiscountCheck"
							hugeicons="CheckmarkBadgeIcon"
							phosphor="CheckCircleIcon"
							remixicon="RiCheckboxCircleLine"
						/>
						Account
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<IconPlaceholder
							lucide="CreditCardIcon"
							tabler="IconCreditCard"
							hugeicons="CreditCardIcon"
							phosphor="CreditCardIcon"
							remixicon="RiBankCardLine"
						/>
						Billing
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<IconPlaceholder
							lucide="BellIcon"
							tabler="IconBell"
							hugeicons="NotificationIcon"
							phosphor="BellIcon"
							remixicon="RiNotificationLine"
						/>
						Notifications
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>
					<IconPlaceholder
						lucide="LogOutIcon"
						tabler="IconLogout"
						hugeicons="LogoutIcon"
						phosphor="SignOutIcon"
						remixicon="RiLogoutBoxLine"
					/>
					Sign Out
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</Example>
