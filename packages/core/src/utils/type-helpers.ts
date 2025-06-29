/**
 * Type helpers for Zenject
 */

import type { DependencyContainer } from "tsyringe";
import type { Token } from "../types/token.type";

/**
 * Get keys of T where value is of type V
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Check if a value is a token
 */
export function isToken<T>(value: unknown): value is Token<T> {
  return (
    value !== null &&
    value !== undefined &&
    (typeof value === "string" ||
      typeof value === "symbol" ||
      typeof value === "function" ||
      (typeof value === "object" && "description" in value))
  );
}

/**
 * Type safe resolver for DependencyContainer
 */
export function typedResolve<T>(
  container: DependencyContainer,
  token: Token<T>,
): T {
  return container.resolve(token) as T;
}

/**
 * Cast a container to expose the internal registry used by tsyringe.
 */
export interface RegistryContainer extends DependencyContainer {
  registry: {
    registrations: Map<unknown, unknown>;
    isResolved: (token: unknown) => boolean;
  };
}

export function withRegistry(
  container: DependencyContainer,
): RegistryContainer {
  return container as unknown as RegistryContainer;
}
