import { beforeEach, describe, expect, mock, test } from "bun:test";
import { createTestContext } from "@maltyxx/zenject/testing";
import { AppService } from "./app.service";
import { LOGGER_LOGGER_TOKEN } from "./modules/logger/constants";
import type { Logger } from "./modules/logger/logger.interface";

describe("AppService", () => {
  let appService: AppService;
  let loggerMock: Logger;

  beforeEach(async () => {
    // Create logger mock with mock functions
    loggerMock = {
      debug: mock(() => {}),
      info: mock(() => {}),
      error: mock(() => {}),
      child: mock((bindings: Record<string, unknown>) => loggerMock),
    };

    const { resolve } = await createTestContext({
      providers: [AppService],
      overrides: [
        { provide: LOGGER_LOGGER_TOKEN, useValue: loggerMock }
      ],
    });

    appService = resolve(AppService);
  });

  test("helloWorld should call logger.info with 'Hello, world!'", () => {
    appService.helloWorld();

    expect(loggerMock.info).toHaveBeenCalledWith("Hello, world!");
    expect(loggerMock.info).toHaveBeenCalledTimes(1);
  });
});
