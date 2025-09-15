/**
 * @module zenject
 * @description A lightweight dependency injection framework inspired by Angular's DI system
 */
import { inject } from "tsyringe";
import type { InjectionToken } from "./tokens/injection-token.js";

export {
  container,
  type DependencyContainer,
  injectable as Injectable,
  singleton as Singleton,
} from "tsyringe";

export function Inject<T>(
  token: InjectionToken<T> | string | symbol,
): ParameterDecorator {
  return inject(token as never);
}

export * from "./container.js";
export * from "./decorators/injection-helpers.js";
export * from "./decorators/module.js";
export * from "./interfaces/lifecycle.js";
export * from "./interfaces/plugin.interface.js";
// Lifecycle
export * from "./lifecycle/app-lifecycle.js";
// Plugins
export * from "./plugins/plugin-manager.js";
export * from "./tokens/common-tokens.js";
// Tokens
export * from "./tokens/injection-token.js";
export * from "./types/constructor.type.js";
export * from "./types/dynamic-module.interface.js";
export * from "./types/module-options.interface.js";
export * from "./types/provider.interface.js";

// Export all interfaces and types for better developer experience
export * from "./types/scope.enum.js";
export * from "./types/token.type.js";
export * from "./utils/type-helpers.js";
// Core
export * from "./zenject.js";
