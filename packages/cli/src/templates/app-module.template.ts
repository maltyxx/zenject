import { Module, APP_CONFIG } from "@zenject/core";
import { appConfig } from "./config";

/**
 * Main module for the ${APP_NAME} application
 */
@Module({
  imports: [
    // Add your modules here
  ],
  providers: [
    // Register the app configuration
    { provide: APP_CONFIG, useValue: appConfig },

    // Add your global services here
  ],
  exports: [
    // Export services for external use
  ],
})
export class $ {
  CLASS_NAME;
}
{
}
