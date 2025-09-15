import { Injectable } from "@zenject/core";

/**
 * Environment Service for variable overrides with strong typing
 */
@Injectable()
export class EnvironmentService {
  public applyNamespaceOverrides<T extends Record<string, unknown>>(
    config: T,
    namespace: string,
    envPrefix = "APP",
  ): T {
    const result = structuredClone(config);
    const namespaceConfig = result[namespace];

    if (!this.isValidConfigObject(namespaceConfig)) {
      return result;
    }

    (result as Record<string, unknown>)[namespace] =
      this.applyOverridesToObject(
        namespaceConfig,
        `${envPrefix}_${namespace.toUpperCase()}`,
      );

    return result;
  }

  public applyMappingOverrides<T extends Record<string, unknown>>(
    config: T,
    envOverrides?: EnvironmentMappingConfig,
  ): T {
    if (!envOverrides) {
      return config;
    }

    const result = { ...config };

    for (const [configKey, envKeys] of Object.entries(envOverrides)) {
      const envKeysList = Array.isArray(envKeys) ? envKeys : [envKeys];
      const envValue = this.getFirstAvailableEnvVar(envKeysList);

      if (envValue === undefined) {
        continue;
      }

      if (configKey.includes(".")) {
        if (
          configKey.includes("..") ||
          configKey.startsWith(".") ||
          configKey.endsWith(".")
        ) {
          throw new EnvironmentError(
            `Invalid path: '${configKey}' contains invalid dot notation`,
          );
        }
        this.setNestedProperty(result, configKey, envValue);
      } else {
        const originalValue = config[configKey];
        (result as Record<string, unknown>)[configKey] =
          this.convertEnvironmentValue(envValue, originalValue);
      }
    }

    return result;
  }

  public getTypedEnvVar<T>(envKey: string, defaultValue: T): T {
    const envValue = process.env[envKey];

    if (envValue === undefined) {
      return defaultValue;
    }

    return this.convertEnvironmentValue(envValue, defaultValue) as T;
  }

  public hasEnvVar(envKey: string): boolean {
    return process.env[envKey] !== undefined;
  }

  public getEnvVarsWithPrefix(prefix: string): Record<string, string> {
    const result: Record<string, string> = {};
    const upperPrefix = prefix.toUpperCase();

    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith(upperPrefix) && value !== undefined) {
        result[key] = value;
      }
    }

    return result;
  }

  private applyOverridesToObject(
    obj: Record<string, unknown>,
    envPrefix: string,
  ): Record<string, unknown> {
    const result = { ...obj };

    for (const [key, value] of Object.entries(obj)) {
      const envKey = `${envPrefix}_${key.toUpperCase()}`;
      const envValue = process.env[envKey];

      if (envValue !== undefined) {
        result[key] = this.convertEnvironmentValue(envValue, value);
      } else if (this.isValidConfigObject(value)) {
        result[key] = this.applyOverridesToObject(value, envKey);
      }
    }

    return result;
  }

  private setNestedProperty(
    obj: Record<string, unknown>,
    path: string,
    envValue: string,
  ): void {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];

      if (!key) {
        throw new EnvironmentError(`Invalid path: empty key in '${path}'`);
      }

      if (!this.isValidConfigObject(current[key])) {
        current[key] = {};
      }

      current = current[key] as Record<string, unknown>;
    }

    const finalKey = keys[keys.length - 1];
    if (!finalKey) {
      throw new EnvironmentError(`Invalid path: empty final key in '${path}'`);
    }

    const originalValue = this.getNestedProperty(obj, path);
    current[finalKey] = this.convertEnvironmentValue(envValue, originalValue);
  }

  private getNestedProperty(
    obj: Record<string, unknown>,
    path: string,
  ): unknown {
    return path.split(".").reduce((current: unknown, key: string) => {
      if (this.isValidConfigObject(current) && key in current) {
        return current[key];
      }
      return undefined;
    }, obj);
  }

  private getFirstAvailableEnvVar(envKeys: string[]): string | undefined {
    for (const envKey of envKeys) {
      const value = process.env[envKey];
      if (value !== undefined) {
        return value;
      }
    }
    return undefined;
  }

  private convertEnvironmentValue(
    envValue: string,
    originalValue: unknown,
  ): unknown {
    if (typeof originalValue === "boolean") {
      return this.parseBoolean(envValue);
    }

    if (typeof originalValue === "number") {
      return this.parseNumber(envValue, originalValue);
    }

    if (Array.isArray(originalValue)) {
      return this.parseArray(envValue);
    }

    return envValue;
  }

  private parseBoolean(value: string): boolean {
    const normalized = value.toLowerCase().trim();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }

  private parseNumber(value: string, fallback: number): number {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  private parseArray(value: string): string[] {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private isValidConfigObject(
    value: unknown,
  ): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
}

export class EnvironmentError extends Error {
  public readonly name = "EnvironmentError";

  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, EnvironmentError.prototype);
  }
}

export type EnvironmentMappingConfig = Record<string, string | string[]>;

export interface EnvironmentVariable {
  readonly key: string;
  readonly value: string;
  readonly source: "process" | "default";
}
