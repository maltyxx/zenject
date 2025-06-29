import { beforeEach, describe, expect, test } from "bun:test";
import { InjectionToken, Module } from "@zenject/core";
import { createTestContext } from "@zenject/testing";
import { createTestingContainer } from "../src/testing";

const TOKEN = new InjectionToken<string>("VALUE");
class Service {
  public constructor(public value: string) {}
}

describe("testing helpers", () => {
  beforeEach(() => {
    // nothing
  });

  test("createTestingContainer registers overrides", () => {
    const testContainer = createTestingContainer({ msg: "hello" });
    expect(testContainer.resolve("msg")).toBe("hello");
  });

  test("createTestContext bootstraps module with overrides", async () => {
    const { resolve } = await createTestContext({
      overrides: [{ provide: TOKEN, useValue: "mock" }],
    });
    expect(resolve(TOKEN)).toBe("mock");
  });
});
