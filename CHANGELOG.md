# Changelog

## [Unreleased]

### Improvements

#### Typing and API
- Fixed `ModuleOptions.imports` typing to properly support `(Constructor | DynamicModule)[]`
- Fixed provider registration with consistent handling of the `singleton` parameter
- Complete asynchronous support for lifecycle methods (`onInit`/`onDestroy`)
- Improved re-export of providers from imported modules

#### Testing
- Support for `Symbol` type tokens in `createTestingContainer`

#### Plugins
- Support for named exports in `PluginManager` (not just `default` exports)

#### Other
- CLI was already Windows compatible with appropriate fallback mechanisms
- Support for reloading the lock file after workspace modifications

### Bug Fixes
- Fixed lifecycle method calls for factory provider results
- Fixed `any` types replaced with `unknown` for better security

### Performance
- Use of `registerSingleton` instead of `register` for singleton services for better performance 