# Adhesive

Adhesive is a modern, performant, lightweight, dependency free library that provides smooth, performant sticky positioning for web elements with cross-platform compatibility and framework-specific adapters.

[![npm version](https://img.shields.io/npm/v/@adhesivejs/core?color=4c207d)](https://npmjs.com/package/@adhesivejs/core)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@adhesivejs/core?color=4c207d)](https://bundlephobia.com/package/@adhesivejs/core)
[![license](https://img.shields.io/github/license/adhesivejs/adhesive?color=4c207d)](https://github.com/adhesivejs/adhesive/blob/main/LICENSE)

## ✨ Features

- **🚀 Modern & Fast** - Built with TypeScript, optimized with RequestAnimationFrame and ResizeObserver
- **📦 Lightweight** - Zero dependencies, minimal bundle size
- **🔧 Flexible** - Supports top/bottom positioning with customizable offsets and boundaries
- **⚡ Performance** - Optimized for smooth scrolling with efficient DOM updates
- **🎯 Type Safe** - Full TypeScript support with comprehensive type definitions
- **🌍 Cross Platform** - Works across all modern browsers and devices
- **🎨 Framework Ready** - Core library with React and Vue adapters

## 📦 Packages

This monorepo contains multiple packages for different use cases:

| Package | Description | README | NPM |
|---------|-------------|---------|-----|
| [`@adhesivejs/core`](./packages/core) | Core vanilla JavaScript/TypeScript library | [📖 Core README](./packages/core/README.md) | [![npm version](https://img.shields.io/npm/v/@adhesivejs/core?color=4c207d)](https://npmjs.com/package/@adhesivejs/core) |
| [`@adhesivejs/react`](./packages/react) | React hooks and components adapter | [📖 React README](./packages/react/README.md) | [![npm version](https://img.shields.io/npm/v/@adhesivejs/react?color=4c207d)](https://npmjs.com/package/@adhesivejs/react) |
| [`@adhesivejs/vue`](./packages/vue) | Vue composables and components adapter | [📖 Vue README](./packages/vue/README.md) | [![npm version](https://img.shields.io/npm/v/@adhesivejs/vue?color=4c207d)](https://npmjs.com/package/@adhesivejs/vue) |

## 🏎️ Quick Install

```sh
# Core
npx nypm install @adhesivejs/core
# React
npx nypm install @adhesivejs/react
# Vue
npx nypm install @adhesivejs/vue
```

## 🎨 Usage

### Core (Vanilla JavaScript/TypeScript)

```ts
import { Adhesive } from '@adhesivejs/core';

// Simple sticky header
const adhesive = Adhesive.create({ targetEl: '#header' });
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
  const targetEl = useRef<HTMLElement>(null);

  useAdhesive(targetEl, { position: 'top' });

  return (
    <div>
      <header ref={targetEl}>This header will stick to the top</header>

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

const targetEl = useTemplateRef('target');

useAdhesive(targetEl, { position: 'top' });
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
pnpm playground:react  # React playground
pnpm playground:vue    # Vue playground

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

