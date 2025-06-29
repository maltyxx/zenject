import { beforeEach, describe, expect, test } from "bun:test";
import { AppContainer, Module, PluginManager } from "@zenject/core";

@Module({})
class EmptyModule {}

describe("PluginManager", () => {
  beforeEach(() => {
    AppContainer.reset();
  });

  test("register and query plugins", () => {
    const name = `plug-${Date.now()}`;
    PluginManager.register(name, async () => ({ default: EmptyModule }));
    expect(PluginManager.isRegistered(name)).toBe(true);
    expect(PluginManager.getRegisteredPlugins()).toContain(name);
  });

  test("load plugin", async () => {
    const name = `plug-load-${Date.now()}`;
    PluginManager.register(name, async () => ({ default: EmptyModule }));
    await PluginManager.load(name);
    expect(PluginManager.isLoaded(name)).toBe(true);
    expect(PluginManager.getLoadedPlugins()).toContain(name);
  });
});
