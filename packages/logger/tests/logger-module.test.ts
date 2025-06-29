import { describe, expect, test } from "bun:test";
import { LoggerModule } from "@zenject/logger";
import { LOGGER_LOGGER_TOKEN } from "@zenject/logger";
import { createTestContext } from "@zenject/testing";
import type { Logger } from "pino";

describe("LoggerModule", () => {
  test("creates pino instance", async () => {
    const { resolve } = await createTestContext({ imports: [LoggerModule] });
    const logger = resolve<Logger>(LOGGER_LOGGER_TOKEN);
    expect(typeof logger.info).toBe("function");
  });
});
