import { redirect } from "@sveltejs/kit";
export function GET() { redirect(302, "/valar-og.svg"); }
