import "reflect-metadata";
import type { DependencyContainer } from "tsyringe";
import { AppContainer } from "../container";
import type { Constructor } from "../types/constructor.type";
import type { Token } from "../types/token.type";

export const INJECTION_CONTAINER_KEY = "__zenject_injection_container__";

/**
 * Gets the container to use for dependency resolution.
 * This will return a custom container if set via overrideInjectionContainerForTest,
 * otherwise it will return the global AppContainer.
 *
 * @param targetClass The class to get the container for
 * @returns The dependency container to use
 */
export function getInjectionContainer(
  targetClass: Constructor<unknown>,
): DependencyContainer {
  const customContainer = Reflect.getMetadata(
    INJECTION_CONTAINER_KEY,
    targetClass,
  ) as DependencyContainer | undefined;

  return customContainer || AppContainer;
}

/**
 * Override the injection container for tests.
 * This allows testing services with injected dependencies without modifying the global AppContainer.
 *
 * @param targetClass The class containing the dependency injection decorators
 * @param container The custom container to use for resolution
 */
export function overrideInjectionContainerForTest(
  targetClass: Constructor<unknown>,
  container: DependencyContainer,
): void {
  Reflect.defineMetadata(INJECTION_CONTAINER_KEY, container, targetClass);
}

/**
 * Creates a property decorator that injects a dependency using the appropriate container.
 * This is useful for creating custom injection decorators.
 *
 * @param token The dependency token to inject
 * @param configureValue Optional function to configure the resolved value
 * @returns A property decorator that injects the dependency
 */
export function createInjectionDecorator<T, R = T>(
  token: Token<T>,
  configureValue?: (value: T, target: object, context?: string) => R,
): PropertyDecorator {
  return (target, propertyKey) => {
    const ctx = target.constructor.name;

    Object.defineProperty(target, propertyKey, {
      get() {
        // Use the cache if available
        if (!this.__injectionCache) {
          this.__injectionCache = {};
        }

        const cacheKey = String(propertyKey);
        if (!this.__injectionCache[cacheKey]) {
          // Get the appropriate container
          const container = getInjectionContainer(
            target.constructor as unknown as Constructor<unknown>,
          );

          // Resolve the dependency
          const value = container.resolve<T>(token);

          // Configure the value if needed
          this.__injectionCache[cacheKey] = configureValue
            ? configureValue(value, this, ctx)
            : value;
        }

        return this.__injectionCache[cacheKey];
      },
      enumerable: false,
      configurable: false,
    });
  };
}
