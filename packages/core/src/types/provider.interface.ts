import type { Constructor } from "./constructor.type";
import type { Token } from "./token.type";

/**
 * Provider definition for dependency injection.
 * Allows various ways to register services in the container.
 *
 * @interface Provider
 * @template T The type provided by this provider
 *
 * @example
 * // Class provider - standard way to register a service
 * const classProvider: ClassProvider<UserService> = {
 *   provide: UserService,
 *   useClass: UserServiceImpl
 * };
 *
 * // Value provider - register a static value
 * const valueProvider: ValueProvider<string> = {
 *   provide: 'API_KEY',
 *   useValue: 'abc123'
 * };
 *
 * // Factory provider - create instances with custom logic (sync or async)
 * const factoryProvider: FactoryProvider<DbConnection> = {
 *   provide: DbConnection,
 *   useFactory: async (config) => {
 *     const connection = await createConnection(config.url);
 *     return connection;
 *   },
 *   deps: ['DB_CONFIG']
 * };
 */

/**
 * Provider that maps a token to a concrete class.
 */
export interface ClassProvider<T = unknown> {
  /** Token that identifies the dependency */
  provide: Token<T>;
  /** Class to instantiate for the token */
  useClass: Constructor<T>;
  /** Whether to create a new instance each time this token is requested */
  singleton?: boolean;
}

/**
 * Provider that maps a token to a static value.
 */
export interface ValueProvider<T = unknown> {
  /** Token that identifies the dependency */
  provide: Token<T>;
  /** Value to use for the token */
  useValue: T;
}

/**
 * Provider that maps a token to a factory function.
 * Supports both synchronous and asynchronous factories (like NestJS).
 */
export interface FactoryProvider<T = unknown> {
  /** Token that identifies the dependency */
  provide: Token<T>;
  /** Factory function to call for creating the dependency (sync or async) */
  useFactory: (...args: unknown[]) => T | Promise<T>;
  /** Optional list of dependencies for the factory */
  deps?: Token<unknown>[];
}

/**
 * Provider that maps a token to an existing token.
 */
export interface ExistingProvider<T = unknown> {
  /** Token that identifies the dependency */
  provide: Token<T>;
  /** Existing token to use */
  useExisting: Token<T>;
}

/**
 * Union type of all provider types - flexible like NestJS
 */
export type Provider<T = unknown> =
  | Constructor<T>
  | ClassProvider<T>
  | ValueProvider<T>
  | FactoryProvider<T>
  | ExistingProvider<T>;
