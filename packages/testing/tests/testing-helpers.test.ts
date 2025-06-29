import { beforeEach, describe, expect, test } from "bun:test";
import { InjectionToken, Module, type Token } from "@zenject/core";
import { createTestContext } from "@zenject/testing";
import { createTestingContainer } from "../src/testing";

const TOKEN = new InjectionToken<string>("VALUE") as unknown as Token<string>;
class Service {
  public constructor(public value: string) {}
}

describe("testing helpers", () => {
  beforeEach(() => {
    // nothing
  });

  test("createTestingContainer registers overrides", () => {
    const testContainer = createTestingContainer({ msg: "hello" });
    expect(testContainer.resolve<string>("msg")).toBe("hello");
  });

  test("createTestContext bootstraps module with overrides", async () => {
    const { resolve } = await createTestContext({
      overrides: [
        { provide: TOKEN, useValue: "mock" } as {
          provide: Token<string>;
          useValue: string;
        },
      ],
    });
    expect(resolve(TOKEN)).toBe("mock");
  });
});
