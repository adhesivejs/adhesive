# Changelog


## v0.7.7

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.7.6...v0.7.7)

### 🚀 Enhancements

- **core:** Add ability to watch state changes ([843d825](https://github.com/adhesivejs/adhesive/commit/843d825))
- **vue:** Return reactive adhesive state from composable ([578663c](https://github.com/adhesivejs/adhesive/commit/578663c))
- **react:** Return reactive adhesive state from hook ([aacb88c](https://github.com/adhesivejs/adhesive/commit/aacb88c))
- **vue:** Emit state changes in adhesive component and expose on instance ([5732a52](https://github.com/adhesivejs/adhesive/commit/5732a52))
- **react:** Add on state change handler to adhesive component ([6fe798f](https://github.com/adhesivejs/adhesive/commit/6fe798f))

### 🩹 Fixes

- **core:** Init state change option ([a226c2e](https://github.com/adhesivejs/adhesive/commit/a226c2e))
- **core:** Ensure initial state is filled ([e6b2a75](https://github.com/adhesivejs/adhesive/commit/e6b2a75))

### 💅 Refactors

- **core:** Only expose adhesive status ([aabd26e](https://github.com/adhesivejs/adhesive/commit/aabd26e))
- Callback only on status change ([93cdae9](https://github.com/adhesivejs/adhesive/commit/93cdae9))

### 🏡 Chore

- Add directory to repository configs ([6d0a22f](https://github.com/adhesivejs/adhesive/commit/6d0a22f))
- Update dev deps ([b3abc5b](https://github.com/adhesivejs/adhesive/commit/b3abc5b))
- Update lint issues ([bdc01f9](https://github.com/adhesivejs/adhesive/commit/bdc01f9))
- **vue:** Update emits style ([341e447](https://github.com/adhesivejs/adhesive/commit/341e447))
- Revert vue playground ([25d38dd](https://github.com/adhesivejs/adhesive/commit/25d38dd))

### ✅ Tests

- Fix resize observer mocking ([2a1f2a7](https://github.com/adhesivejs/adhesive/commit/2a1f2a7))
- Update core module mocks ([88ea56d](https://github.com/adhesivejs/adhesive/commit/88ea56d))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.7.6

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.7.5...v0.7.6)

### 🚀 Enhancements

- Allow passing string as z-index for css computed property support ([a7dd473](https://github.com/adhesivejs/adhesive/commit/a7dd473))
- **core:** Update default z-index value to use computed property with fallback ([58c4acf](https://github.com/adhesivejs/adhesive/commit/58c4acf))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.7.5

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.7.4...v0.7.5)

### 🚀 Enhancements

- **core:** Add data attr for adhesive status ([91e993e](https://github.com/adhesivejs/adhesive/commit/91e993e))

### 🏡 Chore

- Update dev deps ([40e494f](https://github.com/adhesivejs/adhesive/commit/40e494f))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.7.4

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.7.3...v0.7.4)

### 📖 Documentation

- **vue:** Update bounding el description ([03d0575](https://github.com/adhesivejs/adhesive/commit/03d0575))

### 🏡 Chore

- Add publish config to each package ([5beb987](https://github.com/adhesivejs/adhesive/commit/5beb987))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.7.3

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.7.2...v0.7.3)

### 📖 Documentation

- **vue:** Remove bounding ref from options reference ([0552b35](https://github.com/adhesivejs/adhesive/commit/0552b35))

### 🏡 Chore

- Update deps ([3da2c59](https://github.com/adhesivejs/adhesive/commit/3da2c59))

### 🤖 CI

- Drop frozen lockfile flag as already enabled in ci ([9478580](https://github.com/adhesivejs/adhesive/commit/9478580))
- Support trusted publishing ([5f9416d](https://github.com/adhesivejs/adhesive/commit/5f9416d))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.7.2

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.7.1...v0.7.2)

### 📖 Documentation

- Formatting ([ce8f463](https://github.com/adhesivejs/adhesive/commit/ce8f463))
- **svelte:** Expand on svelte examples and api reference ([f5b9dda](https://github.com/adhesivejs/adhesive/commit/f5b9dda))

### 🏡 Chore

- Update deps ([662b99d](https://github.com/adhesivejs/adhesive/commit/662b99d))
- Formatting ([d4cc6c1](https://github.com/adhesivejs/adhesive/commit/d4cc6c1))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.7.1

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.7.0...v0.7.1)

### 🚀 Enhancements

- **svelte:** Add svelte adapter with attachment ([c5cebba](https://github.com/adhesivejs/adhesive/commit/c5cebba))

### 🩹 Fixes

- **vue:** Ensure adhesive direction options are partially required ([697c29a](https://github.com/adhesivejs/adhesive/commit/697c29a))

### 📖 Documentation

- Update example headings and use getter function for vue options ([ddf7b1d](https://github.com/adhesivejs/adhesive/commit/ddf7b1d))
- **svelte:** Add jsdoc for adhesive attachment ([8d183ea](https://github.com/adhesivejs/adhesive/commit/8d183ea))
- **svelte:** Update examples in readme ([23e4047](https://github.com/adhesivejs/adhesive/commit/23e4047))
- Update playground scripts ([27ef2c7](https://github.com/adhesivejs/adhesive/commit/27ef2c7))

### 🏡 Chore

- **vue:** Remove unused bounding ref type omission ([f953ea5](https://github.com/adhesivejs/adhesive/commit/f953ea5))
- Ensure eslint config and excluded from jsr dist ([0542cb4](https://github.com/adhesivejs/adhesive/commit/0542cb4))
- **vue:** Use bounding el from spread options ([90259f6](https://github.com/adhesivejs/adhesive/commit/90259f6))
- **svelte:** Export adhesive attachment options ([ded8205](https://github.com/adhesivejs/adhesive/commit/ded8205))

### ✅ Tests

- **svelte:** Add basic test suite ([f45d74d](https://github.com/adhesivejs/adhesive/commit/f45d74d))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.7.0

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.6.2...v0.7.0)

### 🚀 Enhancements

- **core:** Support dynamically updating bounding element for improved hmr ([ef975b3](https://github.com/adhesivejs/adhesive/commit/ef975b3))
- **vue:** Support hmr updates for adhesive elements ([570a42d](https://github.com/adhesivejs/adhesive/commit/570a42d))
- **react:** Support hmr updates for adhesive elements ([c89680e](https://github.com/adhesivejs/adhesive/commit/c89680e))

### 🔥 Performance

- **react:** Memoize options in `useAdhesive` hook ([03f9ff8](https://github.com/adhesivejs/adhesive/commit/03f9ff8))

### 💅 Refactors

- **vue:** ⚠️  Limit target usage be strictly ref objects and drop `boundingRef`` ([75d10e7](https://github.com/adhesivejs/adhesive/commit/75d10e7))
- **react:** ⚠️  Enforce ref object usage ([f7d9584](https://github.com/adhesivejs/adhesive/commit/f7d9584))

### 🏡 Chore

- Update deps ([e08f463](https://github.com/adhesivejs/adhesive/commit/e08f463))
- Use template ref in test suite ([6185f93](https://github.com/adhesivejs/adhesive/commit/6185f93))

### 🤖 CI

- Enable provenance for npm publishing ([fa8caa2](https://github.com/adhesivejs/adhesive/commit/fa8caa2))

#### ⚠️ Breaking Changes

- **vue:** ⚠️  Limit target usage be strictly ref objects and drop `boundingRef`` ([75d10e7](https://github.com/adhesivejs/adhesive/commit/75d10e7))
- **react:** ⚠️  Enforce ref object usage ([f7d9584](https://github.com/adhesivejs/adhesive/commit/f7d9584))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.6.2

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.6.1...v0.6.2)

### 🚀 Enhancements

- **core:** Add public method to replace options with defaults fallback ([00d6fd0](https://github.com/adhesivejs/adhesive/commit/00d6fd0))

### 🩹 Fixes

- **core:** Support multiple classes ([3718cdb](https://github.com/adhesivejs/adhesive/commit/3718cdb))
- **core:** Rerender class names for hmr support ([ee1d2ca](https://github.com/adhesivejs/adhesive/commit/ee1d2ca))
- Use replace options method for improved hmr support ([0739693](https://github.com/adhesivejs/adhesive/commit/0739693))

### ✅ Tests

- Remove explicit vitest imports ([e45b406](https://github.com/adhesivejs/adhesive/commit/e45b406))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.6.1

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.6.0...v0.6.1)

### 🩹 Fixes

- **core:** Ensure z-index is still set in relative position ([abe4323](https://github.com/adhesivejs/adhesive/commit/abe4323))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.6.0

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.5.0...v0.6.0)

### 🚀 Enhancements

- Add initial class name option ([00fcfdb](https://github.com/adhesivejs/adhesive/commit/00fcfdb))

### 🩹 Fixes

- **core:** Ensure previously set classes are removed ([4aac5fa](https://github.com/adhesivejs/adhesive/commit/4aac5fa))

### 💅 Refactors

- ⚠️  Rename state based class options ([8bb4c44](https://github.com/adhesivejs/adhesive/commit/8bb4c44))

#### ⚠️ Breaking Changes

- ⚠️  Rename state based class options ([8bb4c44](https://github.com/adhesivejs/adhesive/commit/8bb4c44))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.5.0

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.4.0...v0.5.0)

### 💅 Refactors

- **core:** ⚠️  Drastically simplify adhesive class and export positions ([ec60cda](https://github.com/adhesivejs/adhesive/commit/ec60cda))

### 📖 Documentation

- Add back jsdoc for jsr publishing ([bf8806d](https://github.com/adhesivejs/adhesive/commit/bf8806d))

### 🏡 Chore

- **core:** Update variable names and usage for readability ([59b1e70](https://github.com/adhesivejs/adhesive/commit/59b1e70))
- Use typescript for eslint configs ([cf8f388](https://github.com/adhesivejs/adhesive/commit/cf8f388))

### ✅ Tests

- Use shared helpers more often ([b50b5e8](https://github.com/adhesivejs/adhesive/commit/b50b5e8))
- Clean up tests ([b6579c1](https://github.com/adhesivejs/adhesive/commit/b6579c1))

#### ⚠️ Breaking Changes

- **core:** ⚠️  Drastically simplify adhesive class and export positions ([ec60cda](https://github.com/adhesivejs/adhesive/commit/ec60cda))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.4.0

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.3.4...v0.4.0)

### 🩹 Fixes

- **core:** ⚠️  Improve dimension updates and rename manual refresh method ([f5b15df](https://github.com/adhesivejs/adhesive/commit/f5b15df))
- **core:** Ensure inner width is update based on outer width ([0c45136](https://github.com/adhesivejs/adhesive/commit/0c45136))

### 💅 Refactors

- **core:** ⚠️  Clean up adhesive instance and simplify error constructor ([2a6b5b0](https://github.com/adhesivejs/adhesive/commit/2a6b5b0))
- **core:** ⚠️  Simplify state size updates and make names more clear ([fec2418](https://github.com/adhesivejs/adhesive/commit/fec2418))

#### ⚠️ Breaking Changes

- **core:** ⚠️  Improve dimension updates and rename manual refresh method ([f5b15df](https://github.com/adhesivejs/adhesive/commit/f5b15df))
- **core:** ⚠️  Clean up adhesive instance and simplify error constructor ([2a6b5b0](https://github.com/adhesivejs/adhesive/commit/2a6b5b0))
- **core:** ⚠️  Simplify state size updates and make names more clear ([fec2418](https://github.com/adhesivejs/adhesive/commit/fec2418))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.3.4

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.3.3...v0.3.4)

### 🔥 Performance

- **core:** Optimize resize observer event handler ([dd563f0](https://github.com/adhesivejs/adhesive/commit/dd563f0))

### 🩹 Fixes

- **core:** Remove warning when initializing a disabled instance ([80e9423](https://github.com/adhesivejs/adhesive/commit/80e9423))
- **core:** Prevent raf memory leaks ([0e52dcd](https://github.com/adhesivejs/adhesive/commit/0e52dcd))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.3.3

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.3.2...v0.3.3)

### 🩹 Fixes

- Support enabling and instance that starts disabled ([a412f90](https://github.com/adhesivejs/adhesive/commit/a412f90))

### 💅 Refactors

- **core:** Reduce bundle size and lower complexity ([f0872a7](https://github.com/adhesivejs/adhesive/commit/f0872a7))

### ✅ Tests

- Alias packages to not require building ([1fd1adc](https://github.com/adhesivejs/adhesive/commit/1fd1adc))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.3.2

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.3.1...v0.3.2)

### 🩹 Fixes

- **core:** Handle frozen option updates ([b07bfdb](https://github.com/adhesivejs/adhesive/commit/b07bfdb))

### 📖 Documentation

- Update performance bullet ([c3f088e](https://github.com/adhesivejs/adhesive/commit/c3f088e))

### 🏡 Chore

- Update vscode settings ([b6a0ace](https://github.com/adhesivejs/adhesive/commit/b6a0ace))

### ✅ Tests

- Use present voice in test descriptions ([20670bd](https://github.com/adhesivejs/adhesive/commit/20670bd))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

## v0.3.1

[compare changes](https://github.com/adhesivejs/adhesive/compare/v0.3.0...v0.3.1)

### 🩹 Fixes

- Remove global type augmenting ([af84c3f](https://github.com/adhesivejs/adhesive/commit/af84c3f))

### 📖 Documentation

- Update local directive usage example ([a6afce6](https://github.com/adhesivejs/adhesive/commit/a6afce6))
- Update example component names ([f115a6c](https://github.com/adhesivejs/adhesive/commit/f115a6c))

### 🏡 Chore

- Validate jsr publishing ([316c7c4](https://github.com/adhesivejs/adhesive/commit/316c7c4))

### 🤖 CI

- Remove custom name for git config step ([9ac89c6](https://github.com/adhesivejs/adhesive/commit/9ac89c6))

### ❤️ Contributors

- Daniel Waltz ([@danielwaltz](https://github.com/danielwaltz))

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

