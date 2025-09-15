import type { z } from "zod";

/**
 * Configuration definition for createConfig factory
 * Simple and elegant - only what's needed
 */
export interface ConfigDefinition<TSchema extends z.ZodTypeAny> {
  /**
   * Zod schema for validation and type inference
   */
  schema: TSchema;

  /**
   * Optional description for debugging and documentation
   */
  description?: string;

  /**
   * Optional business rules validation
   */
  rules?: (config: z.infer<TSchema>) => void | Promise<void>;

  /**
   * Optional transformation after validation
   */
  transform?: (config: z.infer<TSchema>) => unknown;

  /**
   * Optional environment variable overrides mapping
   * Maps config keys to environment variable names
   *
   * @example
   * envOverrides: {
   *   level: "LOGGER_LEVEL",                    // Single env var
   *   colorize: ["COLOR", "LOGGER_COLORIZE"]    // Multiple env vars (first found wins)
   * }
   */
  envOverrides?: Record<string, string | string[]>;
}
