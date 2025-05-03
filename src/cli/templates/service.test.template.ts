import { describe, expect, it, beforeEach, afterEach, mock } from "bun:test";
import { ${CLASS_NAME} } from "./${SERVICE_NAME}.service";
import { createTestingContainer, createMock } from "@maltyxx/zenject/testing";
import { AppLifecycle } from "@maltyxx/zenject";

describe("${CLASS_NAME}", () => {
  let service: ${CLASS_NAME};
  let testContainer;

  // Example of mocking a dependency
  const mockLogger = {
    debug: mock(() => {}),
    info: mock(() => {}),
    error: mock(() => {})
  };

  beforeEach(() => {
    // Create a test container with mocks
    testContainer = createTestingContainer({
      // Example: register mocked dependencies
      // LoggerService: mockLogger
    });

    // Register the service under test
    testContainer.register(${CLASS_NAME}, { useClass: ${CLASS_NAME} });
    
    // Resolve the service
    service = testContainer.resolve(${CLASS_NAME});
  });

  afterEach(() => {
    // Reset mocks
    mock.resetAll();
    
    // Cleanup (example for services that need cleanup)
    AppLifecycle.unregister(service);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return sample data", () => {
    expect(service.getSampleData()).toBe("${SERVICE_NAME} data");
  });

  // Example of testing with mocks
  it.skip("should log messages correctly", () => {
    // Arrange
    // const logger = testContainer.resolve(LoggerService);
    
    // Act
    service.getSampleData();
    
    // Assert
    // expect(mockLogger.info).toHaveBeenCalled();
  });
}); 