import { injectable } from "tsyringe";
import { Module } from "../decorators/module";
import { InjectionToken } from "../tokens/injection-token";
import type { DynamicModule } from "../types/dynamic-module.interface";
import { OnInit } from "../interfaces/lifecycle";

/**
 * Configuration options for the ConfigModule
 */
export interface ConfigOptions {
  /**
   * Environment to load configuration for
   * @default 'development'
   */
  env?: string;

  /**
   * Path to configuration file
   * @default '.env'
   */
  path?: string;

  /**
   * Extra configuration values
   */
  values?: Record<string, unknown>;
}

/**
 * Token for injecting ConfigOptions
 */
export const CONFIG_OPTIONS = new InjectionToken<ConfigOptions>(
  "CONFIG_OPTIONS",
);

/**
 * Service that provides access to application configuration
 */
@injectable()
export class ConfigService implements OnInit {
  private config: Record<string, unknown> = {};

  constructor() {}

  /**
   * Initialize configuration from options and environment
   */
  async onInit(): Promise<void> {
    // Load from Bun.env automatically
    this.config = { ...Bun.env };

    console.log(
      `ConfigService initialized with ${Object.keys(this.config).length} values`,
    );
  }

  /**
   * Get a configuration value
   *
   * @param key The configuration key
   * @param defaultValue Optional default value if key doesn't exist
   * @returns The configuration value or default value
   */
  get<T>(key: string, defaultValue?: T): T {
    return (this.config[key] as T) ?? (defaultValue as T);
  }

  /**
   * Check if a configuration key exists
   *
   * @param key The configuration key
   * @returns True if the key exists
   */
  has(key: string): boolean {
    return key in this.config;
  }

  /**
   * Set a configuration value
   *
   * @param key The configuration key
   * @param value The value to set
   */
  set<T>(key: string, value: T): void {
    this.config[key] = value;
  }
}

/**
 * Module that provides application configuration
 */
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {
  /**
   * Create a dynamic configuration of the ConfigModule
   *
   * @param options Configuration options
   * @returns A dynamic module configuration
   *
   * @example
   * // In app.module.ts
   * @Module({
   *   imports: [
   *     ConfigModule.forRoot({
   *       env: 'production',
   *       values: { API_URL: 'https://api.example.com' }
   *     })
   *   ]
   * })
   * export class AppModule {}
   */
  static forRoot(options: ConfigOptions = {}): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            env: options.env || "development",
            path: options.path || ".env",
            values: options.values || {},
          },
        },
        ConfigService,
      ],
      exports: [ConfigService, CONFIG_OPTIONS],
    };
  }
}
