import { AppContainer } from "../container";
import { callOnInit } from "../interfaces/lifecycle";
import type {
  Provider,
  ClassProvider,
  ValueProvider,
  FactoryProvider,
  ExistingProvider,
} from "../types/provider.interface";

/**
 * Helper to check if a provider is a class provider
 */
export function isClassProvider<T>(
  provider: Provider<T>,
): provider is ClassProvider<T> {
  return (provider as ClassProvider<T>).useClass !== undefined;
}

/**
 * Helper to check if a provider is a value provider
 */
export function isValueProvider<T>(
  provider: Provider<T>,
): provider is ValueProvider<T> {
  return (provider as ValueProvider<T>).useValue !== undefined;
}

/**
 * Helper to check if a provider is a factory provider
 */
export function isFactoryProvider<T>(
  provider: Provider<T>,
): provider is FactoryProvider<T> {
  return (provider as FactoryProvider<T>).useFactory !== undefined;
}

/**
 * Helper to check if a provider is an existing provider
 */
export function isExistingProvider<T>(
  provider: Provider<T>,
): provider is ExistingProvider<T> {
  return (provider as ExistingProvider<T>).useExisting !== undefined;
}

/**
 * Helper to check if a provider is a constructor (class)
 */
export function isConstructorProvider<T>(
  provider: Provider<T>,
): provider is new (
  ...args: unknown[]
) => T {
  return typeof provider === "function";
}

/**
 * Register a provider in the dependency container
 * @param provider The provider configuration
 * @param options Additional registration options
 */
export async function registerProvider<T>(
  provider: Provider<T>,
  options = { singleton: true },
): Promise<void> {
  if (isConstructorProvider(provider)) {
    // Simple class provider (constructor function)
    if (!AppContainer.isRegistered(provider)) {
      // For constructor providers, register the class itself
      AppContainer.registerSingleton(provider);
      const instance = AppContainer.resolve(provider);
      await callOnInit(instance);
    }
  } else if (isClassProvider(provider)) {
    // Class provider (with useClass)
    if (!AppContainer.isRegistered(provider.provide)) {
      if (provider.singleton === false) {
        // Register as transient
        AppContainer.register(provider.provide, {
          useClass: provider.useClass,
        });
      } else {
        // Register as singleton (default)
        AppContainer.registerSingleton(provider.provide, provider.useClass);
      }
      const instance = AppContainer.resolve(provider.provide);
      await callOnInit(instance);
    }
  } else if (isValueProvider(provider)) {
    // Value provider
    if (!AppContainer.isRegistered(provider.provide)) {
      AppContainer.register(provider.provide, { useValue: provider.useValue });
    }
  } else if (isFactoryProvider(provider)) {
    // Factory provider
    if (!AppContainer.isRegistered(provider.provide)) {
      if (provider.deps && provider.deps.length > 0) {
        // With dependencies - simplified approach
        AppContainer.register(provider.provide, {
          useFactory: (container) =>
            provider.useFactory(
              ...(provider.deps || []).map((dep) => container.resolve(dep)),
            ),
        });
      } else {
        // Without dependencies
        AppContainer.register(provider.provide, {
          useFactory: () => provider.useFactory(),
        });
      }

      // Also init factory result if it implements OnInit
      const instance = AppContainer.resolve(provider.provide);
      await callOnInit(instance);
    }
  } else if (isExistingProvider(provider)) {
    // Existing provider (alias)
    if (!AppContainer.isRegistered(provider.provide)) {
      AppContainer.register(provider.provide, {
        useToken: provider.useExisting,
      });
    }
  } else {
    throw new Error(`Unsupported provider type: ${JSON.stringify(provider)}`);
  }
}
