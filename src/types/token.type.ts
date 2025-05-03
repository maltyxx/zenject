import type { Constructor } from './constructor.type';

/**
 * Represents a token that can be used for dependency injection.
 * A token can be either a constructor (class reference) or a string identifier.
 * 
 * @typedef {Constructor<T> | string | symbol} Token
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
 */
export type Token<T = unknown> = Constructor<T> | string | symbol; 