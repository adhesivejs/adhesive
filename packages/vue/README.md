# Adhesive Vue

Vue adapter for Adhesive - A modern, performant, lightweight, dependency free, cross platform solution for flexible sticky positioned elements.

[![npm version](https://img.shields.io/npm/v/@adhesivejs/vue?color=4c207d)](https://npmjs.com/package/@adhesivejs/vue)
[![jsr version](https://img.shields.io/jsr/v/@adhesivejs/vue?color=4c207d)](https://jsr.io/@adhesivejs/vue)
[![npm downloads](https://img.shields.io/npm/dm/@adhesivejs/vue?color=4c207d)](https://npm.chart.dev/@adhesivejs/vue)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@adhesivejs/vue?color=4c207d)](https://bundlephobia.com/package/@adhesivejs/vue)
[![license](https://img.shields.io/github/license/adhesivejs/adhesive?color=4c207d)](https://github.com/adhesivejs/adhesive/blob/main/LICENSE)

> [!WARNING]
> Vue 2 is not supported and is EOL (End of Life).

## 🛠️ Installation

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

## 🎨 Usage

### Basic Example

```vue
<script setup lang="ts">
import { AdhesiveContainer } from "@adhesivejs/vue";
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
import { useAdhesive, type AdhesivePosition } from "@adhesivejs/vue";
import { ref, useTemplateRef } from "vue";

const targetRef = useTemplateRef("target");
const boundingRef = useTemplateRef("bounding");
const enabled = ref(true);
const position = ref<AdhesivePosition>("top");

useAdhesive(targetRef, () => ({
  boundingEl: boundingRef.value,
  position: position.value,
  offset: 20,
  enabled: enabled.value,
  zIndex: 999,
  initialClassName: "custom-initial",
  fixedClassName: "custom-fixed",
  relativeClassName: "custom-relative",
}));
</script>

<template>
  <div ref="bounding" style="height: 200vh">
    <button type="button" @click="enabled = !enabled">
      {{ enabled ? "Disable" : "Enable" }} Sticky
    </button>

    <button
      type="button"
      @click="position = position === 'top' ? 'bottom' : 'top'"
    >
      Switch to {{ position === "top" ? "bottom" : "top" }}
    </button>

    <div ref="target" class="sticky-element">
      <h2>Dynamic Sticky Element</h2>
      <p>Position: {{ position }} | Enabled: {{ enabled ? "Yes" : "No" }}</p>
    </div>

    <div
      style="height: 150vh; background: linear-gradient(to bottom, #f0f0f0, #ffffff)"
    >
      <p>Scroll to see the sticky behavior in action!</p>
    </div>
  </div>
</template>
```

### Using the `v-adhesive` Directive

For simple use cases, you can use the `v-adhesive` directive directly on elements:

```vue
<script setup lang="ts">
import { vAdhesive } from "@adhesivejs/vue";
import { ref } from "vue";

const adhesiveOptions = ref({
  offset: 20,
  zIndex: 999,
  initialClassName: "custom-initial",
  fixedClassName: "custom-fixed",
  relativeClassName: "custom-relative",
});
</script>

<template>
  <div style="height: 200vh">
    <!-- Basic usage -->
    <div v-adhesive>
      <h2>Basic Sticky Element</h2>
    </div>

    <!-- With position argument -->
    <div v-adhesive:bottom>
      <p>This sticks to the bottom</p>
    </div>

    <!-- With reactive options -->
    <div v-adhesive="adhesiveOptions">
      <h3>Sticky with Custom Config</h3>
    </div>

    <!-- With position and options -->
    <div v-adhesive:top="{ offset: 10, zIndex: 1000 }">
      <header>Top Sticky Header</header>
    </div>

    <div
      style="height: 150vh; background: linear-gradient(to bottom, #f0f0f0, #ffffff)"
    >
      <p>Scroll to see the sticky behavior in action!</p>
    </div>
  </div>
</template>
```

#### Registering the Directive Globally

You can register the directive globally in your Vue app:

```ts
import { vAdhesive, type AdhesiveDirective } from "@adhesivejs/vue";
import { createApp } from "vue";
import App from "./App.vue";

const app = createApp(App);

// Register the directive globally
app.directive("adhesive", vAdhesive);

app.mount("#app");

// Optionally augment Vue global types for the directive
declare module "vue" {
  interface GlobalDirectives {
    vAdhesive: AdhesiveDirective;
  }
}
```

After global registration, you can use it without importing:

```vue
<template>
  <div v-adhesive:top="{ offset: 20 }">Globally available directive</div>
</template>
```

### API Reference

#### `AdhesiveContainer` Component

A simple wrapper component that automatically applies sticky positioning to its children.

**Props:**

- All props from `UseAdhesiveOptions` (see below)

> [!NOTE]
> Class props like `outerClassName`, `innerClassName`, `initialClassName`, `fixedClassName`, and `relativeClassName` become `outerClass`, `innerClass`, `initialClass`, `fixedClass`, and `relativeClass` in Vue for brevity.

```vue
<AdhesiveContainer position="bottom" :offset="30" class="custom-class">
  Content to make sticky
</AdhesiveContainer>
```

#### `useAdhesive` Composable

For more control over the sticky behavior with full Vue reactivity support.

**Parameters:**

- `target`: Vue template ref for the element that should become sticky
- `options`: Reactive configuration options (optional, can be a ref or getter function)

**UseAdhesiveOptions:**

| Option              | Type                      | Default                      | Description                                              |
| ------------------- | ------------------------- | ---------------------------- | -------------------------------------------------------- |
| `boundingEl`        | `HTMLElement` \| `string` | `document.body`              | The container element that constrains sticky positioning |
| `position`          | `'top' \| 'bottom'`       | `'top'`                      | Where the element should stick                           |
| `offset`            | `number`                  | `0`                          | Offset in pixels from the position                       |
| `zIndex`            | `number` \| `string`      | `var(--adhesive-z-index, 1)` | Z-index for the fixed element                            |
| `enabled`           | `boolean`                 | `true`                       | Whether to enable sticky behavior                        |
| `outerClassName`    | `string`                  | `'adhesive__outer'`          | Class for the outer wrapper                              |
| `innerClassName`    | `string`                  | `'adhesive__inner'`          | Class for the inner wrapper                              |
| `initialClassName`  | `string`                  | `'adhesive--initial'`        | Class when element is in its initial state               |
| `fixedClassName`    | `string`                  | `'adhesive--fixed'`          | Class when element is sticky                             |
| `relativeClassName` | `string`                  | `'adhesive--relative'`       | Class when element reaches its boundary                  |

#### `v-adhesive` Directive

A Vue directive for applying sticky behavior directly to elements with minimal setup.

**Usage:**

```vue
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

The directive accepts the same options as `UseAdhesiveOptions`.

**Directive Argument:**

- `:top` - Position the element at the top (default)
- `:bottom` - Position the element at the bottom

**Global Registration:**

```ts
import { vAdhesive } from "@adhesivejs/vue";
import { createApp } from "vue";

const app = createApp(App);
app.directive("adhesive", vAdhesive);
```
