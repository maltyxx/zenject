/**
 * Defines the scope of dependency instances
 *
 * @enum {string}
 */
export enum Scope {
  /**
   * Singleton scope - one instance for the entire application
   */
  SINGLETON = "singleton",

  /**
   * Request scope - new instance for each HTTP request
   */
  REQUEST = "request",

  /**
   * Transient scope - new instance each time the dependency is injected
   */
  TRANSIENT = "transient",

  /**
   * Job scope - new instance for each background job
   */
  JOB = "job",

  /**
   * Test scope - isolated instance for testing
   */
  TEST = "test",
}
