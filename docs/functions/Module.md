[**Zenject - Lightweight DI Framework v0.1.0**](../README.md)

***

[Zenject - Lightweight DI Framework](../globals.md) / Module

# Function: Module()

> **Module**(`options?`): `ClassDecorator`

Defined in: decorators/module.ts:55

Module decorator that registers dependencies in the container.
This decorator enables dependency injection for the decorated class
and registers all providers specified in the options.

## Parameters

### options?

[`ModuleOptions`](../interfaces/ModuleOptions.md) = `{}`

Module configuration options

## Returns

`ClassDecorator`

A class decorator function

## Examples

```ts
// Basic usage
@Module({
  providers: [UserService, AuthService]
})
export class UserModule {}
```

```ts
// With imported modules
@Module({
  imports: [CommonModule, ConfigModule],
  providers: [UserService, AuthService]
})
export class AppModule {}
```
