# Adhesive Core

A modern, performant, lightweight, dependency free, cross platform solution for flexible sticky positioned elements.

<!-- automd:badges name="@adhesivejs/core" color="orange" bundlephobia license no-npmDownloads -->

[![npm version](https://img.shields.io/npm/v/@adhesivejs/core?color=orange)](https://npmjs.com/package/@adhesivejs/core)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@adhesivejs/core?color=orange)](https://bundlephobia.com/package/@adhesivejs/core)
[![license](https://img.shields.io/github/license/adhesivejs/adhesive?color=orange)](https://github.com/adhesivejs/adhesive/blob/main/LICENSE)

<!-- /automd -->

## 🛠️ Installation

<!-- automd:pm-install name="@adhesivejs/core" -->

```sh
# ✨ Auto-detect
npx nypm install @adhesivejs/core

# npm
npm install @adhesivejs/core

# yarn
yarn add @adhesivejs/core

# pnpm
pnpm install @adhesivejs/core

# bun
bun install @adhesivejs/core

# deno
deno install @adhesivejs/core
```

<!-- /automd -->

## 🎨 Usage

### Basic Example

```js
import { Adhesive } from '@adhesivejs/core';

// Simple sticky header
const adhesive = Adhesive.create({
  targetEl: '#header',
  offset: 20
});
```

### Advanced Example

```js
import { Adhesive } from '@adhesivejs/core';

// Advanced configuration with all options
const adhesive = new Adhesive({
  targetEl: document.querySelector('.sidebar'),
  boundingEl: '.main-content',
  position: 'bottom',
  offset: 20,
  zIndex: 999,
  className: 'custom-sticky',
  activeClassName: 'is-stuck',
  releasedClassName: 'is-released'
});

// Initialize the sticky behavior
adhesive.init();

// Listen to state changes
const state = adhesive.getState();
console.log('Is sticky:', state.isSticky);
console.log('Current status:', state.status);

// Update options dynamically
adhesive.updateOptions({
  offset: 50,
  position: 'top'
});

// Enable/disable
adhesive.disable();
adhesive.enable();

// Clean up when done
adhesive.cleanup();
```

### API Reference

#### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `targetEl` | `HTMLElement \| string` | Required | Element to make sticky or CSS selector |
| `boundingEl` | `HTMLElement \| string \| null` | `document.body` | Container that defines sticky boundaries |
| `position` | `'top' \| 'bottom'` | `'top'` | Where the element should stick |
| `offset` | `number` | `0` | Offset in pixels from the position |
| `zIndex` | `number` | `1000` | Z-index for the fixed element |
| `enabled` | `boolean` | `true` | Whether to enable sticky behavior |
| `className` | `string` | `''` | Extra CSS class for wrapper |
| `activeClassName` | `string` | `'adhesive--active'` | Class when element is sticky |
| `releasedClassName` | `string` | `'adhesive--released'` | Class when element returns to normal |

#### Methods

- `init()` - Initialize sticky behavior
- `enable()` - Enable sticky behavior
- `disable()` - Disable sticky behavior
- `updateOptions(options)` - Update configuration
- `getState()` - Get current state
- `cleanup()` - Remove all listeners and clean up

#### Static Methods

- `Adhesive.create(options)` - Create and initialize in one call
