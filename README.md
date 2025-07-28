# Adhesive

Adhesive is a modern, performant, lightweight, dependency free library that provides advanced sticky positioning for web elements with cross-platform compatibility and framework-specific adapters.

[![npm version](https://img.shields.io/npm/v/@adhesivejs/core?color=4c207d)](https://npmjs.com/package/@adhesivejs/core)
[![jsr version](https://img.shields.io/jsr/v/@adhesivejs/core?color=4c207d)](https://jsr.io/@adhesivejs/core)
[![npm downloads](https://img.shields.io/npm/dm/@adhesivejs/core?color=4c207d)](https://npm.chart.dev/@adhesivejs/core)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@adhesivejs/core?color=4c207d)](https://bundlephobia.com/package/@adhesivejs/core)
[![license](https://img.shields.io/github/license/adhesivejs/adhesive?color=4c207d)](https://github.com/adhesivejs/adhesive/blob/main/LICENSE)

## ✨ Features

- **🚀 Modern** - Built with TypeScript, distributed as ESM only
- **📦 Lightweight** - Zero dependencies, minimal bundle size
- **🔧 Flexible** - Supports top/bottom positioning with customizable offsets and boundaries
- **⚡ Performance** - Optimized for smooth scrolling with efficient DOM updates using RequestAnimationFrame and ResizeObserver
- **🎯 Type Safe** - Full TypeScript support with comprehensive type definitions
- **🌍 Cross Platform** - Works across all modern browsers and devices
- **🎨 Framework Ready** - Core library with framework specific adapters
- **🖥️ SSR Friendly** - Handles server-side rendering environments gracefully

## 📦 Packages

This monorepo contains multiple packages for different use cases:

| Package | Description | README | NPM | JSR
|---------|-------------|---------|-----|-----
| [`@adhesivejs/core`](./packages/core) | Core library | [📖 README](./packages/core/README.md) | [![npm version](https://img.shields.io/npm/v/@adhesivejs/core?color=4c207d)](https://npmjs.com/package/@adhesivejs/core) | [![jsr version](https://img.shields.io/jsr/v/@adhesivejs/core?color=4c207d)](https://jsr.io/@adhesivejs/core)
| [`@adhesivejs/react`](./packages/react) | React adapter | [📖 README](./packages/react/README.md) | [![npm version](https://img.shields.io/npm/v/@adhesivejs/react?color=4c207d)](https://npmjs.com/package/@adhesivejs/react) | [![jsr version](https://img.shields.io/jsr/v/@adhesivejs/react?color=4c207d)](https://jsr.io/@adhesivejs/react)
| [`@adhesivejs/vue`](./packages/vue) | Vue adapter | [📖 README](./packages/vue/README.md) | [![npm version](https://img.shields.io/npm/v/@adhesivejs/vue?color=4c207d)](https://npmjs.com/package/@adhesivejs/vue) | [![jsr version](https://img.shields.io/jsr/v/@adhesivejs/vue?color=4c207d)](https://jsr.io/@adhesivejs/vue)

## 🏎️ Quick Install

```sh
# core
npx nypm install @adhesivejs/core

# react
npx nypm install @adhesivejs/react

# vue
npx nypm install @adhesivejs/vue

```

## 🎨 Usage

### Core (Vanilla JavaScript/TypeScript)

```ts
import { Adhesive } from '@adhesivejs/core';

Adhesive.create({ targetEl: '#target-element' });
```

### React

#### React Component Example

```tsx
import { AdhesiveContainer } from '@adhesivejs/react';

export function App() {
  return (
    <div>
      <AdhesiveContainer position="top">
        <header>This header will stick to the top</header>
      </AdhesiveContainer>

      <main>
        <p>Your main content here...</p>
      </main>
    </div>
  );
}
```

#### React Hook Example

```tsx
import { useAdhesive } from '@adhesivejs/react';
import { useRef } from 'react';

export function App() {
  const targetRef = useRef<HTMLElement>(null);

  useAdhesive(targetRef, { position: 'top' });

  return (
    <div>
      <header ref={targetRef}>This header will stick to the top</header>

      <main>
        <p>Your main content here...</p>
      </main>
    </div>
  );
}
```

### Vue

#### Vue Component Example

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

#### Vue Composable Example

```vue
<script setup lang="ts">
import { useAdhesive } from '@adhesivejs/vue';
import { useTemplateRef } from 'vue';

const targetRef = useTemplateRef('target');

useAdhesive(targetRef, { position: 'top' });
</script>

<template>
  <div>
    <header ref="target">This header will stick to the top</header>

    <main>
      <p>Your main content here...</p>
    </main>
  </div>
</template>
```

#### Vue Directive Example

```vue
<script setup lang="ts">
import { vAdhesive } from '@adhesivejs/vue';
</script>

<template>
  <div>
    <header v-adhesive>This header will stick to the top</header>

    <main>
      <p>Your main content here...</p>
    </main>
  </div>
</template>
```

## 🏗️ Development

This project uses pnpm workspaces for monorepo management.

```sh
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Start development playgrounds
pnpm playground:core  # Core playground
pnpm playground:react # React playground
pnpm playground:vue   # Vue playground

# Lint all packages
pnpm lint

# Type check all packages
pnpm type-check
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
