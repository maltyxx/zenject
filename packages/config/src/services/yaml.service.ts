import { Injectable } from "@zenject/core";

/**
 * YAML Service using BunJS native implementation
 */
@Injectable()
export class YamlService {
  public async importFile<T = Record<string, unknown>>(
    filePath: string,
  ): Promise<T> {
    try {
      const resolvedPath = filePath.startsWith("/")
        ? filePath
        : new URL(filePath, `file://${process.cwd()}/`).pathname;

      const imported = await import(resolvedPath);
      return imported.default as T;
    } catch (error) {
      throw new YamlImportError(
        `Failed to import YAML from ${filePath}: ${this.getErrorMessage(error)}`,
      );
    }
  }

  public parseContent<T = Record<string, unknown>>(content: string): T {
    try {
      return Bun.YAML.parse(content) as T;
    } catch (error) {
      throw new YamlParseError(
        `Failed to parse YAML content: ${this.getErrorMessage(error)}`,
      );
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    if (error && typeof error === "object") {
      return JSON.stringify(error);
    }
    return `Unknown error occurred: ${String(error)}`;
  }
}

export class YamlImportError extends Error {
  public readonly name = "YamlImportError";

  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, YamlImportError.prototype);
  }
}

export class YamlParseError extends Error {
  public readonly name = "YamlParseError";

  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, YamlParseError.prototype);
  }
}
