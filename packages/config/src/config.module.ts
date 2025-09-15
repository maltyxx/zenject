import {
  type DynamicModule,
  type FactoryProvider,
  Module,
  type Provider,
} from "@zenject/core";
import type { z } from "zod";
import { ConfigService } from "./services/config.service.js";
import { EnvironmentService } from "./services/environment.service.js";
import { YamlService } from "./services/yaml.service.js";
import type { ConfigModuleOptions } from "./types/config-module.type.js";
import type { ConfigResult } from "./types/config-result.type.js";

const DEFAULT_CONFIG_PATH = "config/settings.yaml";

/**
 * Configuration module with service-based architecture
 */
@Module({
  providers: [],
  exports: [],
})
export class ConfigModule {
  public static forRoot(options: ConfigModuleOptions = {}): DynamicModule {
    const {
      enableEnvOverrides = true,
      load = [],
      envPrefix = "APP",
      filePath = DEFAULT_CONFIG_PATH,
    } = options;

    const providers: Provider[] = [
      YamlService,
      EnvironmentService,
      ConfigService,
    ];

    for (const config of load) {
      providers.push({
        provide: config.KEY,
        useFactory: async (configService: ConfigService) => {
          return configService.loadConfig(config, {
            filePath,
            enableEnvOverrides,
            envPrefix,
          });
        },
        deps: [ConfigService],
      } as FactoryProvider);
    }

    return {
      module: ConfigModule,
      providers,
      exports: providers,
    };
  }

  public static forFeature<T extends z.ZodTypeAny>(
    configs: ConfigResult<T>[],
  ): DynamicModule {
    const providers: Provider[] = [
      YamlService,
      EnvironmentService,
      ConfigService,
    ];

    for (const config of configs) {
      providers.push({
        provide: config.KEY,
        useFactory: async (configService: ConfigService) => {
          return configService.loadConfig(config, {
            filePath: DEFAULT_CONFIG_PATH,
            enableEnvOverrides: true,
            envPrefix: "APP",
          });
        },
        deps: [ConfigService],
      } as FactoryProvider);
    }

    return {
      module: ConfigModule,
      providers,
      exports: providers,
    };
  }
}
