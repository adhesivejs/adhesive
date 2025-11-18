import "@testing-library/jest-dom/vitest";

// Mock ResizeObserver if not available in test environment
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    constructor(cb: ResizeObserverCallback) {
      this.cb = cb;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    private cb: ResizeObserverCallback;
  };
}

// Mock window.scrollTo
Object.defineProperty(globalThis, "scrollTo", {
  value: vi.fn(),
  writable: true,
});

// Mock window dimensions
Object.defineProperty(globalThis, "innerHeight", {
  value: 768,
  writable: true,
});

Object.defineProperty(globalThis, "innerWidth", {
  value: 1024,
  writable: true,
});
