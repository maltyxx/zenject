import { AppContainer } from "../container";
import { callOnInit } from "../interfaces/lifecycle";
import type { Constructor } from "../types/constructor.type";
import type { DynamicModule } from "../types/dynamic-module.interface";
import type { ModuleOptions } from "../types/module-options.interface";
import type { Provider } from "../types/provider.interface";
import type { Token } from "../types/token.type";
import { registerProvider } from "../utils/provider-registration";

/**
 * @module module
 * @description Provides module decorators and lazy loading functionality.
 */

/**
 * Function that initializes a module
 * @typedef {Function} ModuleInitializer
 */
type ModuleInitializer = () => Promise<void>;

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
 * Registry of loaded modules to prevent duplicate initialization
 * @type {Set<string>}
 */
const loadedModules = new Set<string>();

/**
 * Registry of exported providers by module
 * @type {Map<string, Set<Provider>>}
 */
const moduleExports = new Map<string, Set<Provider>>();

/**
 * Helper function to register exported providers from imported modules
 * @param {string} importedModuleName - Name of the imported module
 */
async function registerExportedProviders(
  importedModuleName: string,
): Promise<void> {
  // Get the exports from the imported module
  const exportedProviders = moduleExports.get(importedModuleName);
  if (!exportedProviders || exportedProviders.size === 0) {
    return;
  }

  // Register each exported provider in the app container
  for (const provider of Array.from(exportedProviders)) {
    let token: Token;

    if (typeof provider === "function") {
      token = provider;
      if (!AppContainer.isRegistered(token)) {
        await registerProvider(provider);
      }
    } else if ("provide" in provider) {
      token = provider.provide;
      if (!AppContainer.isRegistered(token)) {
        await registerProvider(provider);
      } else {
        // Get the original provider instance and register an alias
        const existing = AppContainer.resolve(token);
        AppContainer.register(token, { useValue: existing });
      }
    }
  }
}

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
  const {
    providers = [],
    imports = [],
    exports: moduleExportsList = [],
  } = options;

  return (target: object) => {
    const targetClass = target as Constructor & ClassMetadata;

    // Store the exports for this module
    const exportsSet = new Set<Provider>(moduleExportsList);
    moduleExports.set(targetClass.name, exportsSet);

    lazyModules.set(targetClass.name, async () => {
      // Skip if already loaded
      if (loadedModules.has(targetClass.name)) {
        return;
      }

      // Initialize imported modules first
      const importPromises = imports.map(async (importedModule) => {
        if (typeof importedModule === "function") {
          const initImport = lazyModules.get(importedModule.name);
          if (initImport) {
            await initImport();
            // Register exported providers from imported module
            await registerExportedProviders(importedModule.name);
          }
        } else {
          // It's a DynamicModule
          const dynamicModule = importedModule as DynamicModule;
          processDynamicModule(dynamicModule);
          const initImport = lazyModules.get(dynamicModule.module.name);
          if (initImport) {
            await initImport();
            // Register exported providers from imported module
            await registerExportedProviders(dynamicModule.module.name);
          }
        }
      });

      await Promise.all(importPromises);

      // Register all providers
      for (const provider of providers) {
        await registerProvider(provider);
      }

      // Register the module itself
      if (!AppContainer.isRegistered(targetClass)) {
        AppContainer.registerSingleton(targetClass);
      }

      // Initialize the module instance if it implements OnInit
      const moduleInstance = AppContainer.resolve(targetClass);
      await callOnInit(moduleInstance);

      // Mark as loaded
      loadedModules.add(targetClass.name);
    });
  };
}

/**
 * Process a dynamic module configuration.
 * @param {DynamicModule} dynamicModule - The dynamic module configuration
 */
export function processDynamicModule(dynamicModule: DynamicModule): void {
  const {
    module,
    providers = [],
    imports = [],
    exports: moduleExportsList = [],
  } = dynamicModule;

  // Store the exports for this module
  const exportsSet = new Set<Provider>(moduleExportsList);
  moduleExports.set(module.name, exportsSet);

  // Create a module initializer
  const initializer = async () => {
    // Skip if already loaded
    if (loadedModules.has(module.name)) {
      return;
    }

    // Initialize imported modules first
    const importPromises = imports.map(async (importedModule) => {
      if (typeof importedModule === "function") {
        const initImport = lazyModules.get(importedModule.name);
        if (initImport) {
          await initImport();
          // Register exported providers from imported module
          await registerExportedProviders(importedModule.name);
        }
      } else {
        // Process nested dynamic module
        const nestedModule = importedModule as DynamicModule;
        processDynamicModule(nestedModule);
        const initImport = lazyModules.get(nestedModule.module.name);
        if (initImport) {
          await initImport();
          // Register exported providers from imported module
          await registerExportedProviders(nestedModule.module.name);
        }
      }
    });

    await Promise.all(importPromises);

    // Register all providers
    for (const provider of providers) {
      await registerProvider(provider);
    }

    // Register the module itself
    if (!AppContainer.isRegistered(module)) {
      AppContainer.registerSingleton(module);
    }

    // Initialize the module instance if it implements OnInit
    const moduleInstance = AppContainer.resolve(module);
    await callOnInit(moduleInstance);

    // Mark as loaded
    loadedModules.add(module.name);
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
 * @returns {Promise<void>} Promise that resolves when the module is loaded
 *
 * @example
 * // Manually loading a module
 * await loadModule(AppModule);
 *
 * @example
 * // Loading a dynamic module
 * await loadModule(ConfigModule.forRoot({ apiKey: 'abc123' }));
 */
export async function loadModule<T>(
  module: (Constructor<T> & ClassMetadata) | DynamicModule,
): Promise<void> {
  if (typeof module === "function") {
    const initializer = lazyModules.get(module.name);
    if (initializer) {
      await initializer();
    }
  } else {
    processDynamicModule(module);
    const initializer = lazyModules.get(module.module.name);
    if (initializer) {
      await initializer();
    }
  }
}

/**
 * Get all loaded modules
 *
 * @returns {string[]} Array of loaded module names
 */
export function getLoadedModules(): string[] {
  return Array.from(loadedModules);
}
