/**
 * @module zenject
 * @description A lightweight dependency injection framework inspired by Angular's DI system
 */

// Core
export * from "./zenject";
export * from "./container";
export * from "./decorators/module";
export * from "./decorators/injection-helpers";
export * from "./interfaces/lifecycle";
export * from "./types/constructor.type";
export * from "./types/module-options.interface";
export * from "./types/dynamic-module.interface";
export * from "./types/provider.interface";
export * from "./types/token.type";

// Lifecycle
export * from "./lifecycle/app-lifecycle";

// Plugins
export * from "./plugins/plugin-manager";

// Tokens
export * from "./tokens/injection-token";
export * from "./tokens/common-tokens";

// Export all interfaces and types for better developer experience
export * from "./types/scope.enum";
export * from "./interfaces/plugin.interface";
export * from "./utils/type-helpers";

// Re-export injectable decorator from tsyringe for convenience
export {
  injectable,
  inject,
  singleton,
  type DependencyContainer,
  container,
} from "tsyringe";
