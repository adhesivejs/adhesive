# Adhesive Svelte

Svelte adapter for Adhesive - A modern, performant, lightweight, dependency free, cross platform solution for flexible sticky positioned elements.

[![npm version](https://img.shields.io/npm/v/@adhesivejs/svelte?color=4c207d)](https://npmjs.com/package/@adhesivejs/svelte)
[![jsr version](https://img.shields.io/jsr/v/@adhesivejs/svelte?color=4c207d)](https://jsr.io/@adhesivejs/svelte)
[![npm downloads](https://img.shields.io/npm/dm/@adhesivejs/svelte?color=4c207d)](https://npm.chart.dev/@adhesivejs/svelte)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@adhesivejs/svelte?color=4c207d)](https://bundlephobia.com/package/@adhesivejs/svelte)
[![license](https://img.shields.io/github/license/adhesivejs/adhesive?color=4c207d)](https://github.com/adhesivejs/adhesive/blob/main/LICENSE)

## 🛠️ Installation

```sh
# ✨ Auto-detect
npx nypm install @adhesivejs/svelte

# npm
npm install @adhesivejs/svelte

# yarn
yarn add @adhesivejs/svelte

# pnpm
pnpm install @adhesivejs/svelte

# bun
bun install @adhesivejs/svelte

# deno
deno install @adhesivejs/svelte
```

## 🎨 Usage

### Basic Example

```svelte
<script setup lang="ts">
import { AdhesiveContainer } from '@adhesivejs/svelte';
</script>

<template>
  <div>
    <AdhesiveContainer position="top">
      <header>This header will stick to the top</header>
    </AdhesiveContainer>

    <main>
      <p>Your main content here...</p>
    </main>
  </div>
</template>
```

### Advanced Example with `useAdhesive` Composable

```svelte
<script setup lang="ts">
import { useAdhesive, type AdhesivePosition } from '@adhesivejs/svelte';
import { ref, useTemplateRef } from 'svelte';

const targetRef = useTemplateRef('target');
const boundingRef = useTemplateRef('bounding');
const enabled = ref(true);
const position = ref<AdhesivePosition>('top');

useAdhesive(
  targetRef,
  () => ({
    boundingEl: boundingRef.value,
    position: position.value,
    offset: 20,
    enabled: enabled.value,
    zIndex: 999,
    initialClassName: 'custom-initial',
    fixedClassName: 'custom-fixed',
    relativeClassName: 'custom-relative'
  })
);
</script>

<template>
  <div ref="bounding" style="height: 200vh">
    <button type="button" @click="enabled = !enabled">
      {{ enabled ? 'Disable' : 'Enable' }} Sticky
    </button>

    <button type="button" @click="position = position === 'top' ? 'bottom' : 'top'">
      Switch to {{ position === 'top' ? 'bottom' : 'top' }}
    </button>

    <div ref="target" class="sticky-element">
      <h2>Dynamic Sticky Element</h2>
      <p>Position: {{ position }} | Enabled: {{ enabled ? 'Yes' : 'No' }}</p>
    </div>

    <div style="height: 150vh; background: linear-gradient(to bottom, #f0f0f0, #ffffff)">
      <p>Scroll to see the sticky behavior in action!</p>
    </div>
  </div>
</template>
```

### API Reference

#### `AdhesiveContainer` Component

A simple wrapper component that automatically applies sticky positioning to its children.

**Props:**

- All props from `UseAdhesiveOptions` (see below)

> [!NOTE]
> Class props like `outerClassName`, `innerClassName`, `initialClassName`, `fixedClassName`, and `relativeClassName` become `outerClass`, `innerClass`, `initialClass`, `fixedClass`, and `relativeClass` in Svelte for brevity.

```svelte
<AdhesiveContainer
  position="bottom"
  :offset="30"
  class="custom-class"
>
  Content to make sticky
</AdhesiveContainer>
```

#### `useAdhesive` Composable

For more control over the sticky behavior with full Svelte reactivity support.

**Parameters:**

- `target`: Svelte template ref for the element that should become sticky
- `options`: Reactive configuration options (optional, can be a ref or getter function)

**UseAdhesiveOptions:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `boundingRef` | `TemplateRef` \| `HTMLElement` \| `string` | `document.body` | The element that defines the sticky boundaries |
| `boundingEl` | `HTMLElement` \| `string` | `document.body` | Alternative way to specify bounding element (for compatibility) |
| `position` | `'top' \| 'bottom'` | `'top'` | Where the element should stick |
| `offset` | `number` | `0` | Offset in pixels from the position |
| `zIndex` | `number` | `1` | Z-index for the fixed element |
| `enabled` | `boolean` | `true` | Whether to enable sticky behavior |
| `outerClassName` | `string` | `'adhesive__outer'` | Class for the outer wrapper |
| `innerClassName` | `string` | `'adhesive__inner'` | Class for the inner wrapper |
| `initialClassName` | `string` | `'adhesive--initial'` | Class when element is in its initial state |
| `fixedClassName` | `string` | `'adhesive--fixed'` | Class when element is sticky |
| `relativeClassName` | `string` | `'adhesive--relative'` | Class when element reaches its boundary |

#### `v-adhesive` Directive

A Svelte directive for applying sticky behavior directly to elements with minimal setup.

**Usage:**

```svelte
<!-- Basic usage -->
<div v-adhesive>Content</div>

<!-- With position argument -->
<div v-adhesive:bottom>Content</div>

<!-- With options -->
<div v-adhesive="{ offset: 20 }">Content</div>

<!-- With position and options -->
<div v-adhesive:top="{ offset: 10, zIndex: 999 }">Content</div>
```

**Directive Value:**

The directive accepts the same options as `UseAdhesiveOptions` (excluding `boundingRef`/`boundingEl` which you can provide as options).

**Directive Argument:**

- `:top` - Position the element at the top (default)
- `:bottom` - Position the element at the bottom

**Global Registration:**

```ts
import { vAdhesive } from '@adhesivejs/svelte';
import { createApp } from 'svelte';

const app = createApp(App);
app.directive('adhesive', vAdhesive);
```
