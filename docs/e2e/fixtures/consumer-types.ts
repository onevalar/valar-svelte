import type { DateValue } from "@internationalized/date";
import type { Button, Calendar } from "bits-ui";
import type { ComponentProps } from "svelte";

type Equal<A, B> =
	(<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;
type ButtonProps = ComponentProps<typeof Button.Root>;
type CalendarProps = ComponentProps<typeof Calendar.Root>;

// Check the public union and binding contracts, not the patch's implementation.
export type Contracts = [
	Expect<Equal<ButtonProps, Button.RootProps>>,
	Expect<Equal<CalendarProps, Calendar.RootProps>>,
	Expect<Equal<NonNullable<typeof Button.Root.z_$$bindings>, "ref">>,
	Expect<Equal<NonNullable<typeof Calendar.Root.z_$$bindings>, "ref" | "value" | "placeholder">>,
	Expect<Equal<{ href: "/"; type: "submit" } extends ButtonProps ? true : false, false>>,
	Expect<Equal<{ type: "submit" } extends ButtonProps ? true : false, true>>,
	Expect<Equal<{ type: "single"; value: DateValue[] } extends CalendarProps ? true : false, false>>,
	Expect<
		Equal<{ type: "multiple"; value: DateValue[] } extends CalendarProps ? true : false, true>
	>,
	Expect<
		Equal<
			Extract<CalendarProps, { type: "single" }>["onValueChange"],
			((value: DateValue | undefined) => void) | undefined
		>
	>,
	Expect<
		Equal<
			Extract<CalendarProps, { type: "multiple" }>["onValueChange"],
			((value: DateValue[]) => void) | undefined
		>
	>,
];
