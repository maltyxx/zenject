import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createTestContext } from "@zenject/testing";
import "reflect-metadata";
import { z } from "zod";
import { createConfig } from "../config.factory.js";
import { ConfigLoadError, ConfigService } from "./config.service.js";
import { EnvironmentService } from "./environment.service.js";
import { YamlService } from "./yaml.service.js";

describe("ConfigService", () => {
  let configService: ConfigService;

  const mockYamlService = {
    importFile: mock(),
    parseContent: mock(),
  };

  const mockEnvironmentService = {
    applyNamespaceOverrides: mock((config) => config),
    applyMappingOverrides: mock((config) => config),
  };

  beforeEach(async () => {
    // Reset mocks
    mockYamlService.importFile.mockReset();
    mockYamlService.parseContent.mockReset();
    mockEnvironmentService.applyNamespaceOverrides.mockReset();
    mockEnvironmentService.applyMappingOverrides.mockReset();

    // Set default mock implementations
    mockYamlService.importFile.mockResolvedValue({});
    mockYamlService.parseContent.mockReturnValue({});
    mockEnvironmentService.applyNamespaceOverrides.mockImplementation(
      (config) => config,
    );
    mockEnvironmentService.applyMappingOverrides.mockImplementation(
      (config) => config,
    );

    const { resolve } = await createTestContext({
      providers: [ConfigService, YamlService, EnvironmentService],
      overrides: [
        { provide: YamlService, useValue: mockYamlService },
        { provide: EnvironmentService, useValue: mockEnvironmentService },
      ],
    });

    configService = resolve(ConfigService);
  });

  describe("loadConfig", () => {
    it("should load configuration successfully", async () => {
      const TestConfig = createConfig("test", {
        schema: z.object({
          name: z.string().default("test"),
          port: z.number().default(3000),
        }),
      });

      const yamlData = {
        test: {
          name: "production",
          port: 8080,
        },
      };

      mockYamlService.importFile.mockResolvedValue(yamlData);

      const result = await configService.loadConfig(TestConfig, {
        filePath: "config.yaml",
      });

      expect(result).toEqual({
        name: "production",
        port: 8080,
      });
    });

    it("should use defaults when namespace not found in YAML", async () => {
      const TestConfig = createConfig("missing", {
        schema: z.object({
          value: z.string().default("default"),
        }),
      });

      const yamlData = {
        other: { value: "other" },
      };

      mockYamlService.importFile.mockResolvedValue(yamlData);

      const result = await configService.loadConfig(TestConfig);

      expect(result).toEqual({
        value: "default",
      });
    });

    it("should apply environment overrides when enabled", async () => {
      const TestConfig = createConfig("app", {
        schema: z.object({
          host: z.string().default("localhost"),
        }),
      });

      const yamlData = {
        app: { host: "yaml-host" },
      };

      const envOverriddenData = {
        app: { host: "env-host" },
      };

      mockYamlService.importFile.mockResolvedValue(yamlData);
      mockEnvironmentService.applyNamespaceOverrides = mock(
        () => envOverriddenData,
      );

      const result = await configService.loadConfig(TestConfig, {
        enableEnvOverrides: true,
        envPrefix: "TEST",
      });

      expect(result.host).toBe("env-host");
    });

    it("should apply custom environment mapping when defined", async () => {
      const TestConfig = createConfig("app", {
        schema: z.object({
          apiKey: z.string().default("default"),
        }),
        envOverrides: {
          apiKey: "API_KEY",
        },
      });

      const yamlData = {
        app: { apiKey: "yaml-key" },
      };

      const mappingOverriddenData = {
        apiKey: "env-key",
      };

      mockYamlService.importFile.mockResolvedValue(yamlData);
      mockEnvironmentService.applyMappingOverrides = mock(
        () => mappingOverriddenData,
      );

      const result = await configService.loadConfig(TestConfig);

      expect(result.apiKey).toBe("env-key");
    });

    it("should handle configuration with transformation", async () => {
      const TestConfig = createConfig("app", {
        schema: z.object({
          port: z.number().default(3000),
          url: z.string().optional(),
        }),
        transform: (config) => ({
          ...config,
          url: `http://localhost:${config.port}`,
        }),
      });

      const yamlData = {
        app: { port: 8080 },
      };

      mockYamlService.importFile.mockResolvedValue(yamlData);

      const result = await configService.loadConfig(TestConfig, {
        filePath: "config.yaml",
      });

      expect(result).toEqual({
        port: 8080,
        url: "http://localhost:8080",
      });
    });

    it("should throw ConfigLoadError on failure", async () => {
      const TestConfig = createConfig("app", {
        schema: z.object({
          value: z.string(),
        }),
      });

      mockYamlService.importFile.mockRejectedValue(new Error("File not found"));

      await expect(configService.loadConfig(TestConfig)).rejects.toThrow(
        ConfigLoadError,
      );
    });
  });

  describe("loadMultipleConfigs", () => {
    it("should load multiple configurations in parallel", async () => {
      const Config1 = createConfig("config1", {
        schema: z.object({ value: z.string().default("default1") }),
      });

      const Config2 = createConfig("config2", {
        schema: z.object({ value: z.string().default("default2") }),
      });

      const yamlData = {
        config1: { value: "loaded1" },
        config2: { value: "loaded2" },
      };

      mockYamlService.importFile.mockResolvedValue(yamlData);

      const [result1, result2] = await configService.loadMultipleConfigs([
        Config1,
        Config2,
      ], {
        filePath: "config.yaml",
      });

      expect(result1).toEqual({ value: "loaded1" });
      expect(result2).toEqual({ value: "loaded2" });
    });
  });

  describe("configExists", () => {
    it("should return true if config file can be imported", async () => {
      mockYamlService.importFile.mockResolvedValue({});

      const exists = await configService.configExists("test.yaml");

      expect(exists).toBe(true);
    });

    it("should return false if config file cannot be imported", async () => {
      mockYamlService.importFile.mockRejectedValue(new Error("Not found"));

      const exists = await configService.configExists("missing.yaml");

      expect(exists).toBe(false);
    });
  });
});
