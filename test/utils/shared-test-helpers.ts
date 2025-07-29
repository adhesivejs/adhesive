import { vi } from "vitest";
import type { AdhesivePosition } from "@adhesivejs/core";

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

export const customClassTestProps = {
  className: "custom-class",
  outerClassName: "custom-outer",
  innerClassName: "custom-inner",
  fixedClassName: "custom-fixed",
  relativeClassName: "custom-relative",
} as const;

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
  fixedClassName: "test-active",
  relativeClassName: "test-relative",
} as const;

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

export function createMockAdhesive() {
  const mockInstance = {
    init: vi.fn(),
    cleanup: vi.fn(),
    updateOptions: vi.fn(),
    getState: vi.fn(() => ({
      status: "initial",
      activated: true,
      width: TEST_DIMENSIONS.TARGET_WIDTH,
      height: TEST_DIMENSIONS.TARGET_HEIGHT,
    })),
    enable: vi.fn(),
    disable: vi.fn(),
    refresh: vi.fn(),
  };

  mockInstance.init.mockReturnValue(mockInstance);

  return mockInstance;
}

export function createMockAdhesiveConstructor() {
  return vi.fn((options) => {
    const instance = createMockAdhesive();

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

export function setupTestEnvironment() {
  document.body.innerHTML = "";

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

export function cleanupTestEnvironment() {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
}

export const assertions = {
  expectStickySetup: (element: HTMLElement, className = "adhesive__inner") => {
    expect(element.parentElement?.className).toContain(className);
  },

  expectAdhesiveCreatedWith: (
    AdhesiveMock: any,
    expectedOptions: Record<string, any>,
  ) => {
    expect(AdhesiveMock.create || AdhesiveMock).toHaveBeenCalledWith(
      expect.objectContaining(expectedOptions),
    );
  },

  expectRenderedWithoutErrors: (element: HTMLElement | null) => {
    expect(element).toBeTruthy();
    expect(element).toBeInstanceOf(HTMLElement);
  },

  expectElementToBeInState: (adhesive: any, expectedStatus: string) => {
    const state = adhesive.getState();
    expect(state.status).toBe(expectedStatus);
    return state;
  },
};

export const testData = {
  positionTestCases: TEST_POSITIONS.map((position) => ({
    position,
    description: `handles ${position} positioning`,
  })),

  offsetTestCases: TEST_OFFSETS.map((offset) => ({
    offset,
    description: `applies offset ${offset}px correctly`,
  })),

  enabledStateTestCases: [
    { enabled: true, description: "enabled state" },
    { enabled: false, description: "disabled state" },
  ],

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

export const performanceHelpers = {
  measureOperations: (operation: () => void, iterations = 100): number => {
    const start = globalThis.performance.now();
    for (let i = 0; i < iterations; i++) {
      operation();
    }
    const end = globalThis.performance.now();
    return end - start;
  },

  getMemoryUsage: (): number => {
    return (globalThis.performance as any)?.memory?.usedJSHeapSize || 0;
  },
};

export const animationHelpers = {
  waitForRAF: (): Promise<void> => {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  },

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
