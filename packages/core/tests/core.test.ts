import { beforeEach, describe, expect, test } from "bun:test";
import {
  AppContainer,
  AppLifecycle,
  InjectionToken,
  Module,
  PluginManager,
  type Token,
  createInjectionDecorator,
  loadModule,
  overrideInjectionContainerForTest,
} from "@zenject/core";
import { container } from "tsyringe";

// Helper to reset container state between tests
function resetContainer() {
  AppContainer.reset();
  (
    AppLifecycle as unknown as {
      isShuttingDown: boolean;
      listeners: Map<unknown, unknown>;
    }
  ).isShuttingDown = false;
  (
    AppLifecycle as unknown as {
      isShuttingDown: boolean;
      listeners: Map<unknown, unknown>;
    }
  ).listeners = new Map();
}

// Dummy service implementing lifecycle hooks
class DummyService {
  public initialized = false;
  public destroyed = false;

  public onInit() {
    this.initialized = true;
  }

  public onDestroy() {
    this.destroyed = true;
  }
}

// Module providing DummyService
@Module({ providers: [DummyService] })
class DummyModule {}

// Plugin module
@Module({ providers: [DummyService] })
class PluginModule {}

// Token and injection decorator for testing createInjectionDecorator
const VALUE_TOKEN = new InjectionToken<string>(
  "VALUE_TOKEN",
) as unknown as Token<string>;
const InjectValue = createInjectionDecorator<string>(VALUE_TOKEN);

class InjectionService {
  @InjectValue public value!: string;
}

describe("loadModule", () => {
  beforeEach(() => {
    resetContainer();
  });

  test("should register providers and call onInit", async () => {
    await loadModule(DummyModule);
    const service = AppContainer.resolve(DummyService);
    expect(service.initialized).toBe(true);
  });
});

describe("PluginManager", () => {
  beforeEach(() => {
    resetContainer();
  });

  test("should load registered plugin once", async () => {
    const name = `test-${Date.now()}`;
    PluginManager.register(name, async () => ({ default: PluginModule }));

    await PluginManager.load(name);
    await PluginManager.load(name);

    const service = AppContainer.resolve(DummyService);
    expect(service.initialized).toBe(true);
    expect(PluginManager.isLoaded(name)).toBe(true);
  });
});

describe("AppLifecycle registry", () => {
  beforeEach(() => {
    resetContainer();
  });

  test("should call onDestroy on registered instances", async () => {
    const instance = new DummyService();
    AppLifecycle.register(instance);
    // Patch registry access for compatibility with tsyringe
    (
      AppContainer as unknown as {
        registry: {
          registrations: Map<unknown, unknown>;
          isResolved: () => boolean;
        };
      }
    ).registry = {
      registrations: new Map(),
      isResolved: () => true,
    };
    process.env.NODE_ENV = "test";
    await AppLifecycle.shutdown();
    expect(instance.destroyed).toBe(true);
  });

  test("should not call onDestroy after unregister", async () => {
    const instance = new DummyService();
    AppLifecycle.register(instance);
    AppLifecycle.unregister(instance);
    (
      AppContainer as unknown as {
        registry: {
          registrations: Map<unknown, unknown>;
          isResolved: () => boolean;
        };
      }
    ).registry = {
      registrations: new Map(),
      isResolved: () => true,
    };
    process.env.NODE_ENV = "test";
    await AppLifecycle.shutdown();
    expect(instance.destroyed).toBe(false);
  });
});

describe("createInjectionDecorator", () => {
  beforeEach(() => {
    resetContainer();
  });

  test("should inject value from custom container", () => {
    const testContainer = container.createChildContainer();
    testContainer.register(VALUE_TOKEN, { useValue: "hello" });
    overrideInjectionContainerForTest(InjectionService, testContainer);

    const service = new InjectionService();
    expect(service.value).toBe("hello");
  });
});
