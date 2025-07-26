# Adhesive React

React adapter for Adhesive - A modern, performant, lightweight, dependency free, cross platform solution for flexible sticky positioned elements.

<!-- automd:badges name="@adhesivejs/react" color="4c207d" bundlephobia license no-npmDownloads -->

[![npm version](https://img.shields.io/npm/v/@adhesivejs/react?color=4c207d)](https://npmjs.com/package/@adhesivejs/react)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@adhesivejs/react?color=4c207d)](https://bundlephobia.com/package/@adhesivejs/react)
[![license](https://img.shields.io/github/license/adhesivejs/adhesive?color=4c207d)](https://github.com/adhesivejs/adhesive/blob/main/LICENSE)

<!-- /automd -->

## 🛠️ Installation

<!-- automd:pm-install name="@adhesivejs/react" -->

```sh
# ✨ Auto-detect
npx nypm install @adhesivejs/react

# npm
npm install @adhesivejs/react

# yarn
yarn add @adhesivejs/react

# pnpm
pnpm install @adhesivejs/react

# bun
bun install @adhesivejs/react

# deno
deno install @adhesivejs/react
```

<!-- /automd -->

## 🎨 Usage

### Basic Example

```tsx
import { AdhesiveContainer } from '@adhesivejs/react';

export function App() {
  return (
    <div>
      <AdhesiveContainer>
        <header>This header will stick to the top</header>
      </AdhesiveContainer>

      <main>
        <p>Your main content here...</p>
      </main>
    </div>
  );
}
```

### Advanced Example with `useAdhesive` Hook

```tsx
import { useAdhesive } from '@adhesivejs/react';
import { useRef, useState } from 'react';

export function App() {
  const targetEl = useRef<HTMLDivElement>(null);
  const boundingEl = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(true);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');

  useAdhesive(
    { target: targetEl, bounding: boundingEl },
    {
      position,
      offset: 20,
      enabled,
      zIndex: 999,
      activeClassName: 'is-sticky',
      releasedClassName: 'is-normal'
    }
  );

  return (
    <div ref={boundingEl} style={{ height: '200vh' }}>
      <button onClick={() => setEnabled(!enabled)}>
        {enabled ? 'Disable' : 'Enable'} Sticky
      </button>

      <button onClick={() => setPosition(position === 'top' ? 'bottom' : 'top')}>
        Switch to {position === 'top' ? 'bottom' : 'top'}
      </button>

      <div ref={targetEl} className="sticky-element">
        <h2>Dynamic Sticky Element</h2>
        <p>Position: {position} | Enabled: {enabled ? 'Yes' : 'No'}</p>
      </div>

      <div style={{ height: '150vh', background: 'linear-gradient(to bottom, #f0f0f0, #ffffff)' }}>
        <p>Scroll to see the sticky behavior in action!</p>
      </div>
    </div>
  );
}
```

### API Reference

#### `AdhesiveContainer` Component

A simple wrapper component that automatically applies sticky positioning to its children.

**Props:**

- All props from `UseAdhesiveOptions` (see below)
- Standard `div` props (className, style, etc.)

```tsx
<AdhesiveContainer
  position="bottom"
  offset={30}
  className="my-sticky"
>
  Content to make sticky
</AdhesiveContainer>
```

#### `useAdhesive` Hook

For more control over the sticky behavior.

**Parameters:**

- `templateRefs`: Object with `target` (required) and `bounding` (optional) refs
- `options`: Configuration options (optional)

**UseAdhesiveOptions:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `position` | `'top' \| 'bottom'` | `'top'` | Where the element should stick |
| `offset` | `number` | `0` | Offset in pixels from the position |
| `zIndex` | `number` | `1` | Z-index for the fixed element |
| `enabled` | `boolean` | `true` | Whether to enable sticky behavior |
| `className` | `string` | `''` | Extra CSS class for wrapper |
| `activeClassName` | `string` | `'adhesive--active'` | Class when element is sticky |
| `releasedClassName` | `string` | `'adhesive--released'` | Class when element returns to normal |
