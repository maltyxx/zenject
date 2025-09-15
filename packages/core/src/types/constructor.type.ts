/**
 * @module types
 * @description Type definitions used throughout the Zenject framework.
 */

/**
 * Represents a generic constructor type that accepts any parameters
 * Similar to NestJS approach for maximum flexibility
 * @template T The type of object created by the constructor
 */
export type Constructor<T = unknown> = {
  new (...args: never[]): T;
  prototype: T;
};
