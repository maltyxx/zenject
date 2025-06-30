#!/usr/bin/env bun

// biome-ignore lint/style/useNodejsImportProtocol: bun-compatible imports
import { join, resolve } from "path";
// biome-ignore lint/style/useNodejsImportProtocol: bun-compatible imports
import { parseArgs } from "util";
// bun supports importing Node built-ins without the node: prefix
// biome-ignore lint/style/useNodejsImportProtocol: bun-compatible imports
import { mkdir } from "fs/promises";

const TEMPLATE_DIR = join(import.meta.dir, "templates");

/**
 * Define command interface
 */
interface Command {
  name: string;
  description: string;
  examples: string[];
  execute: (
    name: string,
    options: { path: string; force: boolean },
  ) => Promise<void>;
}

/**
 * Commands registry
 */
const commands: Record<string, Command> = {
  "new:module": {
    name: "new:module",
    description: "Generate a new module",
    examples: ["zenject new:module logger"],
    execute: generateModule,
  },
  "new:service": {
    name: "new:service",
    description: "Generate a new service",
    examples: ["zenject new:service user"],
    execute: generateService,
  },
  "new:app": {
    name: "new:app",
    description: "Generate a new application",
    examples: ["zenject new:app api --path apps"],
    execute: generateApp,
  },
};

/**
 * Print help message dynamically based on available commands
 */
function printHelp() {
  const commandsList = Object.values(commands)
    .map((cmd) => `  ${cmd.name} <n>`.padEnd(20) + cmd.description)
    .join("\n");

  const examplesList = Object.values(commands)
    .flatMap((cmd) => cmd.examples)
    .join("\n  ");

  console.log(`
Zenject CLI - Generate components for your Zenject application

Usage:
  zenject <command> <n> [options]

Commands:
${commandsList}

Options:
  -h, --help          Show this help message
  -p, --path <path>   Specify output directory (default: src)
  -f, --force         Force overwrite if files already exist

Examples:
  ${examplesList}
`);
}

/**
 * CLI for Zenject framework.
 * Provides commands for generating modules, services, etc.
 */
async function main() {
  try {
    // Use parseArgs with Bun.argv - recommended by Bun docs
    const { positionals, values } = parseArgs({
      args: Bun.argv.slice(2),
      allowPositionals: true,
      options: {
        help: { type: "boolean", short: "h" },
        path: { type: "string", short: "p", default: "src" },
        force: { type: "boolean", short: "f", default: false },
      },
    });

    if (values.help || positionals.length === 0) {
      printHelp();
      return;
    }

    const command = positionals[0] as string;
    const name = positionals[1] as string;

    if (!name) {
      console.error("Error: Name is required");
      printHelp();
      return;
    }

    // Look up the command in the registry
    const cmdHandler = commands[command];
    if (cmdHandler) {
      await cmdHandler.execute(name, {
        path: values.path,
        force: values.force,
      });
    } else {
      console.error(`Unknown command: ${command}`);
      printHelp();
    }
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

/**
 * Safely write file, checking if it exists first
 *
 * @param filePath Path to write to
 * @param content Content to write
 * @param force Whether to force overwrite
 * @returns Whether the file was written
 */
async function safeWriteFile(
  filePath: string,
  content: string,
  force = false,
): Promise<boolean> {
  // Check if file exists with Bun.file
  const file = Bun.file(filePath);
  const exists = await file.exists();

  // File exists, check if force flag is set
  if (exists && !force) {
    console.warn(`File already exists: ${filePath}`);
    console.warn("Use --force or -f to overwrite");
    return false;
  }

  // Write the file with Bun.write (optimized native API)
  // Use createPath: true to create directories automatically (Bun 1.1+)
  await Bun.write(filePath, content, { createPath: true });
  return true;
}

/**
 * Create directory using Bun Shell or mkdir as fallback
 *
 * @param dir Directory path to create
 */
async function makeDirectory(dir: string): Promise<void> {
  try {
    // Use Bun Shell to create the directory
    // Wrapped in try/catch for Windows compatibility
    await Bun.$`mkdir -p ${dir}`;
  } catch (err) {
    // Fallback to fs/promises if shell command fails or doesn't exist
    try {
      await mkdir(dir, { recursive: true });
    } catch (mkdirErr) {
      const msg = (mkdirErr as Error).message;
      throw new Error(`Failed to create directory: ${dir}, reason: ${msg}`);
    }
  }
}

/**
 * Generate a module
 *
 * @param name Module name
 * @param options Generation options
 */
async function generateModule(
  name: string,
  options: { path: string; force: boolean },
): Promise<void> {
  const { path: basePath, force } = options;
  const moduleName = formatName(name);
  const className = `${pascalCase(moduleName)}Module`;

  // Create paths
  const dirPath = join(basePath, moduleName);
  const filePath = join(dirPath, `${moduleName}.module.ts`);

  // Create content from template
  const template = await getTemplate("module.template.ts");
  const content = template
    .replace(/\$\{MODULE_NAME\}/g, moduleName)
    .replace(/\$\{CLASS_NAME\}/g, className);

  // Create directory and write file
  await makeDirectory(dirPath);
  const fileWritten = await safeWriteFile(filePath, content, force);

  if (fileWritten) {
    console.log(`Module generated: ${filePath}`);
  }

  // Generate index file if it doesn't exist
  const indexPath = join(dirPath, "index.ts");
  // Use Bun.file to check if file exists
  if (!(await Bun.file(indexPath).exists())) {
    await safeWriteFile(
      indexPath,
      `export * from "./${moduleName}.module";\n`,
      force,
    );
    console.log(`Index file generated: ${indexPath}`);
  }

  // Update workspace configuration if needed
  await updateWorkspaceIfNeeded(dirPath);
}

/**
 * Generate a service
 *
 * @param name Service name
 * @param options Generation options
 */
async function generateService(
  name: string,
  options: { path: string; force: boolean },
): Promise<void> {
  const { path: basePath, force } = options;
  const serviceName = formatName(name);
  const className = `${pascalCase(serviceName)}Service`;

  // Create paths
  const dirPath = join(basePath, serviceName);
  const filePath = join(dirPath, `${serviceName}.service.ts`);
  const testPath = join(dirPath, `${serviceName}.service.test.ts`);

  // Create content from templates
  const serviceTemplate = await getTemplate("service.template.ts");
  const testTemplate = await getTemplate("service.test.template.ts");

  const serviceContent = serviceTemplate
    .replace(/\$\{SERVICE_NAME\}/g, serviceName)
    .replace(/\$\{CLASS_NAME\}/g, className);

  const testContent = testTemplate
    .replace(/\$\{SERVICE_NAME\}/g, serviceName)
    .replace(/\$\{CLASS_NAME\}/g, className);

  // Create directory and write files
  await makeDirectory(dirPath);
  const serviceWritten = await safeWriteFile(filePath, serviceContent, force);
  const testWritten = await safeWriteFile(testPath, testContent, force);

  if (serviceWritten) {
    console.log(`Service generated: ${filePath}`);
  }

  if (testWritten) {
    console.log(`Test generated: ${testPath}`);
  }

  // Generate index file if it doesn't exist
  const indexPath = join(dirPath, "index.ts");
  // Use Bun.file to check if file exists
  if (!(await Bun.file(indexPath).exists())) {
    await safeWriteFile(
      indexPath,
      `export * from "./${serviceName}.service";\n`,
      force,
    );
    console.log(`Index file generated: ${indexPath}`);
  }

  // Update workspace configuration if needed
  await updateWorkspaceIfNeeded(dirPath);
}

/**
 * Generate a new application
 *
 * @param name Application name
 * @param options Generation options
 */
async function generateApp(
  name: string,
  options: { path: string; force: boolean },
): Promise<void> {
  const { path: basePath, force } = options;
  const appName = formatName(name);
  const className = `${pascalCase(appName)}App`;

  // Create paths
  const dirPath = join(basePath, appName);
  const appPath = join(dirPath, `${appName}.ts`);
  const modulePath = join(dirPath, `${appName}.module.ts`);
  const configPath = join(dirPath, "config.ts");

  // Create content from templates
  const appTemplate = await getTemplate("app.template.ts");
  const moduleTemplate = await getTemplate("app-module.template.ts");
  const configTemplate = await getTemplate("config.template.ts");

  const appContent = appTemplate
    .replace(/\$\{APP_NAME\}/g, appName)
    .replace(/\$\{CLASS_NAME\}/g, className);

  const moduleContent = moduleTemplate
    .replace(/\$\{APP_NAME\}/g, appName)
    .replace(/\$\{CLASS_NAME\}/g, `${pascalCase(appName)}Module`);

  const configContent = configTemplate.replace(
    /\$\{APP_NAME\}/g,
    appName.toUpperCase(),
  );

  // Create directory and write files
  await makeDirectory(dirPath);
  const appWritten = await safeWriteFile(appPath, appContent, force);
  const moduleWritten = await safeWriteFile(modulePath, moduleContent, force);
  const configWritten = await safeWriteFile(configPath, configContent, force);

  if (appWritten && moduleWritten && configWritten) {
    console.log(`Application generated: ${dirPath}`);
  } else {
    console.log(
      `Application partially generated: ${dirPath} (some files already existed)`,
    );
  }

  // Generate index file
  const indexPath = join(dirPath, "index.ts");
  const indexWritten = await safeWriteFile(
    indexPath,
    `export * from "./${appName}";\nexport * from "./${appName}.module";\nexport * from "./config";\n`,
    force,
  );

  if (indexWritten) {
    console.log(`Index file generated: ${indexPath}`);
  }

  // Update workspace configuration if needed
  await updateWorkspaceIfNeeded(dirPath);
}

/**
 * Get template file content
 *
 * @param templateName Template filename
 * @returns Template content
 */
async function getTemplate(templateName: string): Promise<string> {
  const path = join(TEMPLATE_DIR, templateName);
  try {
    // Use Bun.file to read the template
    return await Bun.file(path).text();
  } catch (err) {
    throw new Error(`Template not found: ${templateName}`);
  }
}

/**
 * Format a name to kebab-case
 *
 * @param name Input name
 * @returns Kebab-case name
 */
function formatName(name: string): string {
  return toKebabCase(name);
}

/**
 * Convert camelCase to kebab-case
 *
 * @param name CamelCase name
 * @returns Kebab-case name
 */
function camelToKebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/**
 * Convert any string format to kebab-case
 * Handles camelCase, PascalCase, snake_case, and space-separated strings
 *
 * @param name Input name in any format
 * @returns Kebab-case name
 */
function toKebabCase(name: string): string {
  return (
    name
      // Convert camelCase/PascalCase to have hyphens
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      // Convert PascalCase beginning to have hyphen if not at start
      .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
      // Replace underscores and spaces with hyphens
      .replace(/[\s_]+/g, "-")
      // Convert to lowercase
      .toLowerCase()
      // Remove any non-alphanumeric characters except hyphens
      .replace(/[^a-z0-9-]/g, "")
      // Remove any duplicate hyphens
      .replace(/-+/g, "-")
      // Remove leading/trailing hyphens
      .replace(/^-|-$/g, "")
  );
}

/**
 * Convert a name to PascalCase
 *
 * @param name Input name (kebab-case or other)
 * @returns PascalCase name
 */
function pascalCase(name: string): string {
  return name
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

/**
 * Update workspace configuration if needed
 * When generating in packages/ directories, ensure it's added to workspaces
 *
 * @param outputPath The path where files are generated
 */
async function updateWorkspaceIfNeeded(outputPath: string): Promise<void> {
  // Only handle packages/ directories
  if (!outputPath.startsWith("packages/")) {
    return;
  }

  try {
    // Determine the package name (packages/xxx)
    const pathParts = outputPath.split("/");
    const packagePath = `${pathParts[0]}/${pathParts[1]}`;

    // Find package.json in root
    const rootDir = resolve(".");
    const packageJsonPath = join(rootDir, "package.json");

    // Check if package.json exists using Bun.file
    const packageJsonFile = Bun.file(packageJsonPath);
    if (!(await packageJsonFile.exists())) {
      return; // If package.json doesn't exist, just return silently
    }

    // Read and parse package.json
    const packageJsonContent = await packageJsonFile.text();
    const packageJson = JSON.parse(packageJsonContent);

    // Check if workspaces array exists and add the package path if missing
    if (!packageJson.workspaces) {
      packageJson.workspaces = [packagePath];
    } else if (!Array.isArray(packageJson.workspaces)) {
      // If workspaces exists but is not an array, ensure it becomes one
      packageJson.workspaces = [packagePath];
    } else if (!packageJson.workspaces.includes(packagePath)) {
      packageJson.workspaces.push(packagePath);
    } else {
      // Already in workspaces, no change needed
      return;
    }

    // Write updated package.json using Bun.write
    await Bun.write(
      packageJsonPath,
      `${JSON.stringify(packageJson, null, 2)}\n`,
    );

    console.log(`Updated workspaces in package.json to include ${packagePath}`);

    // Run bun install silently to update lockfile
    try {
      await Bun.$`bun install --silent`;
      console.log("Updated bun.lockb with new workspace");
    } catch (err) {
      const msg = (err as Error).message;
      console.warn(`Note: Failed to update lockfile: ${msg}`);
    }
  } catch (err) {
    // Log but don't fail if workspace update fails
    const msg = (err as Error).message;
    console.warn(`Note: Could not update workspaces in package.json: ${msg}`);
  }
}

// Run CLI (using ESM import.meta.main)
if (import.meta.main) {
  main().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
}
