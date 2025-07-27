import { vi } from "vitest";
import type { AdhesivePosition } from "@adhesivejs/core";

/**
 * Test utilities for Adhesive testing
 */

/**
 * Creates a mock DOM environment for testing
 */
export function createMockDOM() {
  // Create container
  const container = document.createElement("div");
  container.style.height = "2000px";

  // Create bounding element
  const boundingElement = document.createElement("div");
  boundingElement.className = "bounding";
  boundingElement.style.height = "1000px";
  boundingElement.style.position = "relative";

  // Create target element
  const targetElement = document.createElement("div");
  targetElement.id = "target";
  targetElement.textContent = "Sticky Element";
  targetElement.style.height = "50px";
  targetElement.style.backgroundColor = "red";

  // Assemble DOM
  boundingElement.append(targetElement);
  container.append(boundingElement);
  document.body.append(container);

  return {
    container,
    boundingElement,
    targetElement,
    cleanup: () => {
      container.remove();
    },
  };
}

/**
 * Mocks getBoundingClientRect for consistent testing
 */
export function mockGetBoundingClientRect(overrides: Partial<DOMRect> = {}) {
  const defaultRect: DOMRect = {
    top: 100,
    bottom: 150,
    left: 0,
    right: 100,
    width: 100,
    height: 50,
    x: 0,
    y: 100,
    toJSON: () => ({}),
  };

  const mockRect = { ...defaultRect, ...overrides };

  Element.prototype.getBoundingClientRect = vi.fn(() => mockRect);

  return mockRect;
}

/**
 * Mocks window properties for testing
 */
export function mockWindowProperties(overrides: Record<string, any> = {}) {
  const defaults = {
    scrollY: 0,
    pageYOffset: 0,
    innerHeight: 768,
    innerWidth: 1024,
  };

  const properties = { ...defaults, ...overrides };

  Object.entries(properties).forEach(([key, value]) => {
    Object.defineProperty(window, key, {
      value,
      writable: true,
    });
  });

  return properties;
}

/**
 * Simulates scroll events for testing
 */
export function simulateScroll(scrollY: number) {
  Object.defineProperty(window, "scrollY", {
    value: scrollY,
    writable: true,
  });

  Object.defineProperty(window, "pageYOffset", {
    value: scrollY,
    writable: true,
  });

  window.dispatchEvent(new Event("scroll"));
}

/**
 * Simulates window resize for testing
 */
export function simulateResize(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", {
    value: width,
    writable: true,
  });

  Object.defineProperty(window, "innerHeight", {
    value: height,
    writable: true,
  });

  window.dispatchEvent(new Event("resize"));
}

/**
 * Waits for RequestAnimationFrame to complete
 */
export function waitForRAF(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
}

/**
 * Waits for multiple RAF cycles
 */
export function waitForRAFCycles(cycles: number): Promise<void> {
  return new Promise((resolve) => {
    let count = 0;
    function frame() {
      count++;
      if (count >= cycles) {
        resolve();
      } else {
        requestAnimationFrame(frame);
      }
    }
    requestAnimationFrame(frame);
  });
}

/**
 * Creates a test observer for ResizeObserver mocking
 */
export class MockResizeObserver {
  callback: ResizeObserverCallback;
  elements: Set<Element> = new Set();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(element: Element) {
    this.elements.add(element);
  }

  unobserve(element: Element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }

  trigger(entries?: ResizeObserverEntry[]) {
    if (!entries) {
      entries = Array.from(this.elements).map((element) => ({
        target: element,
        contentRect: element.getBoundingClientRect(),
        borderBoxSize: [] as ResizeObserverSize[],
        contentBoxSize: [] as ResizeObserverSize[],
        devicePixelContentBoxSize: [] as ResizeObserverSize[],
      }));
    }
    this.callback(entries, this);
  }
}

/**
 * Sets up comprehensive mocks for Adhesive testing
 */
export function setupAdhesiveTestEnvironment() {
  // Mock ResizeObserver
  global.ResizeObserver = MockResizeObserver as any;

  // Mock window properties
  mockWindowProperties();

  // Mock getBoundingClientRect
  mockGetBoundingClientRect();

  // Mock scrollTo
  Object.defineProperty(window, "scrollTo", {
    value: vi.fn(),
    writable: true,
  });

  return {
    cleanup: () => {
      vi.restoreAllMocks();
    },
  };
}

/**
 * Test data generators
 */
export const testData = {
  /**
   * Generates random scroll positions
   */
  randomScrollPositions: (count: number, max: number = 2000): number[] => {
    return Array.from({ length: count }, () => Math.floor(Math.random() * max));
  },

  /**
   * Generates viewport sizes for responsive testing
   */
  viewportSizes: [
    { width: 320, height: 568, name: "iPhone SE" },
    { width: 375, height: 667, name: "iPhone 8" },
    { width: 414, height: 896, name: "iPhone 11" },
    { width: 768, height: 1024, name: "iPad" },
    { width: 1024, height: 768, name: "iPad Landscape" },
    { width: 1280, height: 800, name: "Desktop Small" },
    { width: 1920, height: 1080, name: "Desktop Large" },
  ],

  /**
   * Test options for Adhesive instances
   */
  adhesiveOptions: {
    basic: {
      targetEl: "#target",
    },
    withBounding: {
      targetEl: "#target",
      boundingEl: ".bounding",
    },
    topPosition: {
      targetEl: "#target",
      position: "top" as const,
      offset: 10,
    },
    bottomPosition: {
      targetEl: "#target",
      position: "bottom" as const,
      offset: 20,
    },
    customStyles: {
      targetEl: "#target",
      outerClassName: "custom-outer",
      innerClassName: "custom-inner",
      activeClassName: "custom-active",
      releasedClassName: "custom-released",
    },
    highZIndex: {
      targetEl: "#target",
      zIndex: 9999,
    },
  },
};

/**
 * Performance measurement utilities
 */
export class PerformanceTracker {
  private startTime: number = 0;
  private endTime: number = 0;
  private marks: Map<string, number> = new Map();

  start() {
    this.startTime = performance.now();
  }

  end() {
    this.endTime = performance.now();
    return this.duration;
  }

  mark(name: string) {
    this.marks.set(name, performance.now());
  }

  measure(startMark: string, endMark: string): number {
    const start = this.marks.get(startMark);
    const end = this.marks.get(endMark);

    if (start === undefined || end === undefined) {
      throw new Error(`Marks ${startMark} or ${endMark} not found`);
    }

    return end - start;
  }

  get duration(): number {
    return this.endTime - this.startTime;
  }

  clear() {
    this.marks.clear();
    this.startTime = 0;
    this.endTime = 0;
  }
}

/**
 * Assertion helpers for Adhesive testing
 */
export const adhesiveAssertions = {
  /**
   * Asserts that wrapper elements are created correctly
   */
  expectWrapperStructure: (targetElement: HTMLElement) => {
    const innerWrapper = targetElement.parentElement;
    const outerWrapper = innerWrapper?.parentElement;

    expect(innerWrapper).toBeTruthy();
    expect(outerWrapper).toBeTruthy();
    expect(innerWrapper?.classList.contains("adhesive__inner")).toBe(true);
    expect(outerWrapper?.classList.contains("adhesive__outer")).toBe(true);
  },

  /**
   * Asserts that sticky positioning is applied correctly
   */
  expectStickyPositioning: (
    targetElement: HTMLElement,
    position: AdhesivePosition,
  ) => {
    const innerWrapper = targetElement.parentElement;

    expect(innerWrapper).toBeTruthy();
    expect(innerWrapper?.style.position).toBe("fixed");

    if (position === "top") {
      expect(innerWrapper?.style.top).toBeTruthy();
    } else {
      expect(innerWrapper?.style.bottom).toBeTruthy();
    }
  },

  /**
   * Asserts that element is in initial (non-sticky) state
   */
  expectInitialState: (targetElement: HTMLElement) => {
    const innerWrapper = targetElement.parentElement;

    expect(innerWrapper?.style.position).toBe("");
    expect(innerWrapper?.style.top).toBe("");
    expect(innerWrapper?.style.bottom).toBe("");
  },
};
