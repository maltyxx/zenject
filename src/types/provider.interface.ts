import type { Constructor } from './constructor.type';
import type { Token } from './token.type';

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
 * // Factory provider - create instances with custom logic
 * const factoryProvider: FactoryProvider<DbConnection> = {
 *   provide: DbConnection,
 *   useFactory: (config) => new DbConnection(config.url),
 *   deps: ['DB_CONFIG']
 * };
 */

/**
 * Provider that maps a token to a concrete class.
 */
export interface ClassProvider<T = any> {
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
export interface ValueProvider<T = any> {
  /** Token that identifies the dependency */
  provide: Token<T>;
  /** Value to use for the token */
  useValue: T;
}

/**
 * Provider that maps a token to a factory function.
 */
export interface FactoryProvider<T = any> {
  /** Token that identifies the dependency */
  provide: Token<T>;
  /** Factory function to call for creating the dependency */
  useFactory: (...args: any[]) => T;
  /** Optional list of dependencies for the factory */
  deps?: Token<any>[];
}

/**
 * Provider that maps a token to an existing token.
 */
export interface ExistingProvider<T = any> {
  /** Token that identifies the dependency */
  provide: Token<T>;
  /** Existing token to use */
  useExisting: Token<T>;
}

/**
 * Union type of all provider types.
 */
export type Provider<T = any> = 
  | Constructor<T>
  | ClassProvider<T> 
  | ValueProvider<T> 
  | FactoryProvider<T>
  | ExistingProvider<T>; 