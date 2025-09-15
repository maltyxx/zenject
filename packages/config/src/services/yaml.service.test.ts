import { beforeEach, describe, expect, it } from "bun:test";
import { createTestContext } from "@zenject/testing";
import "reflect-metadata";
import {
  YamlImportError,
  YamlParseError,
  YamlService,
} from "./yaml.service.js";

describe("YamlService", () => {
  let yamlService: YamlService;

  beforeEach(async () => {
    const { resolve } = await createTestContext({
      providers: [YamlService],
    });

    yamlService = resolve(YamlService);
  });

  describe("parseContent", () => {
    it("should parse valid YAML string", () => {
      const yamlContent = `
name: John Doe
age: 30
settings:
  theme: dark
  notifications: true
`;

      const result = yamlService.parseContent(yamlContent);

      expect(result).toEqual({
        name: "John Doe",
        age: 30,
        settings: {
          theme: "dark",
          notifications: true,
        },
      });
    });

    it("should parse empty YAML as null", () => {
      const result = yamlService.parseContent("");
      expect(result).toBeNull();
    });

    it("should parse YAML with arrays", () => {
      const yamlContent = `
users:
  - name: Alice
    role: admin
  - name: Bob
    role: user
`;

      const result = yamlService.parseContent(yamlContent);

      expect(result).toEqual({
        users: [
          { name: "Alice", role: "admin" },
          { name: "Bob", role: "user" },
        ],
      });
    });

    it("should handle YAML with different data types", () => {
      const yamlContent = `
string_value: "hello world"
number_value: 42
float_value: 3.14
boolean_true: true
boolean_false: false
null_value: null
`;

      const result = yamlService.parseContent(yamlContent);

      expect(result).toEqual({
        string_value: "hello world",
        number_value: 42,
        float_value: 3.14,
        boolean_true: true,
        boolean_false: false,
        null_value: null,
      });
    });

    it("should throw YamlParseError for invalid YAML", () => {
      const invalidYaml = `
invalid: yaml: content:
  - missing
    - proper
  indentation
`;

      expect(() => yamlService.parseContent(invalidYaml)).toThrow(
        YamlParseError,
      );
    });
  });

  describe("importFile", () => {
    it("should handle import errors gracefully", async () => {
      const invalidPath = "./invalid/path/to/file.yaml";

      try {
        await yamlService.importFile(invalidPath);
      } catch (error) {
        expect(error).toBeInstanceOf(YamlImportError);
        expect(error.message).toContain(invalidPath);
      }
    });
  });

  describe("type safety", () => {
    it("should support generic type parameters", () => {
      interface TestConfig {
        name: string;
        port: number;
        enabled: boolean;
      }

      const yamlContent = `
name: test-service
port: 8080
enabled: true
`;

      const result = yamlService.parseContent<TestConfig>(yamlContent);

      expect(typeof result.name).toBe("string");
      expect(typeof result.port).toBe("number");
      expect(typeof result.enabled).toBe("boolean");
    });
  });

  describe("error handling", () => {
    it("should create proper error instances", () => {
      const importError = new YamlImportError("test import error");
      expect(importError.name).toBe("YamlImportError");
      expect(importError.message).toBe("test import error");
      expect(importError).toBeInstanceOf(Error);

      const parseError = new YamlParseError("test parse error");
      expect(parseError.name).toBe("YamlParseError");
      expect(parseError.message).toBe("test parse error");
      expect(parseError).toBeInstanceOf(Error);
    });
  });
});
