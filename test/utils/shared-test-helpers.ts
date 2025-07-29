import { vi } from "vitest";
import type { AdhesivePosition } from "@adhesivejs/core";

/**
 * Shared test utilities for Adhesive testing across all frameworks
 */

// Test data constants for better maintainability
export const TEST_DIMENSIONS = {
  CONTAINER_HEIGHT: 2000,
  BOUNDING_HEIGHT: 1000,
  TARGET_HEIGHT: 50,
  TARGET_WIDTH: 100,
  VIEWPORT_HEIGHT: 768,
} as const;

export const DEFAULT_RECT: DOMRect = {
  top: 100,
  bottom: 150,
  left: 0,
  right: 100,
  width: TEST_DIMENSIONS.TARGET_WIDTH,
  height: TEST_DIMENSIONS.TARGET_HEIGHT,
  x: 0,
  y: 100,
  toJSON: () => ({}),
};

/**
 * Test configuration test cases for parameterized testing
 */
export const configurationTestCases = [
  {
    name: "position prop",
    props: { position: "top" as AdhesivePosition },
  },
  {
    name: "enabled prop",
    props: { enabled: true },
  },
  {
    name: "offset prop",
    props: { offset: 20 },
  },
  {
    name: "disabled state",
    props: { enabled: false },
  },
  {
    name: "bottom position",
    props: { position: "bottom" as AdhesivePosition },
  },
] as const;

/**
 * Custom class name test configuration
 */
export const customClassTestProps = {
  className: "custom-class",
  outerClassName: "custom-outer",
  innerClassName: "custom-inner",
  activeClassName: "custom-active",
  releasedClassName: "custom-released",
} as const;

/**
 * Error test cases for comprehensive error handling tests
 */
export const errorTestCases = [
  { selector: "", expectedCode: "TARGET_EL_REQUIRED" },
  { selector: "#nonexistent", expectedCode: "TARGET_EL_NOT_FOUND" },
  { selector: ".missing-class", expectedCode: "TARGET_EL_NOT_FOUND" },
  { selector: "invalid>>selector", expectedCode: "TARGET_EL_NOT_FOUND" },
] as const;
export const TEST_POSITIONS: AdhesivePosition[] = ["top", "bottom"];

export const TEST_OFFSETS = [0, 10, 20, 50, 100] as const;

export const TEST_Z_INDEXES = [1, 10, 100, 999, 1000] as const;

export const CUSTOM_CLASS_NAMES = {
  outerClassName: "test-outer",
  innerClassName: "test-inner",
  activeClassName: "test-active",
  releasedClassName: "test-released",
} as const;

/**
 * Enhanced getBoundingClientRect mock for dynamic testing
 * Allows per-element rect overrides for realistic core testing
 */
export function mockGetBoundingClientRect(
  overrides: Record<string, Partial<DOMRect>> = {},
  elementOverrides: Map<Element, Partial<DOMRect>> = new Map(),
) {
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;

  Element.prototype.getBoundingClientRect = function (this: Element) {
    // Check for element-specific override first
    const elementOverride = elementOverrides.get(this);
    if (elementOverride) {
      const baseRect = { ...DEFAULT_RECT, ...elementOverride };
      const scrollOffset = window.scrollY || 0;
      return {
        ...baseRect,
        top: baseRect.top - scrollOffset,
        bottom: baseRect.bottom - scrollOffset,
        y: baseRect.y - scrollOffset,
      } satisfies DOMRect;
    }

    // Check for ID-based override
    const override = overrides[this.id];
    const baseRect = override ? { ...DEFAULT_RECT, ...override } : DEFAULT_RECT;

    // Simulate how scroll affects viewport-relative positions
    const scrollOffset = window.scrollY || 0;

    return {
      ...baseRect,
      top: baseRect.top - scrollOffset,
      bottom: baseRect.bottom - scrollOffset,
      y: baseRect.y - scrollOffset,
    } satisfies DOMRect;
  };

  return {
    restore: () => {
      Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    },
    setElementOverride: (element: Element, rect: Partial<DOMRect>) => {
      elementOverrides.set(element, rect);
    },
  };
}

/**
 * Common setup/teardown helpers
 */
export function commonBeforeEach() {
  vi.clearAllMocks();
  document.body.innerHTML = "";

  mockGetBoundingClientRect({
    bounding: {
      top: 0,
      bottom: 2000,
      left: 0,
      right: 100,
      width: 100,
      height: 2000,
      x: 0,
      y: 0,
    },
  });

  Object.defineProperty(window, "innerHeight", {
    value: TEST_DIMENSIONS.VIEWPORT_HEIGHT,
    writable: true,
  });

  Object.defineProperty(window, "scrollY", {
    value: 0,
    writable: true,
  });

  Object.defineProperty(window, "pageYOffset", {
    value: 0,
    writable: true,
  });
}

/**
 * Scroll simulation helper used across all tests
 */
export function simulateScrollToPosition(scrollY: number): Promise<void> {
  Object.defineProperty(window, "scrollY", {
    value: scrollY,
    writable: true,
  });
  Object.defineProperty(window, "pageYOffset", {
    value: scrollY,
    writable: true,
  });

  window.dispatchEvent(new Event("scroll"));

  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

/**
 * Creates a mock Adhesive instance for testing
 */
export function createMockAdhesive() {
  const mockInstance = {
    init: vi.fn(),
    cleanup: vi.fn(),
    updateOptions: vi.fn(),
    getState: vi.fn(() => ({
      status: "initial",
      isSticky: false,
      activated: true,
      width: TEST_DIMENSIONS.TARGET_WIDTH,
      height: TEST_DIMENSIONS.TARGET_HEIGHT,
    })),
    enable: vi.fn(),
    disable: vi.fn(),
    refresh: vi.fn(),
  };

  // Make init return the instance for chaining
  mockInstance.init.mockReturnValue(mockInstance);

  return mockInstance;
}

/**
 * Creates a comprehensive mock for the Adhesive constructor
 */
export function createMockAdhesiveConstructor() {
  return vi.fn((options) => {
    const instance = createMockAdhesive();

    // Simulate DOM wrapper creation like the real Adhesive does
    const targetEl =
      typeof options.targetEl === "string"
        ? document.querySelector(options.targetEl)
        : options.targetEl;

    if (targetEl?.parentNode) {
      const outerWrapper = document.createElement("div");
      outerWrapper.className = options.outerClassName || "adhesive__outer";

      const innerWrapper = document.createElement("div");
      innerWrapper.className = options.innerClassName || "adhesive__inner";

      targetEl.before(outerWrapper);
      outerWrapper.append(innerWrapper);
      innerWrapper.append(targetEl);
    }

    return instance;
  });
}

/**
 * Setup function for consistent test environment
 */
export function setupTestEnvironment() {
  // Clear DOM
  document.body.innerHTML = "";

  // Mock getBoundingClientRect for consistent testing
  Element.prototype.getBoundingClientRect = vi.fn(() => DEFAULT_RECT);

  // Mock window dimensions
  Object.defineProperty(window, "innerHeight", {
    value: TEST_DIMENSIONS.VIEWPORT_HEIGHT,
    writable: true,
  });

  Object.defineProperty(window, "innerWidth", {
    value: 1024,
    writable: true,
  });

  // Mock scroll position
  Object.defineProperty(window, "scrollY", {
    value: 0,
    writable: true,
  });

  Object.defineProperty(window, "pageYOffset", {
    value: 0,
    writable: true,
  });
}

/**
 * Cleanup function for test environment
 */
export function cleanupTestEnvironment() {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
}

/**
 * Assertion helpers for common test scenarios
 */
export const assertions = {
  /**
   * Assert that an element has the expected sticky behavior setup
   */
  expectStickySetup: (element: HTMLElement, className = "adhesive__inner") => {
    expect(element.parentElement?.className).toContain(className);
  },

  /**
   * Assert that Adhesive.create was called with expected options
   */
  expectAdhesiveCreatedWith: (
    AdhesiveMock: any,
    expectedOptions: Record<string, any>,
  ) => {
    expect(AdhesiveMock.create || AdhesiveMock).toHaveBeenCalledWith(
      expect.objectContaining(expectedOptions),
    );
  },

  /**
   * Assert that component renders without errors
   */
  expectRenderedWithoutErrors: (element: HTMLElement | null) => {
    expect(element).toBeTruthy();
    expect(element).toBeInstanceOf(HTMLElement);
  },

  /**
   * Assert element state for Adhesive core testing
   */
  expectElementToBeInState: (adhesive: any, expectedStatus: string) => {
    const state = adhesive.getState();
    expect(state.status).toBe(expectedStatus);
    return state;
  },
};

/**
 * Test data generators for parameterized tests
 */
export const testData = {
  /**
   * Generate test cases for position testing
   */
  positionTestCases: TEST_POSITIONS.map((position) => ({
    position,
    description: `handles ${position} positioning`,
  })),

  /**
   * Generate test cases for offset testing
   */
  offsetTestCases: TEST_OFFSETS.map((offset) => ({
    offset,
    description: `applies offset ${offset}px correctly`,
  })),

  /**
   * Generate test cases for enabled/disabled states
   */
  enabledStateTestCases: [
    { enabled: true, description: "enabled state" },
    { enabled: false, description: "disabled state" },
  ],

  /**
   * Generate test cases for custom class names
   */
  classNameTestCases: [
    {
      props: CUSTOM_CLASS_NAMES,
      description: "custom class names",
    },
    {
      props: {},
      description: "default class names",
    },
  ],
};

/**
 * Common test scenarios that can be reused across frameworks
 */
export const testScenarios = {
  basicRender: {
    description: "renders without errors",
    assertion: (element: HTMLElement | null) => {
      assertions.expectRenderedWithoutErrors(element);
    },
  },

  positionHandling: {
    description: "handles position prop changes",
    positions: TEST_POSITIONS,
  },

  offsetHandling: {
    description: "handles offset prop values",
    offsets: TEST_OFFSETS,
  },

  enabledStateHandling: {
    description: "handles enabled/disabled states",
    states: [true, false],
  },

  customClassNames: {
    description: "applies custom class names",
    classNames: CUSTOM_CLASS_NAMES,
  },
};

/**
 * Performance testing helpers
 */
export const performanceHelpers = {
  /**
   * Measure time for multiple operations
   */
  measureOperations: (operation: () => void, iterations = 100): number => {
    const start = globalThis.performance.now();
    for (let i = 0; i < iterations; i++) {
      operation();
    }
    const end = globalThis.performance.now();
    return end - start;
  },

  /**
   * Test memory usage (if available)
   */
  getMemoryUsage: (): number => {
    return (globalThis.performance as any)?.memory?.usedJSHeapSize || 0;
  },
};

/**
 * Animation frame utilities for testing
 */
export const animationHelpers = {
  /**
   * Waits for RequestAnimationFrame to complete
   */
  waitForRAF: (): Promise<void> => {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  },

  /**
   * Waits for multiple RAF cycles
   */
  waitForRAFCycles: (cycles: number): Promise<void> => {
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
  },
};
