import { describe, expect, test } from "bun:test";
import { InjectionToken } from "@zenject/core";
import { Scope } from "@zenject/core";

describe("InjectionToken", () => {
  test("toString outputs description", () => {
    const token = new InjectionToken("MY_TOKEN");
    expect(token.toString()).toBe("InjectionToken[MY_TOKEN]");
  });

  test("scope via options", () => {
    const token = new InjectionToken({
      description: "SCOPED",
      scope: Scope.REQUEST,
    });
    expect(token.scope).toBe(Scope.REQUEST);
  });
});
