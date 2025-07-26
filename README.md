# Adhesive

Adhesive is a modern, performant, lightweight, dependency free library that provides smooth, performant sticky positioning for web elements with cross-platform compatibility and framework-specific adapters.

[![npm version](https://img.shields.io/npm/v/@adhesivejs/core?color=31afb1)](https://npmjs.com/package/@adhesivejs/core)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@adhesivejs/core?color=31afb1)](https://bundlephobia.com/package/@adhesivejs/core)
[![license](https://img.shields.io/github/license/adhesivejs/adhesive?color=31afb1)](https://github.com/adhesivejs/adhesive/blob/main/LICENSE)

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

| Package | Description | README |
|---------|-------------|---------|
| [`@adhesivejs/core`](./packages/core) | Core vanilla JavaScript/TypeScript library | [📖 Core README](./packages/core/README.md) |
| [`@adhesivejs/react`](./packages/react) | React hooks and components adapter | [📖 React README](./packages/react/README.md) |
| [`@adhesivejs/vue`](./packages/vue) | Vue composables and components adapter | [📖 Vue README](./packages/vue/README.md) |

## 🎨 Usage

### Core (Vanilla JavaScript/TypeScript)

```ts
import { Adhesive } from '@adhesivejs/core';

// Simple sticky header
const adhesive = Adhesive.create({
  targetEl: '#header',
  offset: 20
});
```

### React

```tsx
import { AdhesiveContainer } from '@adhesivejs/react';

export function App() {
  return (
    <AdhesiveContainer>
      <header>Sticky header content</header>
    </AdhesiveContainer>
  );
}
```

### Vue

```vue
<script setup lang="ts">
import { AdhesiveContainer } from '@adhesivejs/vue';
</script>

<template>
  <AdhesiveContainer>
    <header>Sticky header content</header>
  </AdhesiveContainer>
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

## 👨‍💻 Author

**Daniel Waltz**

- Website: [danielwaltz.me](https://danielwaltz.me/)
- Email: <danielbwaltz@gmail.com>
- GitHub: [@danielwaltz](https://github.com/danielwaltz)

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://danielwaltz.me">Daniel Waltz</a></sub>
</div>
