import { container } from "tsyringe";
import type { DependencyContainer } from "tsyringe";
// Import actual DependencyContainer implementation
import { container as containerImpl } from "tsyringe";

/**
 * @module container
 * @description Provides centralized dependency injection container for the application.
 */

/**
 * Centralized DI container used across all Zenject modules and apps.
 * @type {import("tsyringe").DependencyContainer}
 * @exports AppContainer
 * @example
 * // Register a service
 * AppContainer.register(MyService, { useClass: MyServiceImpl });
 *
 * // Resolve a service
 * const service = AppContainer.resolve(MyService);
 */
export const AppContainer = container;

/**
 * Create a scoped container which inherits from the root container.
 * Useful for request-scoped or job-scoped services.
 *
 * @returns {DependencyContainer} A new container that inherits from the root
 * @example
 * // Create a request scoped container
 * const requestScope = createScope();
 *
 * // Register a request-scoped service
 * requestScope.register(RequestContext, { useClass: RequestContext });
 *
 * // Resolve from the scope (falls back to root if not found)
 * const service = requestScope.resolve(MyService);
 */
export function createScope(): DependencyContainer {
  return container.createChildContainer();
}

/**
 * Create an isolated container with no parent.
 * Useful for testing or running isolated components.
 *
 * @returns {DependencyContainer} A new isolated container
 * @example
 * // Create an isolated container for testing
 * const testContainer = createIsolatedContainer();
 *
 * // Register test mocks
 * testContainer.register(DataService, { useClass: MockDataService });
 */
export function createIsolatedContainer(): DependencyContainer {
  // Create a fresh container instance (of the same type as the root container)
  const containerClass = Object.getPrototypeOf(containerImpl).constructor;
  return new containerClass();
}
