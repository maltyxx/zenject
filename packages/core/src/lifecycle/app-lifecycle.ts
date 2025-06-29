import { AppContainer } from "../container";
import { getLoadedModules } from "../decorators/module";
import { callOnDestroy, isOnDestroy } from "../interfaces/lifecycle";
import type { Token } from "../types/token.type";

/**
 * Registry of instances registered with the lifecycle manager
 */
const managedInstances = new Set<unknown>();

/**
 * Lifecycle events for the application
 */
export enum LifecycleEvent {
  /** Called when application starts */
  STARTUP = "startup",

  /** Called before resources are closed */
  BEFORE_SHUTDOWN = "beforeShutdown",

  /** Called when application is shutting down */
  SHUTDOWN = "shutdown",

  /** Called after all resources are closed */
  AFTER_SHUTDOWN = "afterShutdown",
}

/**
 * Lifecycle event listener
 */
type LifecycleListener = (event: LifecycleEvent) => void | Promise<void>;

/**
 * Lifecycle manager for the application.
 * Helps coordinate graceful shutdown and initialization.
 */
export class AppLifecycle {
  private static isShuttingDown = false;
  private static exitHandlersRegistered = false;
  private static listeners = new Map<LifecycleEvent, Set<LifecycleListener>>();

  /**
   * Register an instance to be managed by the lifecycle
   * This ensures its onDestroy method will be called during shutdown
   *
   * @param instance The instance to register
   */
  public static register(instance: unknown): void {
    if (isOnDestroy(instance)) {
      managedInstances.add(instance);

      // Register exit handlers first time
      if (!AppLifecycle.exitHandlersRegistered) {
        AppLifecycle.registerExitHandlers();
        AppLifecycle.exitHandlersRegistered = true;
      }
    }
  }

  /**
   * Unregister an instance from the lifecycle
   *
   * @param instance The instance to unregister
   */
  public static unregister(instance: unknown): void {
    managedInstances.delete(instance);
  }

  /**
   * Add a listener for lifecycle events
   *
   * @param event The lifecycle event to listen for
   * @param listener The listener function
   */
  public static addEventListener(
    event: LifecycleEvent,
    listener: LifecycleListener,
  ): void {
    if (!AppLifecycle.listeners.has(event)) {
      AppLifecycle.listeners.set(event, new Set());
    }
    AppLifecycle.listeners.get(event)?.add(listener);
  }

  /**
   * Remove a listener for lifecycle events
   *
   * @param event The lifecycle event
   * @param listener The listener function to remove
   */
  public static removeEventListener(
    event: LifecycleEvent,
    listener: LifecycleListener,
  ): void {
    if (AppLifecycle.listeners.has(event)) {
      AppLifecycle.listeners.get(event)?.delete(listener);
    }
  }

  /**
   * Emit a lifecycle event
   *
   * @param event The lifecycle event to emit
   */
  private static async emitEvent(event: LifecycleEvent): Promise<void> {
    const listeners = AppLifecycle.listeners.get(event);
    if (!listeners) return;

    const promises: Promise<void>[] = [];

    for (const listener of listeners) {
      try {
        const result = listener(event);
        if (result instanceof Promise) {
          promises.push(result);
        }
      } catch (err) {
        console.error(`Error in lifecycle listener: ${err}`);
      }
    }

    await Promise.all(promises);
  }

  /**
   * Initiate a graceful shutdown of the application
   * Calls onDestroy on all registered instances
   *
   * @param exitCode Optional exit code (defaults to 0)
   * @returns Promise that resolves when shutdown is complete
   */
  public static async shutdown(exitCode = 0): Promise<void> {
    if (AppLifecycle.isShuttingDown) {
      return; // Already shutting down
    }

    AppLifecycle.isShuttingDown = true;
    console.log("Shutting down application...");

    // Emit before shutdown event
    await AppLifecycle.emitEvent(LifecycleEvent.BEFORE_SHUTDOWN);

    // Emit shutdown event
    await AppLifecycle.emitEvent(LifecycleEvent.SHUTDOWN);

    // Get all registered services from the container
    const containerWithRegistry = AppContainer as unknown as {
      registry: {
        registrations: Iterable<[Token<unknown>]>;
        isResolved(token: Token<unknown>): boolean;
      };
    };
    const registeredTokens = containerWithRegistry.registry.registrations;
    const allInstances = [];

    // Collect instances from container
    for (const [token] of registeredTokens) {
      try {
        // Only check already resolved instances to avoid creating new ones during shutdown
        if (
          AppContainer.isRegistered(token) &&
          containerWithRegistry.registry.isResolved(token)
        ) {
          const instance = AppContainer.resolve(token);
          if (isOnDestroy(instance)) {
            allInstances.push(instance);
          }
        }
      } catch (err) {
        console.error(`Error resolving instance during shutdown: ${err}`);
      }
    }

    // Add explicitly registered instances
    for (const instance of managedInstances) {
      if (!allInstances.includes(instance)) {
        allInstances.push(instance);
      }
    }

    // Call onDestroy on all instances
    const destroyPromises = allInstances.map((instance) => {
      try {
        return callOnDestroy(instance);
      } catch (err) {
        console.error(`Error destroying instance: ${err}`);
        return Promise.resolve();
      }
    });

    await Promise.all(destroyPromises);

    // Emit after shutdown event
    await AppLifecycle.emitEvent(LifecycleEvent.AFTER_SHUTDOWN);

    console.log("Application shutdown complete");

    // Exit in non-testing environments
    if (process.env.NODE_ENV !== "test") {
      process.exit(exitCode);
    }
  }

  /**
   * Register handlers for process exit events
   */
  private static registerExitHandlers(): void {
    // Handle SIGINT (Ctrl+C)
    process.on("SIGINT", () => {
      console.log("\nReceived SIGINT");
      AppLifecycle.shutdown(0).catch((err) => {
        console.error("Error during shutdown:", err);
        process.exit(1);
      });
    });

    // Handle SIGTERM (kill)
    process.on("SIGTERM", () => {
      console.log("\nReceived SIGTERM");
      AppLifecycle.shutdown(0).catch((err) => {
        console.error("Error during shutdown:", err);
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      console.error("Uncaught exception:", err);
      AppLifecycle.shutdown(1).catch((shutdownErr) => {
        console.error("Error during shutdown:", shutdownErr);
        process.exit(1);
      });
    });

    // Handle unhandled rejections
    process.on("unhandledRejection", (reason) => {
      console.error("Unhandled rejection:", reason);
      AppLifecycle.shutdown(1).catch((err) => {
        console.error("Error during shutdown:", err);
        process.exit(1);
      });
    });
  }

  /**
   * Get list of all modules that have been loaded
   *
   * @returns Array of module names
   */
  public static getLoadedModules(): string[] {
    return getLoadedModules();
  }
}
