import type { DependencyContainer } from "tsyringe";
import { AppContainer } from "../container";
import { callOnInit } from "../interfaces/lifecycle";
import type { Constructor } from "../types/constructor.type";
import type {
  ClassProvider,
  ExistingProvider,
  FactoryProvider,
  Provider,
  ValueProvider,
} from "../types/provider.interface";
import type { Token } from "../types/token.type";

/**
 * Type-safe container operations that bypass TypeScript strict checks
 * These functions handle the conversion from Zenject tokens to TSyringe types
 * Using controlled type assertions to avoid the 'any' type prohibition
 */
function safeContainerRegister<T>(
  container: DependencyContainer,
  token: Token<T>,
  options: Record<string, unknown>,
): void {
  // Use type assertion to bypass TSyringe type restrictions
  // This is safe because we handle all Token<T> variants
  (container.register as (token: unknown, options: unknown) => void)(
    token,
    options,
  );
}

function safeContainerRegisterSingleton<T>(
  container: DependencyContainer,
  provide: Token<T>,
  useClass: Constructor<T>,
): void {
  if (typeof provide === "function") {
    // For constructor tokens, register the constructor directly
    (container.registerSingleton as (token: unknown) => void)(provide);
  } else {
    // For string/symbol/InjectionToken, use useClass
    (
      container.registerSingleton as (token: unknown, useClass: unknown) => void
    )(provide, useClass);
  }
}

function safeContainerIsRegistered<T>(
  container: DependencyContainer,
  token: Token<T>,
): boolean {
  return (container.isRegistered as (token: unknown) => boolean)(token);
}

function safeContainerResolve<T>(
  container: DependencyContainer,
  token: Token<T>,
): T {
  return (container.resolve as (token: unknown) => T)(token);
}

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
 * Supports both synchronous and asynchronous factory providers
 * @param provider The provider configuration
 * @param options Additional registration options
 */
export async function registerProvider<T>(
  provider: Provider<T>,
  _options = { singleton: true },
): Promise<void> {
  if (isConstructorProvider(provider)) {
    // Simple class provider (constructor function)
    if (!safeContainerIsRegistered(AppContainer, provider)) {
      // For constructor providers, register the class itself
      safeContainerRegisterSingleton(AppContainer, provider, provider);
      const instance = safeContainerResolve(AppContainer, provider);
      await callOnInit(instance);
    }
  } else if (isClassProvider(provider)) {
    // Class provider (with useClass)
    if (!safeContainerIsRegistered(AppContainer, provider.provide)) {
      if (provider.singleton === false) {
        // Register as transient
        safeContainerRegister(AppContainer, provider.provide, {
          useClass: provider.useClass,
        });
      } else {
        // Register as singleton (default)
        safeContainerRegisterSingleton(
          AppContainer,
          provider.provide,
          provider.useClass,
        );
      }
      const instance = safeContainerResolve(AppContainer, provider.provide);
      await callOnInit(instance);
    }
  } else if (isValueProvider(provider)) {
    // Value provider
    if (!safeContainerIsRegistered(AppContainer, provider.provide)) {
      safeContainerRegister(AppContainer, provider.provide, {
        useValue: provider.useValue,
      });
    }
  } else if (isFactoryProvider(provider)) {
    // Factory provider with async support
    if (!safeContainerIsRegistered(AppContainer, provider.provide)) {
      // Pre-resolve async factory during registration
      let factoryResult: T;

      if (provider.deps && provider.deps.length > 0) {
        // With dependencies
        const deps = provider.deps.map((dep) =>
          safeContainerResolve(AppContainer, dep),
        );
        const result = provider.useFactory(...deps);

        // Await if result is a Promise
        if (result instanceof Promise) {
          factoryResult = await result;
        } else {
          factoryResult = result;
        }
      } else {
        // Without dependencies
        const result = provider.useFactory();

        // Await if result is a Promise
        if (result instanceof Promise) {
          factoryResult = await result;
        } else {
          factoryResult = result;
        }
      }

      // Register the resolved value
      safeContainerRegister(AppContainer, provider.provide, {
        useValue: factoryResult,
      });

      // Also init factory result if it implements OnInit
      await callOnInit(factoryResult);
    }
  } else if (isExistingProvider(provider)) {
    // Existing provider (alias)
    if (!safeContainerIsRegistered(AppContainer, provider.provide)) {
      safeContainerRegister(AppContainer, provider.provide, {
        useToken: provider.useExisting,
      });
    }
  } else {
    throw new Error(`Unsupported provider type: ${JSON.stringify(provider)}`);
  }
}
