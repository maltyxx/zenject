import type { InjectionToken } from "../tokens/injection-token";
import type { Constructor } from "./constructor.type";

/**
 * Represents a token that can be used for dependency injection.
 * A token can be either a constructor (class reference), string identifier, symbol, or InjectionToken.
 *
 * @typedef {Constructor<T> | string | symbol | InjectionToken<T>} Token
 * @template T The type associated with this token
 *
 * @example
 * // Using a class as a token
 * const userServiceToken: Token<UserService> = UserService;
 *
 * // Using a string as a token
 * const apiKeyToken: Token<string> = 'API_KEY';
 *
 * // Using a symbol as a token
 * const configToken: Token<AppConfig> = Symbol('APP_CONFIG');
 *
 * // Using an InjectionToken as a token
 * const configToken: Token<AppConfig> = new InjectionToken<AppConfig>('APP_CONFIG');
 */
export type Token<T = unknown> =
  | Constructor<T>
  | string
  | symbol
  | InjectionToken<T>;
