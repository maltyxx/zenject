import { beforeEach, describe, expect, test } from "bun:test";
import { AppContainer, Module, Zenject } from "@zenject/core";

class Service {}

@Module({ providers: [Service] })
class Root {}

describe("Zenject", () => {
  beforeEach(() => {
    AppContainer.reset();
  });

  test("bootstrap and resolve", async () => {
    const app = new Zenject(Root);
    await app.bootstrap();
    const service = app.resolve(Service);
    expect(service).toBeInstanceOf(Service);
    expect(app.container).toBe(AppContainer);
  });

  test("resolve before bootstrap throws", () => {
    const app = new Zenject(Root);
    expect(() => app.resolve(Service)).toThrow();
    expect(() => app.container).toThrow();
  });
});
