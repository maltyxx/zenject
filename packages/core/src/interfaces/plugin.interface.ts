/**
 * Plugin interface for extensibility.
 * Implement this interface to create plugins for Zenject.
 */
export interface Plugin {
  /**
   * Unique name for the plugin
   */
  name: string;

  /**
   * Initialize the plugin
   */
  initialize(): Promise<void> | void;

  /**
   * Clean up resources when plugin is unloaded
   */
  cleanup?(): Promise<void> | void;
}
