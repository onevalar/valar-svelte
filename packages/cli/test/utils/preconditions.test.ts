import { beforeEach, describe, expect, it, vi } from "vitest";
import * as project from "../../src/utils/project.js";
import { DEFAULT_CONFIG, writeConfig } from "../../src/utils/config/index.js";
import { checkPreconditions } from "../../src/utils/preconditions.js";

vi.mock("../../src/utils/project.js");
vi.mock("../../src/utils/config/index.js", async () => ({
 ...(await vi.importActual<typeof import("../../src/utils/config/index.js")>("../../src/utils/config/index.js")),
 writeConfig: vi.fn(),
}));

function mockVersions(versions: Record<string, string>) {
 vi.mocked(project.getPackageVersion).mockImplementation((_cwd, name) => versions[name]);
}

describe("Valar distribution preconditions", () => {
 beforeEach(() => vi.clearAllMocks());
 it("preserves an explicitly configured Valar registry for supported projects", () => {
  mockVersions({tailwindcss:"4.3.3",svelte:"5.57.2"});
  const config={...DEFAULT_CONFIG,registry:"https://components.example.test/registry"};
  expect(checkPreconditions({cwd:"/test",config,skipPreflight:false})).toEqual(config);
  expect(writeConfig).not.toHaveBeenCalled();
 });
 it.each([
  {tailwindcss:"3.0.0",svelte:"5.0.0"},
  {tailwindcss:"4.0.0",svelte:"4.0.0"},
  {tailwindcss:"3.0.0",svelte:"4.0.0"},
  {tailwindcss:"2.0.0",svelte:"5.0.0"},
 ])("rejects unsupported versions without redirecting to an upstream registry: %j", versions => {
  mockVersions(versions);
  const config={...DEFAULT_CONFIG};
  const original=structuredClone(config);
  expect(()=>checkPreconditions({cwd:"/test",config,skipPreflight:false})).toThrow("No legacy registry is used");
  expect(config).toEqual(original);
  expect(writeConfig).not.toHaveBeenCalled();
 });
});
