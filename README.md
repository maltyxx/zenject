# Zenject

![Built for Bun](https://img.shields.io/badge/Built%20for-Bun-blueviolet?logo=bun)

A lightweight dependency injection framework for Bun.js and TypeScript applications.

## 🚀 Features at a Glance

### ⚡️ **Minimal & Performant**

Built on top of [`tsyringe`](https://github.com/microsoft/tsyringe) and [Bun.js](https://bun.sh), Zenject has **zero reflection overhead**, **no global metadata**, and a **fully synchronous resolution pipeline**.

### 🧩 **Modular Architecture**

Inspired by NestJS/Angular — but without the complexity. Use clean `@Module()` declarations with optional `imports` and `providers`.

### 🌀 **Lazy Loading by Default**

Modules are **registered only when explicitly loaded**, reducing memory usage and improving startup times — especially in CLI tools, microservices or event-driven apps.

### 🔁 **Lifecycle Hooks**

Built-in support for `onInit()` and `onDestroy()` lifecycle methods (sync or async), allowing clean startup/shutdown logic for any service.

### 🧠 **Fully Type-Safe**

Written in TypeScript from the ground up. All decorators and DI utilities are strongly typed. No `any`, no magic, no compromises.

### 📦 **Bun Workspace Friendly**

Designed for Bun monorepos using `workspaces`. Perfect for apps split into `packages/streamr`, `packages/logger`, `packages/core`, etc.

### 🧪 **Testable by Design**

Override any dependency using `AppContainer.registerInstance()` or custom test containers. Lifecycle is deterministic and isolated.

### 🧱 **POO & SOLID Principles First**

Supports clean separation of concerns, reusable services, and DI without decorators bloat — ideal for domain-driven design.

## Installation

```bash
bun add @maltyxx/zenject
```

## Basic Usage

```typescript
import { Module, AppContainer } from '@maltyxx/zenject';

// Define services
class UserService {
  getUsers() {
    return ['John', 'Jane'];
  }
}

// Create a module
@Module({
  providers: [UserService]
})
class AppModule {}

// Bootstrap the application
AppContainer.resolve(AppModule);

// Use the DI container
const userService = AppContainer.resolve(UserService);
console.log(userService.getUsers()); // ['John', 'Jane']
```

## Advanced Usage

### Modules with Imports

```typescript
@Module({
  providers: [LoggerService]
})
class LoggingModule {}

@Module({
  imports: [LoggingModule],
  providers: [UserService, AuthService]
})
class AppModule {}
```

### Manual Module Loading

```typescript
import { loadModule } from '@maltyxx/zenject';

// Explicitly load a module (triggers registration and lifecycle)
loadModule(AppModule);

// Now you can resolve its providers
const userService = AppContainer.resolve(UserService);
```

### Lifecycle Hooks

```typescript
import { OnInit, OnDestroy } from '@maltyxx/zenject';

@Module({
  providers: [ConfigService]
})
class AppModule {
  constructor(private configService: ConfigService) {}
}

class ConfigService implements OnInit, OnDestroy {
  onInit() {
    console.log('ConfigService initialized');
  }

  onDestroy() {
    console.log('ConfigService destroyed');
  }
}
```

## API Documentation

API documentation is generated using TypeDoc. To view:

```bash
# Generate docs
bun run docs

# View in ./docs directory
```

## License

MIT
