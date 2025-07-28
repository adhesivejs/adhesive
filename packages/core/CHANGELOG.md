# Changelog


## v0.3.0

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.2.4...v0.3.0)

### 🚀 Enhancements

- Add support for vue directive ([989d5d8](https://github.com/adhesivejs/adhesive/commit/989d5d8))

### 💅 Refactors

- Simplify vue element unwrapping ([c7ea4df](https://github.com/adhesivejs/adhesive/commit/c7ea4df))
- Improve type safety for runtime prop definitions ([8bebb4a](https://github.com/adhesivejs/adhesive/commit/8bebb4a))
- Improve ref element unwrapping ([794aed8](https://github.com/adhesivejs/adhesive/commit/794aed8))
- ⚠️  Drop bounding ref usage in vue component ([9b4776c](https://github.com/adhesivejs/adhesive/commit/9b4776c))

### 🏡 Chore

- Split release prepare step to dedicated script ([e56e271](https://github.com/adhesivejs/adhesive/commit/e56e271))
- Remove debug test ([431a403](https://github.com/adhesivejs/adhesive/commit/431a403))
- Only include dom types in packages ([d20d526](https://github.com/adhesivejs/adhesive/commit/d20d526))
- Reorder exports ([6fe5222](https://github.com/adhesivejs/adhesive/commit/6fe5222))
- Update vscode settings ([1e6b491](https://github.com/adhesivejs/adhesive/commit/1e6b491))

#### ⚠️ Breaking Changes

- ⚠️  Drop bounding ref usage in vue component ([9b4776c](https://github.com/adhesivejs/adhesive/commit/9b4776c))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.2.4

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.2.3...v0.2.4)

### 🚀 Enhancements

- Gracefully handle server side rendering ([f29e56b](https://github.com/adhesivejs/adhesive/commit/f29e56b))

### 💅 Refactors

- Simplify hook and composable implementations ([7f040b0](https://github.com/adhesivejs/adhesive/commit/7f040b0))

### 📖 Documentation

- Update project readme ([09df144](https://github.com/adhesivejs/adhesive/commit/09df144))
- Update simple init examples ([465b224](https://github.com/adhesivejs/adhesive/commit/465b224))

### 🏡 Chore

- Add homepage to packages ([fbe52cc](https://github.com/adhesivejs/adhesive/commit/fbe52cc))
- Update lockfile ([80bad57](https://github.com/adhesivejs/adhesive/commit/80bad57))

### ✅ Tests

- Add specs to validate update options ([61899bc](https://github.com/adhesivejs/adhesive/commit/61899bc))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.2.3

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.2.2...v0.2.3)

### 💅 Refactors

- Rename unwrap util ([c9758b3](https://github.com/adhesivejs/adhesive/commit/c9758b3))

### 📖 Documentation

- Add jsdoc for jsr ([f36ad02](https://github.com/adhesivejs/adhesive/commit/f36ad02))

### 🏡 Chore

- Add jsr badges ([26baec8](https://github.com/adhesivejs/adhesive/commit/26baec8))
- Remove automd ([e78c2a5](https://github.com/adhesivejs/adhesive/commit/e78c2a5))
- Trim files distributed to jsr ([16ed984](https://github.com/adhesivejs/adhesive/commit/16ed984))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.2.2

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.2.1...v0.2.2)

### 💅 Refactors

- Author vue component in pure typescript ([ef5a88e](https://github.com/adhesivejs/adhesive/commit/ef5a88e))

### 🏡 Chore

- Fix jsr publishing ([c08ef7c](https://github.com/adhesivejs/adhesive/commit/c08ef7c))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.2.1

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.2.0...v0.2.1)

### 💅 Refactors

- Rename init options function ([bfd6ca2](https://github.com/adhesivejs/adhesive/commit/bfd6ca2))

### 📖 Documentation

- Add download count to root readme ([5907f4e](https://github.com/adhesivejs/adhesive/commit/5907f4e))

### 🏡 Chore

- Add core playground ([3e7918e](https://github.com/adhesivejs/adhesive/commit/3e7918e))
- Support publishing to jsr ([15b72b2](https://github.com/adhesivejs/adhesive/commit/15b72b2))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.2.0

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.1.1...v0.2.0)

### 🚀 Enhancements

- Export core modules and types from integrations ([4942f12](https://github.com/adhesivejs/adhesive/commit/4942f12))
- Add special prop for passing refs to integrations ([bfa3069](https://github.com/adhesivejs/adhesive/commit/bfa3069))

### 🩹 Fixes

- Set active to false on cleanup ([49574e9](https://github.com/adhesivejs/adhesive/commit/49574e9))
- Ensure adhesive errors always have context ([cea57b9](https://github.com/adhesivejs/adhesive/commit/cea57b9))

### 💅 Refactors

- ⚠️  Clean up adhesive class and remove pointless element generics ([938351b](https://github.com/adhesivejs/adhesive/commit/938351b))
- ⚠️  Update integration usage to pass target as first param ([aec635a](https://github.com/adhesivejs/adhesive/commit/aec635a))

### 📖 Documentation

- Simplify examples ([333f27f](https://github.com/adhesivejs/adhesive/commit/333f27f))
- Display npm downloads ([b88fe32](https://github.com/adhesivejs/adhesive/commit/b88fe32))
- Add quick links to npm packages and install commands ([a4b7cd7](https://github.com/adhesivejs/adhesive/commit/a4b7cd7))
- Fix examples ([aafb1bf](https://github.com/adhesivejs/adhesive/commit/aafb1bf))

### 🏡 Chore

- Update default value notation in jsdoc ([acba041](https://github.com/adhesivejs/adhesive/commit/acba041))
- Lint fix ([951f22d](https://github.com/adhesivejs/adhesive/commit/951f22d))
- Update example selectors ([6b60e90](https://github.com/adhesivejs/adhesive/commit/6b60e90))
- Lint cleanup ([d2caaf5](https://github.com/adhesivejs/adhesive/commit/d2caaf5))

### ✅ Tests

- Add unit test suite ([999362b](https://github.com/adhesivejs/adhesive/commit/999362b))
- Improve unit test suite ([ee99555](https://github.com/adhesivejs/adhesive/commit/ee99555))

#### ⚠️ Breaking Changes

- ⚠️  Clean up adhesive class and remove pointless element generics ([938351b](https://github.com/adhesivejs/adhesive/commit/938351b))
- ⚠️  Update integration usage to pass target as first param ([aec635a](https://github.com/adhesivejs/adhesive/commit/aec635a))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.1.1

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.1.0...v0.1.1)

### 🚀 Enhancements

- Support updating width on resize ([0d96edf](https://github.com/adhesivejs/adhesive/commit/0d96edf))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.1.0

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.0.6...v0.1.0)

### 🩹 Fixes

- Be explicit about when to update options and memoize ([0188f38](https://github.com/adhesivejs/adhesive/commit/0188f38))
- Support updating options in-place ([6d5f192](https://github.com/adhesivejs/adhesive/commit/6d5f192))

### 💅 Refactors

- Simplify wrapper class names ([5555bf3](https://github.com/adhesivejs/adhesive/commit/5555bf3))
- ⚠️  Rename template refs to elements ([9bfa91b](https://github.com/adhesivejs/adhesive/commit/9bfa91b))

### 🏡 Chore

- Lint and update jsdoc ([be29e82](https://github.com/adhesivejs/adhesive/commit/be29e82))

### ✅ Tests

- Add dynamic position to playgrounds ([ea21637](https://github.com/adhesivejs/adhesive/commit/ea21637))

#### ⚠️ Breaking Changes

- ⚠️  Rename template refs to elements ([9bfa91b](https://github.com/adhesivejs/adhesive/commit/9bfa91b))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.0.6

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.0.5...v0.0.6)

### 🚀 Enhancements

- Support inner class name ([d982f3d](https://github.com/adhesivejs/adhesive/commit/d982f3d))
- Update default zindex value ([93d389d](https://github.com/adhesivejs/adhesive/commit/93d389d))

### 🩹 Fixes

- Apply outer and inner classes on init ([23d3afd](https://github.com/adhesivejs/adhesive/commit/23d3afd))
- Drop name from class props for vue ([870d582](https://github.com/adhesivejs/adhesive/commit/870d582))

### 📖 Documentation

- Update option defs ([2c73175](https://github.com/adhesivejs/adhesive/commit/2c73175))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.0.5

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.0.4...v0.0.5)

### 🚀 Enhancements

- Support bounding el prop on components ([aaf89a3](https://github.com/adhesivejs/adhesive/commit/aaf89a3))

### 🏡 Chore

- Avoid conflict with pnpm publish ([1dd807f](https://github.com/adhesivejs/adhesive/commit/1dd807f))
- Limit distributed files ([5343dc3](https://github.com/adhesivejs/adhesive/commit/5343dc3))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.0.4

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.0.3...v0.0.4)

### 📖 Documentation

- Use purple badge color ([e9dfa2e](https://github.com/adhesivejs/adhesive/commit/e9dfa2e))

### 🏡 Chore

- Use pnpm directly to publish ([3b57ed3](https://github.com/adhesivejs/adhesive/commit/3b57ed3))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.0.3

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.0.2...v0.0.3)

### 📖 Documentation

- Use matching badge color ([82f1d70](https://github.com/adhesivejs/adhesive/commit/82f1d70))

### 🤖 CI

- Add id write permission ([3c75ed4](https://github.com/adhesivejs/adhesive/commit/3c75ed4))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.0.2

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.0.1...v0.0.2)

### 📖 Documentation

- Add badges to readmes ([9452bb1](https://github.com/adhesivejs/adhesive/commit/9452bb1))
- Update badge color ([9d49879](https://github.com/adhesivejs/adhesive/commit/9d49879))

### 🤖 CI

- Enable automated releases ([9a71972](https://github.com/adhesivejs/adhesive/commit/9a71972))
- Release config updates ([150818e](https://github.com/adhesivejs/adhesive/commit/150818e))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.0.1


### 🏡 Chore

- Init ([f8599b3](https://github.com/adhesivejs/adhesive/commit/f8599b3))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

