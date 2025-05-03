import { container as rootContainer } from "tsyringe";
import { AppContainer } from "../container";
import { isOnInit } from "../interfaces/lifecycle";
import type { Constructor } from "../types/constructor.type";
import type { DynamicModule } from "../types/dynamic-module.interface";
import type { ModuleOptions } from "../types/module-options.interface";
import type { Provider } from "../types/provider.interface";
import { registerProvider } from "../utils/provider-registration";

/**
 * @module module
 * @description Provides module decorators and lazy loading functionality.
 */

/**
 * Function that initializes a module
 * @typedef {Function} ModuleInitializer
 */
type ModuleInitializer = () => void;

/**
 * Class metadata containing identifying information.
 * @interface ClassMetadata
 * @property {string} name - The name of the class
 */
interface ClassMetadata {
  name: string;
}

/**
 * Registry of modules with their initializers
 * @type {Map<string, ModuleInitializer>}
 */
const lazyModules = new Map<string, ModuleInitializer>();

/**
 * Registry of exported providers by module
 * @type {Map<string, Set<Provider>>}
 */
const moduleExports = new Map<string, Set<Provider>>();

/**
 * Module decorator that registers dependencies in the container.
 * This decorator enables dependency injection for the decorated class
 * and registers all providers specified in the options.
 * 
 * @param {ModuleOptions} [options={}] - Module configuration options
 * @returns {ClassDecorator} A class decorator function
 * 
 * @example
 * // Basic usage
 * @Module({
 *   providers: [UserService, AuthService]
 * })
 * export class UserModule {}
 * 
 * @example
 * // With imported modules
 * @Module({
 *   imports: [CommonModule, ConfigModule],
 *   providers: [UserService, AuthService]
 * })
 * export class AppModule {}
 */
export function Module(options: ModuleOptions = {}): ClassDecorator {
  const { providers = [], imports = [], exports: moduleExportsList = [] } = options;
  
  return (target: object) => {
    const targetClass = target as Constructor & ClassMetadata;
    
    // Store the exports for this module
    const exportsSet = new Set<Provider>(moduleExportsList);
    moduleExports.set(targetClass.name, exportsSet);
    
    lazyModules.set(targetClass.name, () => {
      // Initialize imported modules first
      for (const importedModule of imports) {
        const initImport = lazyModules.get(importedModule.name);
        initImport?.();
      }

      // Register all providers
      for (const provider of providers) {
        registerProvider(provider);
      }

      // Register the module itself
      if (!AppContainer.isRegistered(targetClass)) {
        AppContainer.register(targetClass, { useClass: targetClass });
      }
    });
  };
}

/**
 * Process a dynamic module configuration.
 * @param {DynamicModule} dynamicModule - The dynamic module configuration
 */
export function processDynamicModule(dynamicModule: DynamicModule): void {
  const { module, providers = [], imports = [], exports: moduleExportsList = [] } = dynamicModule;
  
  // Store the exports for this module
  const exportsSet = new Set<Provider>(moduleExportsList);
  moduleExports.set(module.name, exportsSet);
  
  // Create a module initializer
  const initializer = () => {
    // Initialize imported modules first
    for (const importedModule of imports) {
      if (typeof importedModule === 'function') {
        const initImport = lazyModules.get(importedModule.name);
        initImport?.();
      } else {
        // Process nested dynamic module
        processDynamicModule(importedModule);
      }
    }

    // Register all providers
    for (const provider of providers) {
      registerProvider(provider);
    }

    // Register the module itself
    if (!AppContainer.isRegistered(module)) {
      AppContainer.register(module, { useClass: module });
    }
  };
  
  // Store the initializer for lazy loading
  lazyModules.set(module.name, initializer);
}

/**
 * Loads and initializes a module.
 * This function triggers the initialization of the specified module
 * and all its imported dependencies recursively.
 * 
 * @template T Module type
 * @param {Constructor<T> & ClassMetadata | DynamicModule} module - The module class to load
 * @returns {void}
 * 
 * @example
 * // Manually loading a module
 * loadModule(AppModule);
 * 
 * @example
 * // Loading a dynamic module
 * loadModule(ConfigModule.forRoot({ apiKey: 'abc123' }));
 */
export function loadModule<T>(
  module: (Constructor<T> & ClassMetadata) | DynamicModule
): void {
  if (typeof module === 'function') {
    const initializer = lazyModules.get(module.name);
    initializer?.();
  } else {
    processDynamicModule(module);
    const initializer = lazyModules.get(module.module.name);
    initializer?.();
  }
}
