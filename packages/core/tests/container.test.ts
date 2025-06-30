import { beforeEach, describe, expect, test } from "bun:test";
import {
  AppContainer,
  InjectionToken,
  type Token,
  createIsolatedContainer,
  createScope,
} from "@zenject/core";

class RootService {
  public value = 42;
}

describe("container helpers", () => {
  beforeEach(() => {
    AppContainer.reset();
  });

  test("createScope should inherit registrations", () => {
    AppContainer.register(RootService, { useClass: RootService });
    const scope = createScope();
    const instance = scope.resolve(RootService);
    expect(instance.value).toBe(42);
  });

  test("createIsolatedContainer should not inherit registrations", () => {
    const TOKEN = new InjectionToken<number>("num") as unknown as Token<number>;
    AppContainer.register(TOKEN, { useValue: 1 });
    const isolated = createIsolatedContainer();
    expect(() => isolated.resolve(TOKEN)).toThrow();
  });
});
