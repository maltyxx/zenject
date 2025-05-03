import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { ${CLASS_NAME} } from "./${SERVICE_NAME}.service";
import { createTestingContainer } from "@maltyxx/zenject/testing";

describe("${CLASS_NAME}", () => {
  let service: ${CLASS_NAME};

  beforeEach(() => {
    // Create a test container and register the service
    const container = createTestingContainer();
    container.register(${CLASS_NAME}, { useClass: ${CLASS_NAME} });
    service = container.resolve(${CLASS_NAME});
  });

  afterEach(() => {
    // Clean up
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return sample data", () => {
    expect(service.getSampleData()).toBe("${SERVICE_NAME} data");
  });
}); 