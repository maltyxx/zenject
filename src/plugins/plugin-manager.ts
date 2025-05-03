import { loadModule } from "../decorators/module";
import type { Constructor } from "../types/constructor.type";
import type { DynamicModule } from "../types/dynamic-module.interface";

/**
 * Registry of available plugins.
 */
const pluginRegistry = new Map<string, () => Promise<{ default: Constructor | DynamicModule }>>();

/**
 * Registry of loaded plugins
 */
const loadedPlugins = new Set<string>();

/**
 * Plugin Manager for dynamically loading modules and plugins.
 * Provides a way to lazily load plugins only when needed.
 */
export class PluginManager {
  /**
   * Register a plugin for later use
   * 
   * @param name Plugin name
   * @param loader Function that loads the plugin module
   */
  public static register(
    name: string, 
    loader: () => Promise<{ default: Constructor | DynamicModule }>
  ): void {
    pluginRegistry.set(name, loader);
  }

  /**
   * Check if a plugin is registered
   * 
   * @param name Plugin name
   * @returns True if the plugin is registered
   */
  public static isRegistered(name: string): boolean {
    return pluginRegistry.has(name);
  }

  /**
   * Check if a plugin is loaded
   * 
   * @param name Plugin name
   * @returns True if the plugin is loaded
   */
  public static isLoaded(name: string): boolean {
    return loadedPlugins.has(name);
  }

  /**
   * Load a plugin by name
   * 
   * @param name Plugin name
   * @returns A promise that resolves when the plugin is loaded
   * @throws Error if the plugin is not registered
   * 
   * @example
   * // Load a plugin
   * await PluginManager.load('redis');
   */
  public static async load(name: string): Promise<void> {
    if (loadedPlugins.has(name)) {
      return; // Already loaded
    }

    const loader = pluginRegistry.get(name);
    if (!loader) {
      throw new Error(`Plugin '${name}' is not registered`);
    }

    const module = await loader();
    loadModule(module.default);
    loadedPlugins.add(name);
  }

  /**
   * Get list of registered plugin names
   * 
   * @returns Array of plugin names
   */
  public static getRegisteredPlugins(): string[] {
    return Array.from(pluginRegistry.keys());
  }

  /**
   * Get list of loaded plugin names
   * 
   * @returns Array of plugin names
   */
  public static getLoadedPlugins(): string[] {
    return Array.from(loadedPlugins);
  }
} 