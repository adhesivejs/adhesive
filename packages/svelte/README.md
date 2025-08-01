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
  import { adhesive } from "@adhesivejs/svelte";
</script>

<header {@attach adhesive({ position: "top" })}>
  This header will stick to the top
</header>

<main>
  <p>Your main content here...</p>
</main>
```
