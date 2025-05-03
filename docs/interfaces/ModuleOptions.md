[**Zenject - Lightweight DI Framework v0.1.0**](../README.md)

***

[Zenject - Lightweight DI Framework](../globals.md) / ModuleOptions

# Interface: ModuleOptions

Defined in: types/module-options.interface.ts:22

Configuration options for a module decorator.
 ModuleOptions

## Example

```ts
// Creating module options
const options: ModuleOptions = {
  imports: [LoggingModule, ConfigModule],
  providers: [UserService, AuthService]
};

// Using with the Module decorator
@Module({
  imports: [CommonModule],
  providers: [MyService]
})
export class AppModule {}
```

## Properties

### imports?

> `optional` **imports**: [`Constructor`](../type-aliases/Constructor.md)[]

Defined in: types/module-options.interface.ts:24

List of modules to import

***

### providers?

> `optional` **providers**: [`Constructor`](../type-aliases/Constructor.md)[]

Defined in: types/module-options.interface.ts:26

List of service providers to register
