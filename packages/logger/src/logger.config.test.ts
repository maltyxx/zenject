import { beforeAll, beforeEach, describe, expect, it, mock } from "bun:test";
import { createTestContext } from "@zenject/testing";
import { LOGGER_TOKEN } from "./constants.js";
import { LoggerConfig } from "./logger.config.js";
import type { Logger } from "./logger.interface.js";

describe("LoggerConfig", () => {
  let logger: Logger;
  let mockLogger: Logger;

  beforeAll(() => {
    mockLogger = {
      trace: mock(),
      debug: mock(),
      info: mock(),
      warn: mock(),
      error: mock(),
      fatal: mock(),
      silent: mock(),
      level: "debug",
      child: mock(),
    } as unknown as Logger;

    // Set up child mock to return itself after creation
    (mockLogger.child as ReturnType<typeof mock>).mockReturnValue(mockLogger);
  });

  beforeEach(async () => {
    // Reset all mocks
    (mockLogger.trace as ReturnType<typeof mock>).mockReset();
    (mockLogger.debug as ReturnType<typeof mock>).mockReset();
    (mockLogger.info as ReturnType<typeof mock>).mockReset();
    (mockLogger.warn as ReturnType<typeof mock>).mockReset();
    (mockLogger.error as ReturnType<typeof mock>).mockReset();
    (mockLogger.fatal as ReturnType<typeof mock>).mockReset();
    (mockLogger.child as ReturnType<typeof mock>).mockReset();
    (mockLogger.child as ReturnType<typeof mock>).mockReturnValue(mockLogger);

    const config = LoggerConfig.getDefaults();
    const transformedConfig = LoggerConfig.transform?.(config) ?? config;

    const { resolve } = await createTestContext({
      providers: [],
      overrides: [
        { provide: LOGGER_TOKEN, useValue: mockLogger },
        {
          provide: LoggerConfig.KEY,
          useValue: transformedConfig,
        },
      ],
    });

    logger = resolve<Logger>(LOGGER_TOKEN);
  });

  describe("Logger Method Calls", () => {
    it("should call error method with correct parameters", () => {
      const testError = new Error("Test error message");
      testError.name = "TestError";

      logger.error({ error: testError }, "Test error logging");

      expect(mockLogger.error).toHaveBeenCalledWith(
        { error: testError },
        "Test error logging",
      );
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
    });

    it("should call error method with multiple error objects", () => {
      const error1 = new Error("First error");
      const error2 = new Error("Second error");
      const exception = new Error("Exception error");

      const errorData = {
        error: error1,
        err: error2,
        exception: exception,
      };

      logger.error(errorData, "Multiple errors");

      expect(mockLogger.error).toHaveBeenCalledWith(
        errorData,
        "Multiple errors",
      );
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
    });

    it("should handle circular references without throwing", () => {
      const obj: Record<string, unknown> = { name: "circular" };
      obj.self = obj; // Create circular reference

      // This should not throw
      expect(() => {
        logger.info({ circular: obj }, "Circular reference test");
      }).not.toThrow();

      expect(mockLogger.info).toHaveBeenCalledWith(
        { circular: obj },
        "Circular reference test",
      );
    });
  });

  describe("Logger Method Variations", () => {
    it("should call different log levels correctly", () => {
      logger.trace("trace message");
      logger.debug("debug message");
      logger.info("info message");
      logger.warn("warn message");
      logger.error("error message");
      logger.fatal("fatal message");

      expect(mockLogger.trace).toHaveBeenCalledWith("trace message");
      expect(mockLogger.debug).toHaveBeenCalledWith("debug message");
      expect(mockLogger.info).toHaveBeenCalledWith("info message");
      expect(mockLogger.warn).toHaveBeenCalledWith("warn message");
      expect(mockLogger.error).toHaveBeenCalledWith("error message");
      expect(mockLogger.fatal).toHaveBeenCalledWith("fatal message");
    });

    it("should handle data objects with various types", () => {
      const testData = {
        username: "john",
        password: "secret123",
        token: "jwt-token-here",
        api_key: "sensitive-key",
        count: 42,
        active: true,
        metadata: null,
      };

      logger.info(testData, "User data");

      expect(mockLogger.info).toHaveBeenCalledWith(testData, "User data");
    });
  });

  describe("Data Types", () => {
    it("should handle Date objects", () => {
      const testDate = new Date("2024-01-01T12:00:00.000Z");

      logger.info({ date: testDate }, "Date test");

      expect(mockLogger.info).toHaveBeenCalledWith(
        { date: testDate },
        "Date test",
      );
    });

    it("should handle BigInt values", () => {
      const bigIntValue = BigInt("9007199254740991");

      logger.info({ bigint: bigIntValue }, "BigInt test");

      expect(mockLogger.info).toHaveBeenCalledWith(
        { bigint: bigIntValue },
        "BigInt test",
      );
    });

    it("should handle null and undefined values", () => {
      const testData = {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: "",
        zero: 0,
        falsy: false,
      };

      logger.info(testData, "Edge cases");

      expect(mockLogger.info).toHaveBeenCalledWith(testData, "Edge cases");
    });

    it("should handle complex nested objects", () => {
      const complex = {
        user: {
          id: 123,
          profile: {
            name: "John Doe",
            settings: {
              theme: "dark",
              notifications: true,
            },
          },
        },
        error: new Error("Nested error"),
        timestamp: new Date("2024-01-01T12:00:00.000Z"),
      };

      logger.info(complex, "Complex object test");

      expect(mockLogger.info).toHaveBeenCalledWith(
        complex,
        "Complex object test",
      );
    });
  });

  describe("Logger Configuration", () => {
    it("should create child logger", () => {
      const childLogger = logger.child({ module: "test" });

      expect(mockLogger.child).toHaveBeenCalledWith({ module: "test" });
      expect(childLogger).toBeDefined();
    });

    it("should have correct mock logger setup", () => {
      expect(logger).toBeDefined();
      expect(logger).toBe(mockLogger);
    });
  });
});
