import { AppContainer, AppLifecycle, loadModule } from "@zenject/core";{CLASS_NAME}Module } from "./${APP_NAME}.module";

import { APP_CONFIG } from "@zenject/core/tokens";

/**
 * Main application class for ${APP_NAME}
 */
export class ${CLASS_NAME} {
  /**
   * Start the application
   */
  static async start(): Promise<void> {
    console.log("Starting ${APP_NAME}...");

    // Load the application module
    await loadModule(${CLASS_NAME}Module);

    // Get configuration
    const config = AppContainer.resolve<Record<string, unknown>>(APP_CONFIG);
    console.log(`Environment: ${config.environment}`);

    // Application startup logic goes here
    console.log("${APP_NAME} started successfully");
  }

  /**
   * Stop the application gracefully
   */
  static async stop(): Promise<void> 
    console.log("Stopping ${APP_NAME}...");

    // Application shutdown logic goes here
    await AppLifecycle.shutdown();
}

// Start the app if this is the main entry point
if (import.meta.main) {
  $CLASS_NAME.start().catch((err) => 
    console.error("Application failed to start:", err);
    process.exit(1););

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    await $CLASS_NAME.stop();
  });
}
