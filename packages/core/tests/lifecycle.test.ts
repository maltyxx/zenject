import { beforeEach, describe, expect, test } from "bun:test";
import { AppContainer, AppLifecycle, LifecycleEvent } from "@zenject/core";

class Example {
  public destroyed = false;
  public onDestroy() {
    this.destroyed = true;
  }
}

describe("AppLifecycle", () => {
  beforeEach(() => {
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
  });

  test("event listeners receive events", async () => {
    const events: LifecycleEvent[] = [];
    const listener = (e: LifecycleEvent) => {
      events.push(e);
    };
    AppLifecycle.addEventListener(LifecycleEvent.BEFORE_SHUTDOWN, listener);
    AppLifecycle.addEventListener(LifecycleEvent.SHUTDOWN, listener);
    AppLifecycle.addEventListener(LifecycleEvent.AFTER_SHUTDOWN, listener);
    (
      AppContainer as unknown as {
        registry: {
          registrations: Map<unknown, unknown>;
          isResolved: () => boolean;
        };
      }
    ).registry = { registrations: new Map(), isResolved: () => true };
    process.env.NODE_ENV = "test";
    await AppLifecycle.shutdown();
    expect(events).toEqual([
      LifecycleEvent.BEFORE_SHUTDOWN,
      LifecycleEvent.SHUTDOWN,
      LifecycleEvent.AFTER_SHUTDOWN,
    ]);
  });

  test("managed instances destroyed", async () => {
    const instance = new Example();
    AppLifecycle.register(instance);
    (
      AppContainer as unknown as {
        registry: {
          registrations: Map<unknown, unknown>;
          isResolved: () => boolean;
        };
      }
    ).registry = { registrations: new Map(), isResolved: () => true };
    process.env.NODE_ENV = "test";
    await AppLifecycle.shutdown();
    expect(instance.destroyed).toBe(true);
  });
});
