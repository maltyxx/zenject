# Zenject

![Built for Bun](https://img.shields.io/badge/Built%20for-Bun-blueviolet?logo=bun)

A lightweight dependency injection framework for Bun.js and TypeScript applications.

## Features

- 🚀 **Lightweight and Fast**: Minimal runtime overhead
- 🧩 **Module-Based Architecture**: Inspired by Angular/NestJS-style DI, but fully modular and framework-agnostic
- 🔄 **Lifecycle Hooks**: Support for `onInit` and `onDestroy`
- 🧠 **Lazy Loading**: Modules are initialized on demand
- 📦 **Clean TypeScript Support**: Full type safety

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
