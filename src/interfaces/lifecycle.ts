/**
 * @module lifecycle
 * @description Provides lifecycle interfaces and type guards for component initialization and cleanup.
 */

/**
 * Interface for components that need initialization after construction.
 * @interface OnInit
 */
export interface OnInit {
  /**
   * Called after the component is constructed and all dependencies are injected.
   * Can be synchronous or return a Promise for async initialization.
   * @returns {void | Promise<void>}
   */
  onInit(): void | Promise<void>;
}

/**
 * Interface for components that need cleanup before destruction.
 * @interface OnDestroy
 */
export interface OnDestroy {
  /**
   * Called before the component is destroyed.
   * Can be synchronous or return a Promise for async cleanup.
   * @returns {void | Promise<void>}
   */
  onDestroy(): void | Promise<void>;
}

/**
 * Type guard to check if an object implements the OnInit interface.
 * @param {unknown} obj - Object to check
 * @returns {boolean} True if the object implements OnInit
 */
export function isOnInit(obj: unknown): obj is OnInit {
  return (
    obj !== null &&
    obj !== undefined &&
    typeof (obj as Record<string, unknown>).onInit === "function"
  );
}

/**
 * Type guard to check if an object implements the OnDestroy interface.
 * @param {unknown} obj - Object to check
 * @returns {boolean} True if the object implements OnDestroy
 */
export function isOnDestroy(obj: unknown): obj is OnDestroy {
  return (
    obj !== null &&
    obj !== undefined &&
    typeof (obj as Record<string, unknown>).onDestroy === "function"
  );
}

/**
 * Helper to call onInit method and handle Promise if returned.
 * @param instance The instance to initialize
 * @returns A promise that resolves when initialization is complete
 */
export async function callOnInit(instance: unknown): Promise<void> {
  if (isOnInit(instance)) {
    const result = instance.onInit();
    if (result instanceof Promise) {
      await result;
    }
  }
}

/**
 * Helper to call onDestroy method and handle Promise if returned.
 * @param instance The instance to destroy
 * @returns A promise that resolves when cleanup is complete
 */
export async function callOnDestroy(instance: unknown): Promise<void> {
  if (isOnDestroy(instance)) {
    const result = instance.onDestroy();
    if (result instanceof Promise) {
      await result;
    }
  }
}
