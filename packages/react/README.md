# Adhesive React

React adapter for Adhesive - A modern, performant, lightweight, dependency free, cross platform solution for flexible sticky positioned elements.

[![npm version](https://img.shields.io/npm/v/@adhesivejs/react?color=4c207d)](https://npmjs.com/package/@adhesivejs/react)
[![jsr version](https://img.shields.io/jsr/v/@adhesivejs/react?color=4c207d)](https://jsr.io/@adhesivejs/react)
[![npm downloads](https://img.shields.io/npm/dm/@adhesivejs/react?color=4c207d)](https://npm.chart.dev/@adhesivejs/react)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@adhesivejs/react?color=4c207d)](https://bundlephobia.com/package/@adhesivejs/react)
[![license](https://img.shields.io/github/license/adhesivejs/adhesive?color=4c207d)](https://github.com/adhesivejs/adhesive/blob/main/LICENSE)

## 🛠️ Installation

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

## 🎨 Usage

### Basic Example

```tsx
import { AdhesiveContainer } from '@adhesivejs/react';

export function Component() {
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

### Advanced Example with `useAdhesive` Hook

```tsx
import { useAdhesive, type AdhesivePosition } from '@adhesivejs/react';
import { useRef, useState } from 'react';

export function Component() {
  const targetRef = useRef<HTMLDivElement>(null);
  const boundingRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(true);
  const [position, setPosition] = useState<AdhesivePosition>('top');

  useAdhesive(
    targetRef,
    {
      boundingRef,
      position,
      offset: 20,
      enabled,
      zIndex: 999,
      initialClassName: 'custom-initial',
      fixedClassName: 'custom-fixed',
      relativeClassName: 'custom-relative'
    }
  );

  return (
    <div ref={boundingRef} style={{ height: '200vh' }}>
      <button onClick={() => setEnabled(!enabled)}>
        {enabled ? 'Disable' : 'Enable'} Sticky
      </button>

      <button onClick={() => setPosition(position === 'top' ? 'bottom' : 'top')}>
        Switch to {position === 'top' ? 'bottom' : 'top'}
      </button>

      <div ref={targetRef} className="sticky-element">
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
  className="custom-class"
>
  Content to make sticky
</AdhesiveContainer>
```

#### `useAdhesive` Hook

For more control over the sticky behavior.

**Parameters:**

- `target`: React ref object for the element that should become sticky
- `options`: Configuration options (optional)

**UseAdhesiveOptions:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `boundingRef` | `React.RefObject` \| `HTMLElement` \| `string` | `document.body` | The element that defines the sticky boundaries |
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
