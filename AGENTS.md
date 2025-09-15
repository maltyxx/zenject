# Repo Guidelines

## Coding Style
- All code and comments must be written in **English**.
- Use the existing Biome configuration for formatting. Run `bun run format` to auto format before committing.
- You may use `bun run lint` to automatically apply fixes.
- Ensure TypeScript type checking passes by running `bun run typecheck`.
- This project targets **BunJS**, not NodeJS. Avoid using the `node:` protocol and prefer Bun's native imports.

## Testing
- Execute `bun test` to run the test suite. Tests should pass before committing.

## Commit Messages
- Write commit messages in English and follow the [Conventional Commits](https://www.conventionalcommits.org/) format.

