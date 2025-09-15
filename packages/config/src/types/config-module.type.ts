import type { ConfigResult } from "./config-result.type.js";

/**
 * Options for ConfigModule.forRoot()
 * Simple configuration for the root module
 */
export interface ConfigModuleOptions {
  /**
   * Enable environment variable overrides
   * Default: true
   */
  enableEnvOverrides?: boolean;

  /**
   * Configuration definitions to load
   * Use with createConfig() results
   */
  load?: Array<{ [K in keyof ConfigResult]: ConfigResult[K] }>;

  /**
   * Custom environment variable prefix
   * Default: "APP"
   */
  envPrefix?: string;

  /**
   * Path to YAML configuration file
   * Default: "config/settings.yaml"
   */
  filePath?: string;
}
