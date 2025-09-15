import { InjectionToken } from "@zenject/core";
import type { z } from "zod";
import { EnvironmentService } from "./services/environment.service.js";
import type { ConfigDefinition } from "./types/config-definition.type.js";
import type { ConfigResult } from "./types/config-result.type.js";

/**
 * Create configuration with schema, validation and environment overrides
 */
export function createConfig<TSchema extends z.ZodTypeAny>(
  namespace: string,
  definition: ConfigDefinition<TSchema>,
): ConfigResult<TSchema> {
  const KEY = new InjectionToken<z.infer<TSchema>>(`Config[${namespace}]`);
  const description =
    definition.description || `Configuration for ${namespace}`;

  const configResult: ConfigResult<TSchema> = {
    KEY,
    namespace,
    schema: definition.schema,
    description,
    rules: definition.rules,
    transform: definition.transform,
    envOverrides: definition.envOverrides,

    getDefaults(): z.infer<TSchema> {
      try {
        return definition.schema.parse({});
      } catch {
        return {} as z.infer<TSchema>;
      }
    },

    validateConfig(data: unknown): z.infer<TSchema> {
      let validatedData = definition.schema.parse(data);

      if (definition.envOverrides) {
        const envService = new EnvironmentService();
        validatedData = envService.applyMappingOverrides(
          validatedData as Record<string, unknown>,
          definition.envOverrides,
        ) as z.infer<TSchema>;
      }

      if (definition.rules) {
        definition.rules(validatedData);
      }

      if (definition.transform) {
        return definition.transform(validatedData) as z.infer<TSchema>;
      }

      return validatedData;
    },

    getExample(): z.infer<TSchema> {
      return this.getDefaults();
    },
  };

  return configResult;
}
