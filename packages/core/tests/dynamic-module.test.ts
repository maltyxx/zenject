import { beforeEach, describe, expect, test } from "bun:test";
import {
  AppContainer,
  type DynamicModule,
  loadModule,
  processDynamicModule,
} from "@zenject/core";

class ServiceA {}
class ModuleA {}

class ServiceB {}
class ModuleB {}

describe("processDynamicModule", () => {
  beforeEach(() => {
    AppContainer.reset();
  });

  test("processes and loads a dynamic module", async () => {
    const dynamic: DynamicModule = {
      module: ModuleA,
      providers: [ServiceA],
      exports: [ServiceA],
    };
    processDynamicModule(dynamic);
    await loadModule(ModuleA);
    const instance = AppContainer.resolve(ServiceA);
    expect(instance).toBeInstanceOf(ServiceA);
  });

  test("registers exports from imported dynamic modules", async () => {
    const modA: DynamicModule = {
      module: ModuleA,
      providers: [ServiceA],
      exports: [ServiceA],
    };
    const modB: DynamicModule = {
      module: ModuleB,
      imports: [modA],
      providers: [ServiceB],
    };
    await loadModule(modB);
    expect(AppContainer.resolve(ServiceA)).toBeInstanceOf(ServiceA);
    expect(AppContainer.resolve(ServiceB)).toBeInstanceOf(ServiceB);
  });
});
