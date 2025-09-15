import { beforeEach, describe, expect, mock, test } from "bun:test";
import { LOGGER_TOKEN, type Logger } from "@zenject/logger";
import { createTestContext } from "@zenject/testing";
import { appConfig } from "./app.config";
import { AppService } from "./app.service";

describe("AppService", () => {
  let appService: AppService;
  let loggerMock: Logger;

  beforeEach(async () => {
    loggerMock = {
      trace: mock(() => {}),
      warn: mock(() => {}),
      fatal: mock(() => {}),
      silent: mock(() => {}),
      debug: mock(() => {}),
      info: mock(() => {}),
      error: mock(() => {}),
      child: mock((_bindings: Record<string, unknown>) => loggerMock),
    };

    const mockConfig = {
      environment: "development" as const,
    };

    const { resolve } = await createTestContext({
      providers: [AppService],
      overrides: [
        { provide: LOGGER_TOKEN, useValue: loggerMock },
        { provide: appConfig.KEY, useValue: mockConfig },
      ],
    });

    appService = resolve(AppService);
  });

  test("helloWorld should call logger.info with 'Hello, world!'", () => {
    appService.helloWorld();

    expect(loggerMock.info).toHaveBeenCalledWith(
      { config: { environment: "development" } },
      "Hello, world!"
    );
    expect(loggerMock.info).toHaveBeenCalledTimes(1);
  });
});
