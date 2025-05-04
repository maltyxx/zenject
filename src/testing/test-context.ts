import "reflect-metadata";
import type { DependencyContainer } from "tsyringe";
import { overrideInjectionContainerForTest } from "../decorators/injection-helpers";
import type { Constructor } from "../types/constructor.type";
import type { Token } from "../types/token.type";
import { Zenject } from "../zenject";
import { createTestingContainer } from "./testing";

type Override<T = unknown> = {
  provide: Token<T>;
  useValue: T;
};

type Provider<T = unknown> = Constructor<T> | Override;

type CreateTestContextOptions = {
  imports?: Constructor<unknown>[];
  providers?: Provider[];
  overrides?: Override[];
};

interface TestContext {
  container: DependencyContainer;
  resolve: <T>(token: Token<T>) => T;
  app?: Zenject;
}

/**
 * Creates a testing context with a container that can be used to resolve dependencies
 * 
 * @param opts Options for creating the test context
 * @returns A test context with container and resolve function
 * 
 * @example
 * // Test a service with mocks
 * const { resolve } = await createTestContext({
 *   providers: [AppService],
 *   overrides: [{ provide: LOGGER_LOGGER_TOKEN, useValue: loggerMock }],
 * });
 * 
 * const appService = resolve(AppService);
 * 
 * @example
 * // Test a module with overrides
 * const { resolve } = await createTestContext({
 *   imports: [LoggerModule],
 *   overrides: [{ provide: LOGGER_CONFIG_TOKEN, useValue: { level: "debug" } }],
 * });
 * 
 * const logger = resolve(LOGGER_LOGGER_TOKEN);
 */
export async function createTestContext(opts: CreateTestContextOptions): Promise<TestContext> {
  const container = createTestingContainer();
  let app: Zenject | undefined;

  // Register providers (services, overrides inline)
  for (const item of opts.providers ?? []) {
    if (typeof item === "object" && "provide" in item) {
      container.register(item.provide, { useValue: item.useValue });
    } else {
      container.register(item, { useClass: item });
      
      // Important: Override injection container for this class
      // This ensures decorators like @InjectLogger() use our test container
      overrideInjectionContainerForTest(item, container);
    }
  }

  // Register overrides explicitly
  for (const { provide, useValue } of opts.overrides ?? []) {
    container.register(provide, { useValue });
  }

  // Handle module imports - simplification comme suggéré
  if (opts.imports?.length) {
    for (const mod of opts.imports) {
      overrideInjectionContainerForTest(mod, container);
    }
    
    // Bootstrap le premier module comme racine (s'il existe, ce qu'on sait déjà par la condition)
    const rootModule = opts.imports[0] as Constructor<unknown>;
    app = new Zenject(rootModule);
    await app.bootstrap();
  }

  return {
    container,
    app,
    resolve: <T>(token: Token<T>): T => container.resolve(token),
  };
} 