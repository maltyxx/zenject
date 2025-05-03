**Zenject - Lightweight DI Framework v0.1.0**

***

# Zenject

A lightweight dependency injection framework for Bun.js and TypeScript applications.

## Features

- 🚀 **Lightweight and Fast**: Minimal runtime overhead
- 🧩 **Module-Based Architecture**: Similar to Angular DI system
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

See the [API Documentation](./docs/index.html) for detailed information about classes, interfaces, and functions.

## License

MIT
