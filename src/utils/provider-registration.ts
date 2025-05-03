import { AppContainer } from "../container";
import { isOnInit } from "../interfaces/lifecycle";
import type { Provider, ClassProvider, ValueProvider, FactoryProvider, ExistingProvider } from "../types/provider.interface";

/**
 * Helper to check if a provider is a class provider
 */
export function isClassProvider<T>(provider: Provider<T>): provider is ClassProvider<T> {
  return (provider as ClassProvider<T>).useClass !== undefined;
}

/**
 * Helper to check if a provider is a value provider
 */
export function isValueProvider<T>(provider: Provider<T>): provider is ValueProvider<T> {
  return (provider as ValueProvider<T>).useValue !== undefined;
}

/**
 * Helper to check if a provider is a factory provider
 */
export function isFactoryProvider<T>(provider: Provider<T>): provider is FactoryProvider<T> {
  return (provider as FactoryProvider<T>).useFactory !== undefined;
}

/**
 * Helper to check if a provider is an existing provider
 */
export function isExistingProvider<T>(provider: Provider<T>): provider is ExistingProvider<T> {
  return (provider as ExistingProvider<T>).useExisting !== undefined;
}

/**
 * Helper to check if a provider is a constructor (class)
 */
export function isConstructorProvider<T>(provider: Provider<T>): provider is new (...args: any[]) => T {
  return typeof provider === 'function';
}

/**
 * Register a provider in the dependency container
 * @param provider The provider configuration
 */
export function registerProvider<T>(provider: Provider<T>): void {
  if (isConstructorProvider(provider)) {
    // Simple class provider (constructor function)
    if (!AppContainer.isRegistered(provider)) {
      AppContainer.register(provider, { useClass: provider });
      const instance = AppContainer.resolve(provider);
      if (isOnInit(instance)) {
        instance.onInit?.();
      }
    }
  } else if (isClassProvider(provider)) {
    // Class provider (with useClass)
    if (!AppContainer.isRegistered(provider.provide)) {
      AppContainer.register(
        provider.provide,
        { useClass: provider.useClass },
        { singleton: provider.singleton !== false }
      );
      const instance = AppContainer.resolve(provider.provide);
      if (isOnInit(instance)) {
        instance.onInit?.();
      }
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
        // With dependencies
        AppContainer.register(provider.provide, {
          useFactory: (dependencyContainer) => {
            const deps = provider.deps?.map(dep => dependencyContainer.resolve(dep)) || [];
            return provider.useFactory(...deps);
          }
        });
      } else {
        // Without dependencies
        AppContainer.register(provider.provide, {
          useFactory: () => provider.useFactory()
        });
      }
    }
  } else if (isExistingProvider(provider)) {
    // Existing provider (alias)
    if (!AppContainer.isRegistered(provider.provide)) {
      AppContainer.register(provider.provide, { useToken: provider.useExisting });
    }
  } else {
    throw new Error(`Unsupported provider type: ${JSON.stringify(provider)}`);
  }
} 