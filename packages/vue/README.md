# Adhesive Vue

Vue adapter for Adhesive - A modern, performant, lightweight, dependency free, cross platform solution for flexible sticky positioned elements.

<!-- automd:badges name="@adhesivejs/vue" color="4c207d" bundlephobia license -->

[![npm version](https://img.shields.io/npm/v/@adhesivejs/vue?color=4c207d)](https://npmjs.com/package/@adhesivejs/vue)
[![npm downloads](https://img.shields.io/npm/dm/@adhesivejs/vue?color=4c207d)](https://npm.chart.dev/@adhesivejs/vue)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@adhesivejs/vue?color=4c207d)](https://bundlephobia.com/package/@adhesivejs/vue)
[![license](https://img.shields.io/github/license/adhesivejs/adhesive?color=4c207d)](https://github.com/adhesivejs/adhesive/blob/main/LICENSE)

<!-- /automd -->

<!-- Warning -->

> [!WARNING]
> Vue 2 is not supported and is EOL (End of Life).

## 🛠️ Installation

<!-- automd:pm-install name="@adhesivejs/vue" -->

```sh
# ✨ Auto-detect
npx nypm install @adhesivejs/vue

# npm
npm install @adhesivejs/vue

# yarn
yarn add @adhesivejs/vue

# pnpm
pnpm install @adhesivejs/vue

# bun
bun install @adhesivejs/vue

# deno
deno install @adhesivejs/vue
```

<!-- /automd -->

## 🎨 Usage

### Basic Example

```vue
<script setup lang="ts">
import { AdhesiveContainer } from '@adhesivejs/vue';
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

```vue
<script setup lang="ts">
import { useAdhesive, type AdhesivePosition } from '@adhesivejs/vue';
import { ref, useTemplateRef } from 'vue';

const targetEl = useTemplateRef('target');
const boundingEl = useTemplateRef('bounding');
const enabled = ref(true);
const position = ref<AdhesivePosition>('top');

useAdhesive(
  targetEl,
  () => ({
    boundingEl: boundingEl.value,
    position: position.value,
    offset: 20,
    enabled: enabled.value,
    zIndex: 999,
    activeClassName: 'custom-active',
    releasedClassName: 'custom-released'
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
> Class props like `outerClassName`, `innerClassName`, `activeClassName`, and `releasedClassName` are renamed to `outerClass`, `innerClass`, `activeClass`, and `releasedClass` in Vue for brevity.

```vue
<AdhesiveContainer
  position="bottom"
  :offset="30"
  class="custom-class"
>
  Content to make sticky
</AdhesiveContainer>
```

#### `useAdhesive` Composable

For more control over the sticky behavior with full Vue reactivity support.

**Parameters:**

- `target`: Vue template ref for the element that should become sticky
- `options`: Reactive configuration options (optional, can be a ref or getter function)

**UseAdhesiveOptions:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `boundingEl` | `TemplateRef` \| `string` | `undefined` | The element that defines the sticky boundaries |
| `position` | `'top' \| 'bottom'` | `'top'` | Where the element should stick |
| `offset` | `number` | `0` | Offset in pixels from the position |
| `zIndex` | `number` | `1` | Z-index for the fixed element |
| `enabled` | `boolean` | `true` | Whether to enable sticky behavior |
| `outerClassName` | `string` | `'adhesive__outer'` | Class for the outer wrapper |
| `innerClassName` | `string` | `'adhesive__inner'` | Class for the inner wrapper |
| `activeClassName` | `string` | `'adhesive--active'` | Class when element is sticky |
| `releasedClassName` | `string` | `'adhesive--released'` | Class when element returns to normal |
