import "@testing-library/jest-dom/vitest";

// Mock ResizeObserver if not available in test environment
if (!global.ResizeObserver) {
  global.ResizeObserver = class ResizeObserver {
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
Object.defineProperty(window, "scrollTo", {
  value: vi.fn(),
  writable: true,
});

// Mock window dimensions
Object.defineProperty(window, "innerHeight", {
  value: 768,
  writable: true,
});

Object.defineProperty(window, "innerWidth", {
  value: 1024,
  writable: true,
});
