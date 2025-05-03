#!/usr/bin/env bun

import { parseArgs } from "node:util";
import { join, basename, dirname, relative } from "node:path";
import { mkdir, writeFile, readFile, stat } from "node:fs/promises";

const TEMPLATE_DIR = join(import.meta.dir, "templates");

/**
 * CLI for Zenject framework.
 * Provides commands for generating modules, services, etc.
 */
async function main() {
  try {
    const { positionals, values } = parseArgs({
      args: Bun.argv.slice(2),
      allowPositionals: true,
      options: {
        "help": { type: "boolean", short: "h" },
        "path": { type: "string", short: "p", default: "src" },
      }
    });

    if (values.help || positionals.length === 0) {
      printHelp();
      return;
    }

    const command = positionals[0];
    const name = positionals[1];

    if (!name) {
      console.error("Error: Name is required");
      printHelp();
      return;
    }

    switch (command) {
      case "new:module":
        await generateModule(name, values.path);
        break;
      case "new:service":
        await generateService(name, values.path);
        break;
      case "new:app":
        await generateApp(name, values.path);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        printHelp();
    }
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
Zenject CLI - Generate components for your Zenject application

Usage:
  zenject <command> <name> [options]

Commands:
  new:module <name>   Generate a new module
  new:service <name>  Generate a new service
  new:app <name>      Generate a new application

Options:
  -h, --help          Show this help message
  -p, --path <path>   Specify output directory (default: src)

Examples:
  zenject new:module logger
  zenject new:service user
  zenject new:app api --path apps
`);
}

/**
 * Generate a module
 * 
 * @param name Module name
 * @param basePath Base output path
 */
async function generateModule(name: string, basePath: string) {
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
  await mkdir(dirPath, { recursive: true });
  await writeFile(filePath, content);
  
  console.log(`Module generated: ${filePath}`);
  
  // Generate index file if it doesn't exist
  const indexPath = join(dirPath, "index.ts");
  try {
    await stat(indexPath);
  } catch (err) {
    await writeFile(indexPath, `export * from "./${moduleName}.module";\n`);
    console.log(`Index file generated: ${indexPath}`);
  }
}

/**
 * Generate a service
 * 
 * @param name Service name
 * @param basePath Base output path
 */
async function generateService(name: string, basePath: string) {
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
  await mkdir(dirPath, { recursive: true });
  await writeFile(filePath, serviceContent);
  await writeFile(testPath, testContent);
  
  console.log(`Service generated: ${filePath}`);
  console.log(`Test generated: ${testPath}`);
  
  // Generate index file if it doesn't exist
  const indexPath = join(dirPath, "index.ts");
  try {
    await stat(indexPath);
  } catch (err) {
    await writeFile(indexPath, `export * from "./${serviceName}.service";\n`);
    console.log(`Index file generated: ${indexPath}`);
  }
}

/**
 * Generate a new application
 * 
 * @param name Application name
 * @param basePath Base output path
 */
async function generateApp(name: string, basePath: string) {
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
  
  const configContent = configTemplate
    .replace(/\$\{APP_NAME\}/g, appName.toUpperCase());
  
  // Create directory and write files
  await mkdir(dirPath, { recursive: true });
  await writeFile(appPath, appContent);
  await writeFile(modulePath, moduleContent);
  await writeFile(configPath, configContent);
  
  console.log(`Application generated: ${dirPath}`);
  
  // Generate index file
  const indexPath = join(dirPath, "index.ts");
  await writeFile(indexPath, `export * from "./${appName}";\nexport * from "./${appName}.module";\nexport * from "./config";\n`);
  console.log(`Index file generated: ${indexPath}`);
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
    return await readFile(path, "utf-8");
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
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
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
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

// Run CLI
if (import.meta.main) {
  main().catch(err => {
    console.error("Error:", err);
    process.exit(1);
  });
} 