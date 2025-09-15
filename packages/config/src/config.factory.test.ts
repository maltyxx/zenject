import { describe, expect, it } from "bun:test";
import "reflect-metadata";
import { z } from "zod";
import { createConfig } from "./config.factory.js";

describe("createConfig", () => {
  it("should create configuration with all properties", () => {
    const TestConfig = createConfig("test", {
      schema: z.object({
        name: z.string().default("test"),
        port: z.number().default(3000),
      }),
      description: "Test configuration",
      envOverrides: {
        name: "TEST_NAME",
        port: "TEST_PORT",
      },
      rules: (config) => {
        if (config.port < 1000) {
          throw new Error("Port must be >= 1000");
        }
      },
      transform: (config) => ({
        ...config,
        url: `http://localhost:${config.port}`,
      }),
    });

    expect(TestConfig.namespace).toBe("test");
    expect(TestConfig.description).toBe("Test configuration");
    expect(TestConfig.envOverrides).toEqual({
      name: "TEST_NAME",
      port: "TEST_PORT",
    });
    expect(TestConfig.KEY.description).toBe("Config[test]");
  });

  it("should create configuration with minimal properties", () => {
    const MinimalConfig = createConfig("minimal", {
      schema: z.object({
        value: z.string().default("default"),
      }),
    });

    expect(MinimalConfig.namespace).toBe("minimal");
    expect(MinimalConfig.description).toBe("Configuration for minimal");
    expect(MinimalConfig.envOverrides).toBeUndefined();
    expect(MinimalConfig.rules).toBeUndefined();
    expect(MinimalConfig.transform).toBeUndefined();
  });

  describe("getDefaults", () => {
    it("should return schema defaults", () => {
      const TestConfig = createConfig("test", {
        schema: z.object({
          name: z.string().default("test"),
          port: z.number().default(3000),
          enabled: z.boolean().default(true),
        }),
      });

      const defaults = TestConfig.getDefaults();

      expect(defaults).toEqual({
        name: "test",
        port: 3000,
        enabled: true,
      });
    });

    it("should return empty object when no defaults available", () => {
      const TestConfig = createConfig("test", {
        schema: z.object({
          name: z.string(),
          port: z.number(),
        }),
      });

      const defaults = TestConfig.getDefaults();

      expect(defaults).toEqual({});
    });
  });

  describe("validateConfig", () => {
    it("should validate and return valid configuration", () => {
      const TestConfig = createConfig("test", {
        schema: z.object({
          name: z.string().default("test"),
          port: z.number().default(3000),
        }),
      });

      const result = TestConfig.validateConfig({
        name: "production",
        port: 8080,
      });

      expect(result).toEqual({
        name: "production",
        port: 8080,
      });
    });

    it("should apply defaults for missing properties", () => {
      const TestConfig = createConfig("test", {
        schema: z.object({
          name: z.string().default("test"),
          port: z.number().default(3000),
        }),
      });

      const result = TestConfig.validateConfig({
        name: "production",
      });

      expect(result).toEqual({
        name: "production",
        port: 3000,
      });
    });

    it("should apply environment overrides when defined", () => {
      process.env.TEST_NAME = "env-name";
      process.env.TEST_PORT = "9000";

      const TestConfig = createConfig("test", {
        schema: z.object({
          name: z.string().default("test"),
          port: z.number().default(3000),
        }),
        envOverrides: {
          name: "TEST_NAME",
          port: "TEST_PORT",
        },
      });

      const result = TestConfig.validateConfig({
        name: "config-name",
        port: 8080,
      });

      expect(result.name).toBe("env-name");
      expect(result.port).toBe(9000);

      delete process.env.TEST_NAME;
      delete process.env.TEST_PORT;
    });

    it("should apply business rules validation", () => {
      const TestConfig = createConfig("test", {
        schema: z.object({
          port: z.number().default(3000),
        }),
        rules: (config) => {
          if (config.port < 1000) {
            throw new Error("Port must be >= 1000");
          }
        },
      });

      expect(() => TestConfig.validateConfig({ port: 500 })).toThrow(
        "Port must be >= 1000",
      );

      expect(() => TestConfig.validateConfig({ port: 8080 })).not.toThrow();
    });

    it("should apply transformation when defined", () => {
      const TestConfig = createConfig("test", {
        schema: z.object({
          host: z.string().default("localhost"),
          port: z.number().default(3000),
        }),
        transform: (config) => ({
          ...config,
          url: `http://${config.host}:${config.port}`,
        }),
      });

      const result = TestConfig.validateConfig({
        host: "example.com",
        port: 8080,
      });

      expect(result).toEqual({
        host: "example.com",
        port: 8080,
        url: "http://example.com:8080",
      });
    });

    it("should throw on invalid data", () => {
      const TestConfig = createConfig("test", {
        schema: z.object({
          name: z.string(),
          port: z.number(),
        }),
      });

      expect(() => TestConfig.validateConfig({ name: "test" })).toThrow();
      expect(() => TestConfig.validateConfig({ port: "invalid" })).toThrow();
    });
  });

  describe("getExample", () => {
    it("should return defaults as example", () => {
      const TestConfig = createConfig("test", {
        schema: z.object({
          name: z.string().default("test"),
          port: z.number().default(3000),
        }),
      });

      const example = TestConfig.getExample();

      expect(example).toEqual({
        name: "test",
        port: 3000,
      });
    });
  });
});
