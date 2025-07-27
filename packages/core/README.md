# Adhesive Core

A modern, performant, lightweight, dependency free, cross platform solution for flexible sticky positioned elements.

[![npm version](https://img.shields.io/npm/v/@adhesivejs/core?color=4c207d)](https://npmjs.com/package/@adhesivejs/core)
[![jsr version](https://img.shields.io/jsr/v/@adhesivejs/core?color=4c207d)](https://jsr.io/@adhesivejs/core)
[![npm downloads](https://img.shields.io/npm/dm/@adhesivejs/core?color=4c207d)](https://npm.chart.dev/@adhesivejs/core)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@adhesivejs/core?color=4c207d)](https://bundlephobia.com/package/@adhesivejs/core)
[![license](https://img.shields.io/github/license/adhesivejs/adhesive?color=4c207d)](https://github.com/adhesivejs/adhesive/blob/main/LICENSE)

## 🛠️ Installation

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

## 🎨 Usage

### Basic Example

```js
import { Adhesive } from '@adhesivejs/core';

// Simple sticky header
Adhesive.create({ targetEl: '#target-element' });
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
  outerClassName: 'custom-outer',
  innerClassName: 'custom-inner',
  activeClassName: 'custom-active',
  releasedClassName: 'custom-released'
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
| `zIndex` | `number` | `1` | Z-index for the fixed element |
| `enabled` | `boolean` | `true` | Whether to enable sticky behavior |
| `outerClassName` | `string` | `'adhesive__outer'` | Class for the outer wrapper |
| `innerClassName` | `string` | `'adhesive__inner'` | Class for the inner wrapper |
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
