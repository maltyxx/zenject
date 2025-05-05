import { type DependencyContainer, type Token, container } from "@zenject/core";

/**
 * Create a testing container with optional overrides
 *
 * @param overrides Optional map of tokens to override values
 * @returns A testing container with the overrides registered
 *
 * @example
 * // Create a testing container with mocks
 * const testContainer = createTestingContainer({
 *   DatabaseService: mockDbService,
 *   'API_KEY': 'test-api-key'
 * });
 *
 * // Resolve a service from the test container
 * const userService = testContainer.resolve(UserService);
 */
export function createTestingContainer(
  overrides: Record<string | symbol, unknown> = {},
): DependencyContainer {
  // Create a fresh container for testing
  const testContainer = container.createChildContainer();

  // Register string tokens
  for (const token of Object.getOwnPropertyNames(overrides)) {
    testContainer.register(token as Token, {
      useValue: overrides[token as keyof typeof overrides],
    });
  }

  // Register symbol tokens
  for (const token of Object.getOwnPropertySymbols(overrides)) {
    testContainer.register(token as Token, {
      useValue: overrides[token as keyof typeof overrides],
    });
  }

  return testContainer;
}

/**
 * Create a mock provider for use in tests
 *
 * @param token The token to mock
 * @param methods Methods to mock
 * @returns A mock object that can be used as a provider
 *
 * @example
 * // Create a mock service
 * const mockLogger = createMock(LoggerService, {
 *   debug: mock.fn(),
 *   info: mock.fn(),
 *   error: mock.fn()
 * });
 *
 * // Use the mock in tests
 * const testContainer = createTestingContainer({
 *   LoggerService: mockLogger
 * });
 */
export function createMock<T extends object>(
  token: Token<T>,
  methods: Partial<T> = {},
): T {
  return methods as T;
}
