import { Injectable } from "@zenject/core";
import type { z } from "zod";
import type { ConfigResult } from "../types/config-result.type.js";
import { EnvironmentService } from "./environment.service.js";
import { YamlService } from "./yaml.service.js";

/**
 * Configuration Service - Main orchestrator for YAML loading and environment overrides
 */
@Injectable()
export class ConfigService {
  public constructor(
    private readonly yamlService: YamlService,
    private readonly environmentService: EnvironmentService,
  ) {}

  public async loadConfig<T extends z.ZodTypeAny>(
    configDef: ConfigResult<T>,
    options: ConfigLoadOptions = {},
  ): Promise<z.infer<T>> {
    const {
      filePath,
      enableEnvOverrides = true,
      envPrefix = "APP",
    } = options;

    try {
      const defaults = configDef.getDefaults();
      let configData: unknown = defaults;

      // Only try to load YAML if a filePath is explicitly provided and not empty
      if (filePath && filePath.trim() !== "") {
        const yamlData =
          await this.yamlService.importFile<Record<string, unknown>>(filePath);

        const namespaceData = yamlData[configDef.namespace];
        configData = namespaceData
          ? this.deepMerge(defaults as Record<string, unknown>, namespaceData)
          : defaults;
      }

      if (enableEnvOverrides) {
        const wrappedConfig = { [configDef.namespace]: configData };
        const withEnvOverrides =
          this.environmentService.applyNamespaceOverrides(
            wrappedConfig,
            configDef.namespace,
            envPrefix,
          );
        configData = withEnvOverrides[configDef.namespace];
      }

      if (configDef.envOverrides) {
        configData = this.environmentService.applyMappingOverrides(
          configData as Record<string, unknown>,
          configDef.envOverrides,
        );
      }

      return configDef.validateConfig(configData);
    } catch (error) {
      throw new ConfigLoadError(
        `Failed to load configuration for namespace '${configDef.namespace}': ${this.getErrorMessage(error)}`,
      );
    }
  }

  public async loadMultipleConfigs<T extends z.ZodTypeAny>(
    configs: ConfigResult<T>[],
    options: ConfigLoadOptions = {},
  ): Promise<z.infer<T>[]> {
    const loadPromises = configs.map((config) =>
      this.loadConfig(config, options),
    );
    return Promise.all(loadPromises);
  }

  public async configExists(filePath: string): Promise<boolean> {
    try {
      await this.yamlService.importFile(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private deepMerge<T extends Record<string, unknown>>(
    defaults: T,
    overrides: unknown,
  ): T {
    if (
      !overrides ||
      typeof overrides !== "object" ||
      Array.isArray(overrides)
    ) {
      return defaults;
    }

    const result: Record<string, unknown> = { ...defaults };
    const overridesObj = overrides as Record<string, unknown>;

    for (const [key, value] of Object.entries(overridesObj)) {
      if (key in result) {
        const defaultValue = result[key];

        if (
          defaultValue &&
          typeof defaultValue === "object" &&
          !Array.isArray(defaultValue) &&
          value &&
          typeof value === "object" &&
          !Array.isArray(value)
        ) {
          result[key] = this.deepMerge(
            defaultValue as Record<string, unknown>,
            value,
          );
        } else {
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    }

    return result as T;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    if (error && typeof error === "object") {
      return JSON.stringify(error);
    }
    return `Unknown error occurred: ${String(error)}`;
  }
}

export interface ConfigLoadOptions {
  readonly filePath?: string;
  readonly enableEnvOverrides?: boolean;
  readonly envPrefix?: string;
}

export class ConfigLoadError extends Error {
  public readonly name = "ConfigLoadError";

  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ConfigLoadError.prototype);
  }
}
