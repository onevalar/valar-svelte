import { beforeEach, describe, expect, it, vi } from "vitest";
import * as project from "../../src/utils/project.js";
import { preflightInit } from "../../src/commands/init/preflight.js";
vi.mock("../../src/utils/project.js");
function mockVersions(versions: Record<string, string | undefined>) {
 vi.mocked(project.getPackageVersion).mockImplementation((_cwd, name) => versions[name]);
}
describe("Valar initialization",()=>{
 beforeEach(()=>vi.clearAllMocks());
 it.each([
  {tailwindcss:"3.0.0",svelte:"5.0.0"},
  {tailwindcss:"3.0.0",svelte:"4.0.0"},
  {tailwindcss:"4.0.0",svelte:"4.0.0"},
  {},
 ])("rejects unsupported or missing dependencies: %j",versions=>{
  mockVersions(versions);
  expect(()=>preflightInit("/test",{skipPreflight:false})).toThrow("requires Tailwind CSS v4 and Svelte v5");
 });
 it("accepts Svelte 5 and Tailwind 4",()=>{
  mockVersions({tailwindcss:"4.3.3",svelte:"5.57.2"});
  expect(()=>preflightInit("/test",{skipPreflight:false})).not.toThrow();
 });
 it("allows the explicit preflight override",()=>{
  mockVersions({});
  expect(()=>preflightInit("/test",{skipPreflight:true})).not.toThrow();
 });
});
