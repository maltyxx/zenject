import type { InjectionToken } from "@zenject/core";
import type { z } from "zod";

/**
 * Complete configuration result with utilities
 * Returned by createConfig() factory
 */
export interface ConfigResult<TSchema extends z.ZodTypeAny = z.ZodTypeAny> {
  /**
   * Injection token for elegant dependency injection
   * Use with @Inject(config.KEY)
   */
  readonly KEY: InjectionToken<z.infer<TSchema>>;

  /**
   * Configuration namespace for organization
   */
  readonly namespace: string;

  /**
   * Zod schema for validation
   */
  readonly schema: TSchema;

  /**
   * Description for debugging
   */
  readonly description: string;

  /**
   * Optional business rules validation
   */
  readonly rules?: (config: z.infer<TSchema>) => void | Promise<void>;

  /**
   * Optional transformation after validation
   */
  readonly transform?: (config: z.infer<TSchema>) => unknown;

  /**
   * Optional environment variable overrides mapping
   */
  readonly envOverrides?: Record<string, string | string[]>;

  /**
   * Get default values from schema
   */
  getDefaults(): z.infer<TSchema>;

  /**
   * Validate and parse configuration data
   */
  validateConfig(data: unknown): z.infer<TSchema>;

  /**
   * Get example configuration
   */
  getExample(): z.infer<TSchema>;
}

/**
 * Type helper to extract configuration type from ConfigResult
 * Use: ConfigType<typeof myConfig>
 */
export type ConfigType<T> = T extends ConfigResult<infer TSchema>
  ? z.infer<TSchema>
  : never;
