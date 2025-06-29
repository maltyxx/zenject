import { describe, expect, test } from "bun:test";
import { InjectionToken } from "@zenject/core";
import { container } from "tsyringe";
import { isToken, typedResolve } from "../src/utils/type-helpers";

class MyService {
  public value = 1;
}

describe("isToken", () => {
  test("identifies valid tokens", () => {
    expect(isToken("str")).toBe(true);
    expect(isToken(Symbol("sym"))).toBe(true);
    expect(isToken(MyService)).toBe(true);
    const tok = new InjectionToken("TOK");
    expect(isToken(tok)).toBe(true);
  });

  test("returns false for invalid tokens", () => {
    expect(isToken(null)).toBe(false);
    expect(isToken({})).toBe(false);
  });
});

describe("typedResolve", () => {
  test("resolves token with correct type", () => {
    const child = container.createChildContainer();
    child.register(MyService, { useClass: MyService });
    const svc = typedResolve(child, MyService);
    expect(svc).toBeInstanceOf(MyService);
    expect(svc.value).toBe(1);
  });
});
