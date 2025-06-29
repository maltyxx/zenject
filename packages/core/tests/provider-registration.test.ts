import { beforeEach, describe, expect, test } from "bun:test";
import { AppContainer, InjectionToken, type OnInit } from "@zenject/core";
import {
  isClassProvider,
  isConstructorProvider,
  isExistingProvider,
  isFactoryProvider,
  isValueProvider,
  registerProvider,
} from "../src/utils/provider-registration";

class Service implements OnInit {
  public initialized = false;
  public onInit() {
    this.initialized = true;
  }
}

describe("provider registration", () => {
  beforeEach(() => {
    AppContainer.reset();
  });

  test("class provider", async () => {
    await registerProvider({ provide: Service, useClass: Service });
    const instance = AppContainer.resolve(Service);
    expect(instance).toBeInstanceOf(Service);
    expect(instance.initialized).toBe(true);
  });

  test("constructor provider", async () => {
    await registerProvider(Service);
    const instance = AppContainer.resolve(Service);
    expect(instance.initialized).toBe(true);
  });

  test("value provider", async () => {
    const TOKEN = new InjectionToken<string>("token");
    await registerProvider({ provide: TOKEN, useValue: "hello" });
    expect(AppContainer.resolve(TOKEN)).toBe("hello");
  });

  test("factory provider with deps", async () => {
    const TOKEN = new InjectionToken<string>("factory");
    await registerProvider({ provide: TOKEN, useValue: "dep" });
    await registerProvider({
      provide: Service,
      useFactory: (val: string) => {
        const svc = new Service();
        svc.onInit();
        svc.initialized = svc.initialized && val === "dep";
        return svc;
      },
      deps: [TOKEN],
    });
    const instance = AppContainer.resolve(Service);
    expect(instance.initialized).toBe(true);
  });

  test("existing provider", async () => {
    const TOKEN = new InjectionToken<string>("orig");
    await registerProvider({ provide: TOKEN, useValue: "base" });
    const ALIAS = new InjectionToken<string>("alias");
    await registerProvider({ provide: ALIAS, useExisting: TOKEN });
    expect(AppContainer.resolve(ALIAS)).toBe("base");
  });

  test("type guards", () => {
    const valProvider = { provide: Service, useValue: new Service() };
    expect(isValueProvider(valProvider)).toBe(true);
    expect(isClassProvider(valProvider)).toBe(false);
    expect(isFactoryProvider(valProvider)).toBe(false);
    expect(isExistingProvider(valProvider)).toBe(false);
    expect(isConstructorProvider(Service)).toBe(true);
  });
});
