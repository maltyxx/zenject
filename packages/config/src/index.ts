/**
 * @zenject/config - Configuration module with YAML support and environment overrides
 */

export { Inject } from "@zenject/core";

export { createConfig } from "./config.factory.js";
export { ConfigModule } from "./config.module.js";
export type { ConfigLoadOptions } from "./services/config.service.js";
export { ConfigLoadError, ConfigService } from "./services/config.service.js";
export type { EnvironmentMappingConfig } from "./services/environment.service.js";
export {
  EnvironmentError,
  EnvironmentService,
} from "./services/environment.service.js";
export {
  YamlImportError,
  YamlParseError,
  YamlService,
} from "./services/yaml.service.js";

export type { ConfigDefinition } from "./types/config-definition.type.js";
export type { ConfigModuleOptions } from "./types/config-module.type.js";
export type { ConfigResult, ConfigType } from "./types/config-result.type.js";
