import { beforeEach, describe, expect, it } from "bun:test";
import { createTestContext } from "@zenject/testing";
import "reflect-metadata";
import { EnvironmentError, EnvironmentService } from "./environment.service.js";

describe("EnvironmentService", () => {
  let environmentService: EnvironmentService;

  beforeEach(async () => {
    // Clear all test environment variables before each test
    const testEnvVars = Object.keys(process.env).filter(
      (key) =>
        key.startsWith("TEST_") ||
        key.startsWith("APP_") ||
        key.startsWith("LOGGER_") ||
        key.startsWith("API_") ||
        key.startsWith("DB_") ||
        key.startsWith("REDIS_") ||
        key.startsWith("BACKUP_") ||
        key.startsWith("PRIMARY_") ||
        key.startsWith("FALLBACK_") ||
        key.startsWith("INVALID_") ||
        key.startsWith("BOOL_"),
    );

    testEnvVars.forEach((key) => {
      delete process.env[key];
    });

    const { resolve } = await createTestContext({
      providers: [EnvironmentService],
    });

    environmentService = resolve(EnvironmentService);
  });

  describe("applyNamespaceOverrides", () => {
    it("should apply environment overrides using namespace convention", () => {
      process.env.APP_DATABASE_HOST = "prod-server";
      process.env.APP_DATABASE_PORT = "3306";

      const config = {
        database: {
          host: "localhost",
          port: 5432,
          name: "testdb",
        },
      };

      const result = environmentService.applyNamespaceOverrides(
        config,
        "database",
        "APP",
      );

      expect(result.database.host).toBe("prod-server");
      expect(result.database.port).toBe(3306);
      expect(result.database.name).toBe("testdb");
    });

    it("should handle nested properties", () => {
      process.env.APP_DATABASE_CONNECTION_POOL_MIN = "5";
      process.env.APP_DATABASE_CONNECTION_POOL_MAX = "20";

      const config = {
        database: {
          connection: {
            pool: {
              min: 2,
              max: 10,
            },
          },
        },
      };

      const result = environmentService.applyNamespaceOverrides(
        config,
        "database",
        "APP",
      );

      expect(result.database.connection.pool.min).toBe(5);
      expect(result.database.connection.pool.max).toBe(20);
    });

    it("should handle boolean conversion", () => {
      process.env.APP_FEATURES_ENABLED = "true";
      process.env.APP_FEATURES_DEBUG = "false";
      process.env.APP_FEATURES_VERBOSE = "1";

      const config = {
        features: {
          enabled: false,
          debug: true,
          verbose: false,
        },
      };

      const result = environmentService.applyNamespaceOverrides(
        config,
        "features",
        "APP",
      );

      expect(result.features.enabled).toBe(true);
      expect(result.features.debug).toBe(false);
      expect(result.features.verbose).toBe(true);
    });
  });

  describe("applyMappingOverrides", () => {
    it("should apply custom environment mapping", () => {
      process.env.LOGGER_LEVEL = "debug";
      process.env.API_KEY = "secret123";

      const config = {
        level: "info",
        apiKey: "default",
        timeout: 5000,
      };

      const mapping = {
        level: "LOGGER_LEVEL",
        apiKey: "API_KEY",
      };

      const result = environmentService.applyMappingOverrides(config, mapping);

      expect(result.level).toBe("debug");
      expect(result.apiKey).toBe("secret123");
      expect(result.timeout).toBe(5000);
    });

    it("should handle nested properties with dot notation", () => {
      process.env.DB_HOST = "prod-db";
      process.env.DB_PORT = "3306";

      const config = {
        database: {
          host: "localhost",
          port: 5432,
        },
      };

      const mapping = {
        "database.host": "DB_HOST",
        "database.port": "DB_PORT",
      };

      const result = environmentService.applyMappingOverrides(config, mapping);

      expect(result.database.host).toBe("prod-db");
      expect(result.database.port).toBe(3306);
    });

    it("should throw error for invalid dot notation paths", () => {
      process.env.TEST_VAR = "test_value";

      const config = {};
      const mapping = { "invalid..path": "TEST_VAR" };

      expect(() =>
        environmentService.applyMappingOverrides(config, mapping),
      ).toThrow(EnvironmentError);
    });
  });

  describe("getTypedEnvVar", () => {
    it("should return environment variable with type conversion", () => {
      process.env.TEST_NUMBER = "42";
      process.env.TEST_BOOLEAN = "true";
      process.env.TEST_STRING = "hello";

      expect(environmentService.getTypedEnvVar("TEST_NUMBER", 0)).toBe(42);
      expect(environmentService.getTypedEnvVar("TEST_BOOLEAN", false)).toBe(
        true,
      );
      expect(environmentService.getTypedEnvVar("TEST_STRING", "")).toBe(
        "hello",
      );
    });

    it("should return default value if environment variable not found", () => {
      expect(environmentService.getTypedEnvVar("NONEXISTENT", "default")).toBe(
        "default",
      );
      expect(environmentService.getTypedEnvVar("NONEXISTENT", 42)).toBe(42);
      expect(environmentService.getTypedEnvVar("NONEXISTENT", true)).toBe(true);
    });
  });

  describe("hasEnvVar", () => {
    it("should return true if environment variable exists", () => {
      process.env.TEST_EXISTS = "value";

      expect(environmentService.hasEnvVar("TEST_EXISTS")).toBe(true);
      expect(environmentService.hasEnvVar("TEST_NOT_EXISTS")).toBe(false);
    });
  });

  describe("getEnvVarsWithPrefix", () => {
    it("should return all environment variables with specific prefix", () => {
      process.env.APP_VAR1 = "value1";
      process.env.APP_VAR2 = "value2";
      process.env.OTHER_VAR = "other";

      const result = environmentService.getEnvVarsWithPrefix("APP");

      expect(result).toEqual({
        APP_VAR1: "value1",
        APP_VAR2: "value2",
      });
      expect(result.OTHER_VAR).toBeUndefined();
    });
  });
});
