/**
 * @module types
 * @description Type definitions used throughout the Zenject framework.
 */

/**
 * Represents a generic constructor type.
 * @template T The type of object created by the constructor
 * @typedef {Function} Constructor
 * @example
 * // Using Constructor as a type parameter
 * function createInstance<T>(ctor: Constructor<T>): T {
 *   return new ctor();
 * }
 *
 * // Using Constructor as a variable type
 * const userClass: Constructor<User> = User;
 */
export type Constructor<T = unknown> = new (...args: unknown[]) => T;
