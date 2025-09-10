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
<script lang="ts">
  import { adhesive } from '@adhesivejs/svelte';
</script>

<header {@attach adhesive({ position: "top" })}>
  This header will stick to the top
</header>

<main>
  <p>Your main content here...</p>
</main>
```

### Advanced Example

```svelte
<script lang="ts">
  import { adhesive, type AdhesivePosition } from "@adhesivejs/svelte";

  let enabled = $state(true);
  let position = $state<AdhesivePosition>("top");
  let boundingEl = $state<HTMLElement | null>(null);
</script>

<div bind:this={boundingEl} style="height: 200vh">
  <button on:click={() => enabled = !enabled}>
    {enabled ? "Disable" : "Enable"} Sticky
  </button>

  <button on:click={() => position = position === "top" ? "bottom" : "top"}>
    Switch to {position === "top" ? "bottom" : "top"}
  </button>

  <div
    {@attach adhesive({
      boundingEl,
      position,
      offset: 20,
      enabled,
      zIndex: 999,
      initialClassName: "custom-initial",
      fixedClassName: "custom-fixed",
      relativeClassName: "custom-relative"
    })}
    class="sticky-element"
  >
    <h2>Dynamic Sticky Element</h2>
    <p>Position: {position} | Enabled: {enabled ? "Yes" : "No"}</p>
  </div>

  <div style="height: 150vh; background: linear-gradient(to bottom, #f0f0f0, #ffffff)">
    <p>Scroll to see the sticky behavior in action!</p>
  </div>
</div>
```

### API Reference

#### `adhesive` Attachment

A Svelte attachment that applies sticky positioning to elements with advanced configuration options.

**Parameters:**

- `options`: Configuration options (optional)

**AdhesiveAttachmentOptions:**

| Option              | Type                      | Default                | Description                                    |
| ------------------- | ------------------------- | ---------------------- | ---------------------------------------------- |
| `boundingEl`        | `HTMLElement` \| `string` | `document.body`        | The element that defines the sticky boundaries |
| `position`          | `'top' \| 'bottom'`       | `'top'`                | Where the element should stick                 |
| `offset`            | `number`                  | `0`                    | Offset in pixels from the position             |
| `zIndex`            | `number` \| `string`      | `1`                    | Z-index for the fixed element                  |
| `enabled`           | `boolean`                 | `true`                 | Whether to enable sticky behavior              |
| `outerClassName`    | `string`                  | `'adhesive__outer'`    | Class for the outer wrapper                    |
| `innerClassName`    | `string`                  | `'adhesive__inner'`    | Class for the inner wrapper                    |
| `initialClassName`  | `string`                  | `'adhesive--initial'`  | Class when element is in its initial state     |
| `fixedClassName`    | `string`                  | `'adhesive--fixed'`    | Class when element is sticky                   |
| `relativeClassName` | `string`                  | `'adhesive--relative'` | Class when element reaches its boundary        |

> Note: `zIndex` also accepts a CSS variable string, e.g. `"var(--adhesive-z)"`.

**Usage:**

```svelte
<!-- Basic usage -->
<div {@attach adhesive()}>Content</div>

<!-- With options -->
<div {@attach adhesive({ position: "bottom", offset: 30 })}>Content</div>

<!-- With reactive options -->
<div {@attach adhesive({
  position,
  enabled,
  offset: 20,
  zIndex: 999
  })}>Content</div>
```
