import { AppContainer } from "../container";
import { callOnDestroy, isOnDestroy } from "../interfaces/lifecycle";

/**
 * Registry of instances registered with the lifecycle manager
 */
const managedInstances = new Set<unknown>();

/**
 * Lifecycle manager for the application.
 * Helps coordinate graceful shutdown and initialization.
 */
export class AppLifecycle {
  private static isShuttingDown = false;
  private static exitHandlersRegistered = false;
  
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
      if (!this.exitHandlersRegistered) {
        this.registerExitHandlers();
        this.exitHandlersRegistered = true;
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
   * Initiate a graceful shutdown of the application
   * Calls onDestroy on all registered instances
   * 
   * @param exitCode Optional exit code (defaults to 0)
   * @returns Promise that resolves when shutdown is complete
   */
  public static async shutdown(exitCode = 0): Promise<void> {
    if (this.isShuttingDown) {
      return; // Already shutting down
    }
    
    this.isShuttingDown = true;
    console.log('Shutting down application...');
    
    // Get all registered services from the container
    const registeredTokens = AppContainer.registry.registrations;
    const allInstances = [];
    
    // Collect instances from container
    for (const [token] of registeredTokens) {
      try {
        // Only check already resolved instances to avoid creating new ones during shutdown
        if (AppContainer.isRegistered(token) && AppContainer.registry.isResolved(token)) {
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
    const destroyPromises = allInstances.map(instance => {
      try {
        return callOnDestroy(instance);
      } catch (err) {
        console.error(`Error destroying instance: ${err}`);
        return Promise.resolve();
      }
    });
    
    await Promise.all(destroyPromises);
    console.log('Application shutdown complete');
    
    // Exit in non-testing environments
    if (process.env.NODE_ENV !== 'test') {
      process.exit(exitCode);
    }
  }
  
  /**
   * Register handlers for process exit events
   */
  private static registerExitHandlers(): void {
    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      console.log('\nReceived SIGINT');
      this.shutdown(0).catch(err => {
        console.error('Error during shutdown:', err);
        process.exit(1);
      });
    });
    
    // Handle SIGTERM (kill)
    process.on('SIGTERM', () => {
      console.log('\nReceived SIGTERM');
      this.shutdown(0).catch(err => {
        console.error('Error during shutdown:', err);
        process.exit(1);
      });
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('Uncaught exception:', err);
      this.shutdown(1).catch(shutdownErr => {
        console.error('Error during shutdown:', shutdownErr);
        process.exit(1);
      });
    });
    
    // Handle unhandled rejections
    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled rejection:', reason);
      this.shutdown(1).catch(err => {
        console.error('Error during shutdown:', err);
        process.exit(1);
      });
    });
  }
} 