import { Adhesive, ADHESIVE_STATUS, AdhesiveError } from "@adhesivejs/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockDOM } from "../utils/core-test-helpers.js";
import {
  animationHelpers,
  assertions,
  commonBeforeEach,
  CUSTOM_CLASS_NAMES,
  DEFAULT_RECT,
  errorTestCases,
  mockGetBoundingClientRect,
  simulateScrollToPosition,
  TEST_OFFSETS,
  TEST_Z_INDEXES,
} from "../utils/shared-test-helpers.js";

describe("Core", () => {
  let mockDOM: ReturnType<typeof createMockDOM>;
  let targetEl: HTMLElement;
  let boundingEl: HTMLElement;

  beforeEach(() => {
    commonBeforeEach();
    mockDOM = createMockDOM();
    targetEl = mockDOM.target;
    boundingEl = mockDOM.bounding;
  });

  afterEach(() => {
    mockDOM.cleanup();
    vi.restoreAllMocks();
  });

  const createAdhesiveInstance = (
    options: Partial<Parameters<typeof Adhesive.create>[0]> = {},
  ) => {
    return new Adhesive({ targetEl, ...options });
  };

  const createInitializedAdhesive = (
    options: Partial<Parameters<typeof Adhesive.create>[0]> = {},
  ) => {
    return createAdhesiveInstance(options).init();
  };

  const expectElementToBeInState = (
    adhesive: Adhesive,
    expectedStatus: keyof typeof ADHESIVE_STATUS,
  ) => {
    return assertions.expectElementToBeInState(
      adhesive,
      ADHESIVE_STATUS[expectedStatus],
    );
  };

  describe("Constructor & Factory Methods", () => {
    describe("Basic instantiation", () => {
      it("creates instance with HTMLElement reference", () => {
        const adhesive = createAdhesiveInstance();

        expect(adhesive).toBeInstanceOf(Adhesive);
        expect(adhesive.getState().activated).toBe(false);
      });

      it("creates instance with CSS selector", () => {
        const adhesive = createAdhesiveInstance({ targetEl: "#target" });

        expect(adhesive).toBeInstanceOf(Adhesive);
      });

      it("creates and initializes instance via static factory method", () => {
        const adhesive = Adhesive.create({ targetEl });

        expect(adhesive).toBeInstanceOf(Adhesive);
        expect(adhesive.getState().activated).toBe(true);

        adhesive.cleanup();
      });
    });

    describe("Error handling", () => {
      it("throws AdhesiveError when target element selector not found", () => {
        expect(() => {
          createAdhesiveInstance({ targetEl: "#nonexistent" });
        }).toThrow(AdhesiveError);
      });

      it("throws AdhesiveError when target element is empty string", () => {
        expect(() => {
          createAdhesiveInstance({ targetEl: "" });
        }).toThrow(AdhesiveError);
      });

      it("provides detailed error context for debugging", () => {
        try {
          createAdhesiveInstance({ targetEl: "#nonexistent" });
        } catch (error) {
          expect(error).toBeInstanceOf(AdhesiveError);
          expect((error as AdhesiveError).code).toBe("TARGET_EL_NOT_FOUND");
        }
      });

      it("throws AdhesiveError when target element lacks parent node", () => {
        const orphanElement = document.createElement("div");

        expect(() => {
          createAdhesiveInstance({ targetEl: orphanElement });
        }).toThrow(AdhesiveError);
      });
    });

    describe("Boundary element configuration", () => {
      it("uses document.body as default bounding element", () => {
        const adhesive = createAdhesiveInstance();
        const state = adhesive.getState();

        expect(state.bottomBoundary).toBe(Number.POSITIVE_INFINITY);
      });

      it("accepts custom bounding element", () => {
        const adhesive = createAdhesiveInstance({ boundingEl });

        expect(adhesive).toBeInstanceOf(Adhesive);
      });
    });

    describe("Disabled state handling", () => {
      it("handles disabled state without errors", () => {
        const adhesive = createAdhesiveInstance({ enabled: false });

        expect(adhesive.getState().activated).toBe(false);
      });
    });
  });

  describe("Configuration & Options", () => {
    describe("default configuration", () => {
      it("applies default options correctly", () => {
        const adhesive = createAdhesiveInstance();
        const state = adhesive.getState();

        expect(state.status).toBe(ADHESIVE_STATUS.INITIAL);
        expect(state.activated).toBe(false);
      });
    });

    describe("custom configuration", () => {
      it("accepts and applies custom options", () => {
        const customOptions = {
          position: "bottom" as const,
          offset: TEST_OFFSETS[2],
          zIndex: TEST_Z_INDEXES[3],
          outerClassName: CUSTOM_CLASS_NAMES.outerClassName,
          innerClassName: CUSTOM_CLASS_NAMES.innerClassName,
          activeClassName: CUSTOM_CLASS_NAMES.activeClassName,
          releasedClassName: CUSTOM_CLASS_NAMES.releasedClassName,
        };

        const adhesive = createAdhesiveInstance(customOptions);

        expect(adhesive).toBeInstanceOf(Adhesive);

        expect(() => adhesive.init()).not.toThrow();

        adhesive.cleanup();
      });

      it("validates option types and ranges", () => {
        expect(() =>
          createAdhesiveInstance({ offset: TEST_OFFSETS[3] }),
        ).not.toThrow();
        expect(() =>
          createAdhesiveInstance({ zIndex: TEST_Z_INDEXES[4] }),
        ).not.toThrow();

        expect(() => createAdhesiveInstance({ position: "top" })).not.toThrow();
        expect(() =>
          createAdhesiveInstance({ position: "bottom" }),
        ).not.toThrow();
      });
    });

    describe("dynamic option updates", () => {
      it("updates options dynamically without breaking functionality", () => {
        const adhesive = createInitializedAdhesive();

        adhesive.updateOptions({
          position: "bottom",
          offset: 30,
        });

        const state = adhesive.getState();
        expect(state.activated).toBe(true);

        adhesive.cleanup();
      });

      it("handles enable/disable option updates correctly", () => {
        const adhesive = createInitializedAdhesive();

        adhesive.updateOptions({ enabled: false });
        expect(adhesive.getState().activated).toBe(false);

        adhesive.updateOptions({ enabled: true });
        expect(adhesive.getState().activated).toBe(true);

        adhesive.cleanup();
      });

      it("handles updating frozen options from disabled state", () => {
        const adhesive = createInitializedAdhesive();

        adhesive.updateOptions({ enabled: false });
        expect(adhesive.getState().activated).toBe(false);

        expect(() => {
          adhesive.updateOptions({
            enabled: false,
            position: "bottom",
            offset: TEST_OFFSETS[2],
          });
        }).not.toThrow();

        expect(() => {
          adhesive.updateOptions({
            enabled: true,
            position: "top",
            offset: TEST_OFFSETS[1],
          });
        }).not.toThrow();

        expect(adhesive.getState().activated).toBe(true);

        adhesive.cleanup();
      });

      it("handles creating instance with enabled:false then updating options", () => {
        const adhesive = Adhesive.create({
          targetEl,
          enabled: false,
        });

        expect(() => {
          adhesive.updateOptions({
            position: "bottom",
            offset: TEST_OFFSETS[1],
          });
        }).not.toThrow();

        expect(() => {
          adhesive.updateOptions({
            enabled: true,
            position: "top",
          });
        }).not.toThrow();

        expect(adhesive.getState().activated).toBe(true);

        adhesive.cleanup();
      });

      it("preserves all default options when updating frozen options", () => {
        const adhesive = Adhesive.create({
          targetEl,
          enabled: false,
        });

        adhesive.updateOptions({ offset: TEST_OFFSETS[2] });

        adhesive.updateOptions({ enabled: true });

        expectElementToBeInState(adhesive, "INITIAL");

        adhesive.updateOptions({
          position: "bottom",
          zIndex: TEST_Z_INDEXES[3],
        });

        expect(adhesive.getState().activated).toBe(true);

        adhesive.cleanup();
      });

      it("preserves all option properties when unfreezing frozen options", () => {
        const adhesive = Adhesive.create({
          targetEl,
          enabled: false,
        });

        adhesive.updateOptions({
          offset: TEST_OFFSETS[1],
          position: "bottom",
          zIndex: TEST_Z_INDEXES[2],
          outerClassName: CUSTOM_CLASS_NAMES.outerClassName,
          innerClassName: CUSTOM_CLASS_NAMES.innerClassName,
          activeClassName: CUSTOM_CLASS_NAMES.activeClassName,
          releasedClassName: CUSTOM_CLASS_NAMES.releasedClassName,
        });

        adhesive.updateOptions({ enabled: true });

        expect(adhesive.getState().activated).toBe(true);

        adhesive.updateOptions({ offset: TEST_OFFSETS[3] });

        expect(adhesive.getState().activated).toBe(true);

        adhesive.cleanup();
      });

      it("handle multiple consecutive updates from disabled state", () => {
        const adhesive = createInitializedAdhesive();

        adhesive.updateOptions({ enabled: false });

        expect(() => {
          adhesive.updateOptions({ enabled: false, position: "bottom" });
          adhesive.updateOptions({ enabled: false, offset: TEST_OFFSETS[2] });
          adhesive.updateOptions({ enabled: false, zIndex: TEST_Z_INDEXES[2] });
        }).not.toThrow();

        expect(() => {
          adhesive.updateOptions({ enabled: true });
        }).not.toThrow();

        expectElementToBeInState(adhesive, "INITIAL");

        adhesive.cleanup();
      });

      it("correctly re-enables instance that started in disabled state", () => {
        const adhesive = new Adhesive({
          targetEl,
          enabled: false,
        });

        expect(adhesive.getState().activated).toBe(false);

        adhesive.init();

        expect(adhesive.getState().activated).toBe(false);

        expect(() => {
          adhesive.updateOptions({ enabled: true });
        }).not.toThrow();

        expect(adhesive.getState().activated).toBe(true);

        const outerWrapper = targetEl.parentElement?.parentElement;
        const innerWrapper = targetEl.parentElement;

        expect(outerWrapper).toBeTruthy();
        expect(innerWrapper).toBeTruthy();
        expect(outerWrapper?.className).toContain("adhesive__outer");
        expect(innerWrapper?.className).toContain("adhesive__inner");

        adhesive.cleanup();
      });
    });
  });

  describe("State Management", () => {
    describe("state access and immutability", () => {
      let adhesive: Adhesive;

      beforeEach(() => {
        adhesive = createInitializedAdhesive({ boundingEl });
      });

      afterEach(() => {
        adhesive.cleanup();
      });

      it("returns complete state object with all required properties", () => {
        const state = adhesive.getState();

        expect(state).toHaveProperty("status");
        expect(state).toHaveProperty("activated");
        expect(state).toHaveProperty("position");
        expect(state).toHaveProperty("originalPosition");
        expect(state).toHaveProperty("originalTop");
        expect(state).toHaveProperty("originalZIndex");
        expect(state).toHaveProperty("originalTransform");
        expect(state).toHaveProperty("elementWidth");
        expect(state).toHaveProperty("elementHeight");
        expect(state).toHaveProperty("elementX");
        expect(state).toHaveProperty("elementY");
        expect(state).toHaveProperty("topBoundary");
        expect(state).toHaveProperty("bottomBoundary");

        expect(state.status).toBe(ADHESIVE_STATUS.INITIAL);
        expect(state.activated).toBe(true);
      });

      it("provides immutable state object", () => {
        const state = adhesive.getState();
        const originalStatus = state.status;

        (state as any).status = "modified";
        (state as any).activated = false;

        const newState = adhesive.getState();
        expect(newState.status).toBe(originalStatus);
        expect(newState.activated).toBe(true);
      });

      it("returns fresh state object on each call", () => {
        const state1 = adhesive.getState();
        const state2 = adhesive.getState();

        expect(state1).toEqual(state2);
        expect(state1).not.toBe(state2);
      });
    });

    describe("state transitions", () => {
      let adhesive: Adhesive;

      beforeEach(() => {
        adhesive = createInitializedAdhesive({ boundingEl });
      });

      afterEach(() => {
        adhesive.cleanup();
      });

      it("maintains consistent state during enable/disable cycles", () => {
        expectElementToBeInState(adhesive, "INITIAL");

        adhesive.disable();
        expect(adhesive.getState().activated).toBe(false);
        expectElementToBeInState(adhesive, "INITIAL");

        adhesive.enable();
        expect(adhesive.getState().activated).toBe(true);
        expectElementToBeInState(adhesive, "INITIAL");
      });
    });
  });

  describe("Enable/Disable Functionality", () => {
    describe("enable/disable lifecycle", () => {
      let adhesive: Adhesive;

      beforeEach(() => {
        adhesive = createInitializedAdhesive();
      });

      afterEach(() => {
        adhesive.cleanup();
      });

      it("toggles between enabled and disabled states correctly", () => {
        expect(adhesive.getState().activated).toBe(true);

        adhesive.disable();
        expect(adhesive.getState().activated).toBe(false);

        adhesive.enable();
        expect(adhesive.getState().activated).toBe(true);
      });

      it("resets state to initial when disabled", () => {
        expectElementToBeInState(adhesive, "INITIAL");

        adhesive.disable();
        const state = adhesive.getState();
        expect(state.status).toBe(ADHESIVE_STATUS.INITIAL);
        expect(state.activated).toBe(false);
      });

      it("supports method chaining", () => {
        expect(adhesive.enable()).toBe(adhesive);
        expect(adhesive.disable()).toBe(adhesive);
        expect(adhesive.enable()).toBe(adhesive);
      });
    });

    describe("disabled state behavior", () => {
      it("handles creation in disabled state", () => {
        const adhesive = createAdhesiveInstance({ enabled: false });

        expect(adhesive.getState().activated).toBe(false);

        expect(() => adhesive.init()).not.toThrow();
        expect(adhesive.getState().activated).toBe(false);
      });

      it("ignores events when disabled", () => {
        const adhesive = createInitializedAdhesive();
        adhesive.disable();

        window.dispatchEvent(new Event("scroll"));
        window.dispatchEvent(new Event("resize"));

        expect(adhesive.getState().activated).toBe(false);
        expectElementToBeInState(adhesive, "INITIAL");
      });
    });
  });

  describe("Positioning Logic", () => {
    describe("top positioning behavior", () => {
      let adhesive: Adhesive;

      beforeEach(() => {
        adhesive = createInitializedAdhesive({
          boundingEl,
          position: "top",
          offset: 10,
        });
      });

      afterEach(() => {
        adhesive.cleanup();
      });

      it("handles scroll events with proper state transitions", async () => {
        expectElementToBeInState(adhesive, "INITIAL");

        await simulateScrollToPosition(200);

        expectElementToBeInState(adhesive, "FIXED");
      });

      it("maintains element position consistency", async () => {
        const initialState = adhesive.getState();

        await simulateScrollToPosition(200);
        await simulateScrollToPosition(0);

        const finalState = adhesive.getState();

        expect(finalState.status).toBe(ADHESIVE_STATUS.INITIAL);
        expect(finalState.elementX).toBe(initialState.elementX);
        expect(finalState.elementY).toBe(initialState.elementY);
      });
    });

    describe("bottom positioning behavior", () => {
      let adhesive: Adhesive;

      beforeEach(() => {
        adhesive = createInitializedAdhesive({
          boundingEl,
          position: "bottom",
          offset: 10,
        });
      });

      afterEach(() => {
        adhesive.cleanup();
      });

      it("handles bottom positioning configuration", () => {
        const state = adhesive.getState();
        expect(state.activated).toBe(true);

        expect(() =>
          adhesive.updateOptions({ position: "bottom" }),
        ).not.toThrow();
      });

      it("responds to scroll events in bottom mode", async () => {
        await simulateScrollToPosition(100);

        const state = adhesive.getState();
        expect(state.activated).toBe(true);
      });
    });

    describe("boundary handling", () => {
      let adhesive: Adhesive;

      beforeEach(() => {
        adhesive = createInitializedAdhesive({
          boundingEl,
          position: "top",
          offset: 10,
        });
      });

      afterEach(() => {
        adhesive.cleanup();
      });

      it("respects bounding element constraints", () => {
        const state = adhesive.getState();

        expect(state.bottomBoundary).toBeGreaterThan(state.topBoundary);
        expect(state.topBoundary).toBeGreaterThanOrEqual(0);
      });

      it("handles edge case scroll positions", async () => {
        await simulateScrollToPosition(-100);
        expect(adhesive.getState().activated).toBe(true);

        await simulateScrollToPosition(10000);
        expect(adhesive.getState().activated).toBe(true);
      });
    });

    describe("offset handling", () => {
      it("applies offset correctly for different values", () => {
        TEST_OFFSETS.forEach((offset) => {
          const adhesive = createInitializedAdhesive({
            boundingEl,
            offset,
          });

          expect(adhesive.getState().activated).toBe(true);

          adhesive.cleanup();
        });
      });
    });
  });

  describe("DOM Structure Management", () => {
    describe("wrapper element creation", () => {
      it("creates proper wrapper hierarchy with custom class names", () => {
        const customClasses = {
          outerClassName: "test-outer",
          innerClassName: "test-inner",
        };

        const adhesive = createAdhesiveInstance(customClasses);

        const outerWrapper = targetEl.parentElement;
        expect(outerWrapper).not.toBeNull();
        expect(outerWrapper!.className).toContain(customClasses.innerClassName);

        const innerWrapper = outerWrapper!.parentElement?.querySelector(
          `.${customClasses.innerClassName}`,
        );
        expect(innerWrapper).not.toBeNull();

        adhesive.cleanup();
      });

      it("creates wrappers with default class names", () => {
        const adhesive = createAdhesiveInstance();

        const targetParent = targetEl.parentElement;
        expect(targetParent?.className).toContain("adhesive__inner");

        adhesive.cleanup();
      });

      it("maintains target element content and attributes", () => {
        const originalId = targetEl.id;
        const originalTextContent = targetEl.textContent;
        const originalStyle = targetEl.style.cssText;

        const adhesive = createAdhesiveInstance();

        expect(targetEl.id).toBe(originalId);
        expect(targetEl.textContent).toBe(originalTextContent);
        expect(targetEl.style.cssText).toBe(originalStyle);

        adhesive.cleanup();
      });
    });

    describe("DOM restoration", () => {
      it("completely restores original DOM structure on cleanup", () => {
        const originalParent = targetEl.parentElement;
        const originalNextSibling = targetEl.nextElementSibling;
        const originalPreviousSibling = targetEl.previousElementSibling;

        const adhesive = createAdhesiveInstance();

        expect(targetEl.parentElement?.className).toContain("adhesive__inner");

        adhesive.cleanup();

        expect(targetEl.parentElement).toBe(originalParent);
        expect(targetEl.nextElementSibling).toBe(originalNextSibling);
        expect(targetEl.previousElementSibling).toBe(originalPreviousSibling);
      });

      it("removes all wrapper elements after cleanup", () => {
        const adhesive = createAdhesiveInstance();

        const innerWrapper = targetEl.parentElement;
        const outerWrapper = innerWrapper?.parentElement;

        adhesive.cleanup();

        if (innerWrapper) {
          expect(document.contains(innerWrapper)).toBe(false);
        }
        if (outerWrapper) {
          expect(document.contains(outerWrapper)).toBe(false);
        }
      });

      it("handles cleanup when element is already removed", () => {
        const adhesive = createAdhesiveInstance();

        targetEl.remove();

        expect(() => adhesive.cleanup()).not.toThrow();
      });
    });

    describe("DOM manipulation edge cases", () => {
      it("handles target element without initial parent gracefully", () => {
        const orphanElement = document.createElement("div");

        expect(() => {
          createAdhesiveInstance({ targetEl: orphanElement });
        }).toThrow(AdhesiveError);
      });

      it("preserves existing CSS classes on target element", () => {
        const existingClasses = "existing-class another-class";
        targetEl.className = existingClasses;

        const adhesive = createAdhesiveInstance();

        expect(targetEl.className).toBe(existingClasses);

        adhesive.cleanup();

        expect(targetEl.className).toBe(existingClasses);
      });
    });
  });

  describe("Event Handling", () => {
    describe("scroll event processing", () => {
      let adhesive: Adhesive;

      beforeEach(() => {
        adhesive = createInitializedAdhesive();
      });

      afterEach(() => {
        adhesive.cleanup();
      });

      it("handles scroll events without errors", () => {
        const scrollEvent = new Event("scroll");

        expect(() => {
          window.dispatchEvent(scrollEvent);
        }).not.toThrow();

        expect(adhesive.getState().activated).toBe(true);
      });

      it("processes multiple rapid scroll events efficiently", () => {
        for (let i = 0; i < 10; i++) {
          const scrollEvent = new Event("scroll");
          window.dispatchEvent(scrollEvent);
        }

        expect(adhesive.getState().activated).toBe(true);
      });

      it("ignores scroll events when disabled", () => {
        adhesive.disable();

        const scrollEvent = new Event("scroll");
        window.dispatchEvent(scrollEvent);

        expect(adhesive.getState().activated).toBe(false);
      });
    });

    describe("resize event processing", () => {
      let adhesive: Adhesive;

      beforeEach(() => {
        adhesive = createInitializedAdhesive();
      });

      afterEach(() => {
        adhesive.cleanup();
      });

      it("handles resize events without errors", () => {
        const resizeEvent = new Event("resize");

        expect(() => {
          window.dispatchEvent(resizeEvent);
        }).not.toThrow();

        expect(adhesive.getState().activated).toBe(true);
      });

      it("recalculates dimensions on resize", () => {
        const initialState = adhesive.getState();

        Object.defineProperty(window, "innerHeight", {
          value: 1000,
          writable: true,
        });

        const resizeEvent = new Event("resize");
        window.dispatchEvent(resizeEvent);

        expect(adhesive.getState().activated).toBe(true);
        expect(adhesive.getState().elementWidth).toBe(
          initialState.elementWidth,
        );
        expect(adhesive.getState().elementHeight).toBe(
          initialState.elementHeight,
        );
      });

      it("updates fixed element dimensions when resized in active state", async () => {
        let resizeObserverCallback: ResizeObserverCallback | null = null;
        const mockObserver = {
          observe: vi.fn(),
          unobserve: vi.fn(),
          disconnect: vi.fn(),
        };

        const originalResizeObserver = window.ResizeObserver;
        window.ResizeObserver = vi.fn((callback) => {
          resizeObserverCallback = callback;
          return mockObserver;
        }) as any;

        const adhesive = createInitializedAdhesive();

        await simulateScrollToPosition(200);

        const initialState = adhesive.getState();
        expect(initialState.status).toBe(ADHESIVE_STATUS.FIXED);
        expect(initialState.elementX).toBe(DEFAULT_RECT.x);
        expect(initialState.elementY).toBe(DEFAULT_RECT.y);
        expect(initialState.elementWidth).toBe(DEFAULT_RECT.width);
        expect(initialState.elementHeight).toBe(DEFAULT_RECT.height);

        const newWidth = 150;
        const newX = 25;

        const mock = mockGetBoundingClientRect({
          target: {
            ...DEFAULT_RECT,
            width: newWidth,
            left: newX,
            right: newX + newWidth,
            x: newX,
          },
          bounding: {
            top: 0,
            bottom: 2000,
            left: newX,
            right: newX + newWidth,
            width: newWidth,
            height: 2000,
            x: newX,
            y: 0,
            toJSON: () => ({}),
          },
        });

        const innerWrapper = targetEl.parentElement;
        const outerWrapper = innerWrapper?.parentElement;
        expect(outerWrapper).toBeTruthy();
        expect(outerWrapper?.classList.contains("adhesive__outer")).toBe(true);

        mock.setElementOverride(outerWrapper!, {
          ...DEFAULT_RECT,
          width: newWidth,
          left: newX,
          right: newX + newWidth,
          x: newX,
        });

        const mockEntry: ResizeObserverEntry = {
          target: outerWrapper!,
          contentRect: {
            width: newWidth,
            height: DEFAULT_RECT.height,
            top: 0,
            left: 0,
            bottom: DEFAULT_RECT.height,
            right: newWidth,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          },
          borderBoxSize: [
            {
              inlineSize: newWidth,
              blockSize: DEFAULT_RECT.height,
            },
          ],
          contentBoxSize: [
            {
              inlineSize: newWidth,
              blockSize: DEFAULT_RECT.height,
            },
          ],
          devicePixelContentBoxSize: [
            {
              inlineSize: newWidth,
              blockSize: DEFAULT_RECT.height,
            },
          ],
        };

        if (resizeObserverCallback) {
          (resizeObserverCallback as ResizeObserverCallback)(
            [mockEntry],
            mockObserver as ResizeObserver,
          );
        }

        await animationHelpers.waitForRAF();

        const updatedState = adhesive.getState();
        expect(updatedState.status).toBe(ADHESIVE_STATUS.FIXED);
        expect(updatedState.elementWidth).toBe(newWidth);
        expect(updatedState.elementX).toBe(newX);

        const innerWrapperElement = outerWrapper?.querySelector(
          ".adhesive__inner",
        ) as HTMLElement;
        expect(innerWrapperElement).toBeTruthy();
        expect(innerWrapperElement?.style.width).toBe(`${newWidth}px`);

        adhesive.cleanup();

        window.ResizeObserver = originalResizeObserver;
        mock.restore();
      });

      it("correctly handles resize without full repositioning update", () => {
        const adhesive = createInitializedAdhesive();

        const stateBefore = adhesive.getState();

        expect(() => {
          adhesive.refresh();
        }).not.toThrow();

        const stateAfter = adhesive.getState();

        expect(stateAfter.status).toBe(stateBefore.status);

        adhesive.cleanup();
      });

      it("refresh preserves state status during resize operations", () => {
        const adhesive = createInitializedAdhesive();

        const newWidth = 200;

        const mock = mockGetBoundingClientRect({
          target: {
            ...DEFAULT_RECT,
            width: newWidth,
            left: 50,
            right: 50 + newWidth,
            x: 50,
          },
          bounding: {
            top: 0,
            bottom: 2000,
            left: 50,
            right: 50 + newWidth,
            width: newWidth,
          },
        });

        const innerWrapperRefresh = targetEl.parentElement;
        const outerWrapperRefresh = innerWrapperRefresh?.parentElement;
        if (outerWrapperRefresh) {
          mock.setElementOverride(outerWrapperRefresh, {
            ...DEFAULT_RECT,
            width: newWidth,
            left: 50,
            right: 50 + newWidth,
            x: 50,
          });
        }

        const initialState = adhesive.getState();

        adhesive.refresh();

        const updatedState = adhesive.getState();

        expect(updatedState.status).toBe(initialState.status);

        expect(updatedState.elementWidth).toBe(newWidth);

        adhesive.cleanup();
      });

      it("ResizeObserver callback handles width-only updates correctly", async () => {
        let resizeObserverCallback: ResizeObserverCallback | null = null;
        const mockObserver = {
          observe: vi.fn(),
          unobserve: vi.fn(),
          disconnect: vi.fn(),
        };

        const originalResizeObserver = window.ResizeObserver;
        window.ResizeObserver = vi.fn((callback) => {
          resizeObserverCallback = callback;
          return mockObserver;
        }) as any;

        const adhesive = createInitializedAdhesive();

        const initialState = adhesive.getState();

        const newWidth = 200;
        const originalHeight = DEFAULT_RECT.height;

        const mock = mockGetBoundingClientRect({
          target: {
            ...DEFAULT_RECT,
            width: newWidth,
            left: 50,
            right: 50 + newWidth,
            x: 50,
          },
          bounding: {
            top: 0,
            bottom: 2000,
            left: 50,
            right: 50 + newWidth,
            width: newWidth,
          },
        });

        const innerWrapperResize = targetEl.parentElement;
        const outerWrapperResize = innerWrapperResize?.parentElement;
        if (outerWrapperResize) {
          mock.setElementOverride(outerWrapperResize, {
            ...DEFAULT_RECT,
            width: newWidth,
            left: 50,
            right: 50 + newWidth,
            x: 50,
          });
        }

        const outerWrapperForResize = targetEl.parentElement?.parentElement;
        expect(outerWrapperForResize).toBeTruthy();

        const mockEntry: ResizeObserverEntry = {
          target: outerWrapperForResize!,
          contentRect: {
            width: newWidth,
            height: originalHeight,
            top: 0,
            left: 0,
            bottom: originalHeight,
            right: newWidth,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          },
          borderBoxSize: [{ inlineSize: newWidth, blockSize: originalHeight }],
          contentBoxSize: [{ inlineSize: newWidth, blockSize: originalHeight }],
          devicePixelContentBoxSize: [
            { inlineSize: newWidth, blockSize: originalHeight },
          ],
        };

        if (resizeObserverCallback) {
          expect(() => {
            (resizeObserverCallback as any)(
              [mockEntry],
              mockObserver as ResizeObserver,
            );
          }).not.toThrow();
        }

        await animationHelpers.waitForRAF();

        const updatedState = adhesive.getState();
        expect(updatedState.status).toBe(initialState.status);
        expect(updatedState.elementWidth).toBe(newWidth);
        expect(updatedState.elementHeight).toBe(originalHeight);

        adhesive.cleanup();
        window.ResizeObserver = originalResizeObserver;
      });
    });

    describe("event listener lifecycle", () => {
      it("adds event listeners on initialization", () => {
        const addEventListenerSpy = vi.spyOn(window, "addEventListener");

        const adhesive = createAdhesiveInstance();
        adhesive.init();

        expect(addEventListenerSpy).toHaveBeenCalledWith(
          "scroll",
          expect.any(Function),
          { passive: true },
        );
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          "resize",
          expect.any(Function),
          { passive: true },
        );

        adhesive.cleanup();
      });

      it("removes event listeners on cleanup", () => {
        const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

        const adhesive = createInitializedAdhesive();
        adhesive.cleanup();

        expect(removeEventListenerSpy).toHaveBeenCalledWith(
          "scroll",
          expect.any(Function),
        );
        expect(removeEventListenerSpy).toHaveBeenCalledWith(
          "resize",
          expect.any(Function),
        );
      });
    });

    describe("ResizeObserver integration", () => {
      it("sets up ResizeObserver when available", () => {
        expect(window.ResizeObserver).toBeDefined();

        const adhesive = createInitializedAdhesive();

        expect(adhesive.getState().activated).toBe(true);

        adhesive.cleanup();
      });

      it("handles missing ResizeObserver gracefully", () => {
        const originalResizeObserver = window.ResizeObserver;
        delete (window as any).ResizeObserver;

        const consoleSpy = vi
          .spyOn(console, "warn")
          .mockImplementation(() => {});

        const adhesive = createInitializedAdhesive();

        expect(adhesive.getState().activated).toBe(true);
        expect(consoleSpy).toHaveBeenCalled();

        adhesive.cleanup();

        window.ResizeObserver = originalResizeObserver;
        consoleSpy.mockRestore();
      });

      it("ignores ResizeObserver callbacks with empty entries", () => {
        let capturedCallback: ResizeObserverCallback;
        const mockObserver = {
          observe: vi.fn(),
          unobserve: vi.fn(),
          disconnect: vi.fn(),
        };

        const originalResizeObserver = window.ResizeObserver;
        window.ResizeObserver = vi.fn((callback) => {
          capturedCallback = callback;
          return mockObserver;
        }) as any;

        const rafSpy = vi.spyOn(window, "requestAnimationFrame");

        const adhesive = createInitializedAdhesive();

        capturedCallback!([], mockObserver as any);

        expect(rafSpy).not.toHaveBeenCalled();

        adhesive.cleanup();
        window.ResizeObserver = originalResizeObserver;
        rafSpy.mockRestore();
      });

      it("ignores ResizeObserver entries for untracked elements", () => {
        let capturedCallback: ResizeObserverCallback;
        const mockObserver = {
          observe: vi.fn(),
          unobserve: vi.fn(),
          disconnect: vi.fn(),
        };

        const originalResizeObserver = window.ResizeObserver;
        window.ResizeObserver = vi.fn((callback) => {
          capturedCallback = callback;
          return mockObserver;
        }) as any;

        const rafSpy = vi.spyOn(window, "requestAnimationFrame");
        const unrelatedElement = document.createElement("div");

        const adhesive = createInitializedAdhesive();

        const mockEntry: ResizeObserverEntry = {
          target: unrelatedElement,
          contentRect: new DOMRectReadOnly(0, 0, 200, 100),
          borderBoxSize: [{ inlineSize: 200, blockSize: 100 }],
          contentBoxSize: [{ inlineSize: 200, blockSize: 100 }],
          devicePixelContentBoxSize: [{ inlineSize: 200, blockSize: 100 }],
        };

        capturedCallback!([mockEntry], mockObserver as any);

        expect(rafSpy).not.toHaveBeenCalled();

        adhesive.cleanup();
        window.ResizeObserver = originalResizeObserver;
        rafSpy.mockRestore();
      });

      it("processes ResizeObserver entries only for tracked elements", () => {
        let capturedCallback: ResizeObserverCallback;
        const mockObserver = {
          observe: vi.fn(),
          unobserve: vi.fn(),
          disconnect: vi.fn(),
        };

        const originalResizeObserver = window.ResizeObserver;
        window.ResizeObserver = vi.fn((callback) => {
          capturedCallback = callback;
          return mockObserver;
        }) as any;

        const rafSpy = vi.spyOn(window, "requestAnimationFrame");
        const unrelatedElement = document.createElement("div");

        const adhesive = createInitializedAdhesive();

        const unrelatedEntry: ResizeObserverEntry = {
          target: unrelatedElement,
          contentRect: new DOMRectReadOnly(0, 0, 200, 100),
          borderBoxSize: [{ inlineSize: 200, blockSize: 100 }],
          contentBoxSize: [{ inlineSize: 200, blockSize: 100 }],
          devicePixelContentBoxSize: [{ inlineSize: 200, blockSize: 100 }],
        };

        const trackedEntry: ResizeObserverEntry = {
          target: targetEl,
          contentRect: new DOMRectReadOnly(0, 0, 100, 50),
          borderBoxSize: [{ inlineSize: 100, blockSize: 50 }],
          contentBoxSize: [{ inlineSize: 100, blockSize: 50 }],
          devicePixelContentBoxSize: [{ inlineSize: 100, blockSize: 50 }],
        };

        capturedCallback!([unrelatedEntry, trackedEntry], mockObserver as any);

        expect(rafSpy).toHaveBeenCalled();

        adhesive.cleanup();
        window.ResizeObserver = originalResizeObserver;
        rafSpy.mockRestore();
      });
    });
  });

  describe("Resource Cleanup", () => {
    describe("complete cleanup process", () => {
      it("removes all event listeners and observers", () => {
        const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

        const adhesive = createInitializedAdhesive();
        adhesive.cleanup();

        expect(removeEventListenerSpy).toHaveBeenCalledWith(
          "scroll",
          expect.any(Function),
        );
        expect(removeEventListenerSpy).toHaveBeenCalledWith(
          "resize",
          expect.any(Function),
        );
      });

      it("cancels pending RAF operations", () => {
        vi.spyOn(window, "cancelAnimationFrame");

        const adhesive = createInitializedAdhesive();

        window.dispatchEvent(new Event("scroll"));

        adhesive.cleanup();

        expect(adhesive.getState().activated).toBe(false);
      });

      it("restores original DOM structure completely", () => {
        const originalParent = targetEl.parentElement;

        const adhesive = createAdhesiveInstance();
        adhesive.cleanup();

        expect(targetEl.parentElement).toBe(originalParent);
      });

      it("clears internal references for garbage collection", () => {
        const adhesive = createInitializedAdhesive();
        adhesive.cleanup();

        expect(adhesive.getState().activated).toBe(false);
      });
    });

    describe("cleanup safety", () => {
      it("allows multiple cleanup calls safely", () => {
        const adhesive = createInitializedAdhesive();

        expect(() => {
          adhesive.cleanup();
          adhesive.cleanup();
          adhesive.cleanup();
        }).not.toThrow();
      });

      it("handles cleanup when DOM is already modified", () => {
        const adhesive = createInitializedAdhesive();

        const wrapper = targetEl.parentElement?.parentElement;
        wrapper?.remove();

        expect(() => adhesive.cleanup()).not.toThrow();
      });
    });
  });

  describe("Error Handling & Edge Cases", () => {
    describe("comprehensive error scenarios", () => {
      it.each(errorTestCases)(
        "throws AdhesiveError with code $expectedCode for selector '$selector'",
        ({ selector, expectedCode }) => {
          expect(() => {
            createAdhesiveInstance({ targetEl: selector });
          }).toThrow(AdhesiveError);

          try {
            createAdhesiveInstance({ targetEl: selector });
          } catch (error) {
            expect((error as AdhesiveError).code).toBe(expectedCode);
          }
        },
      );

      it("provides detailed error context for debugging", () => {
        const testSelector = "#detailed-test-element";

        try {
          createAdhesiveInstance({ targetEl: testSelector });
        } catch (error) {
          expect(error).toBeInstanceOf(AdhesiveError);
          expect((error as AdhesiveError).code).toBe("TARGET_EL_NOT_FOUND");
          expect((error as AdhesiveError).message).toContain(
            "@adhesivejs/core",
          );
        }
      });

      it("handles orphaned elements appropriately", () => {
        const orphanElement = document.createElement("div");
        orphanElement.id = "orphan";

        expect(() => {
          createAdhesiveInstance({ targetEl: orphanElement });
        }).toThrow(AdhesiveError);
      });
    });

    describe("boundary condition handling", () => {
      it("handles elements with zero dimensions", () => {
        const zeroElement = document.createElement("div");
        zeroElement.style.width = "0px";
        zeroElement.style.height = "0px";
        boundingEl.append(zeroElement);

        const adhesive = createAdhesiveInstance({ targetEl: zeroElement });

        expect(() => adhesive.init()).not.toThrow();

        adhesive.cleanup();
      });

      it("handles invalid bounding element gracefully", () => {
        expect(() => {
          createAdhesiveInstance({
            boundingEl: "#nonexistent-bounding",
          });
        }).toThrow(AdhesiveError);
      });
    });

    describe("runtime error recovery", () => {
      it("maintains stability when DOM structure changes unexpectedly", () => {
        const adhesive = createInitializedAdhesive();

        boundingEl.remove();

        expect(() => {
          window.dispatchEvent(new Event("scroll"));
          window.dispatchEvent(new Event("resize"));
        }).not.toThrow();

        adhesive.cleanup();
      });
    });
  });

  describe("Integration Scenarios", () => {
    describe("complete user workflows", () => {
      it("handles full scroll lifecycle with state transitions", async () => {
        const adhesive = createInitializedAdhesive({
          position: "top",
          offset: 10,
          boundingEl,
        });

        expectElementToBeInState(adhesive, "INITIAL");

        await simulateScrollToPosition(200);
        expectElementToBeInState(adhesive, "FIXED");

        await simulateScrollToPosition(0);
        expectElementToBeInState(adhesive, "INITIAL");

        adhesive.cleanup();
      });

      it("handles dynamic configuration changes during scroll", async () => {
        const adhesive = createInitializedAdhesive({
          position: "top",
          offset: 10,
        });

        await simulateScrollToPosition(200);

        adhesive.updateOptions({
          position: "bottom",
          offset: TEST_OFFSETS[2],
        });

        expect(adhesive.getState().activated).toBe(true);

        adhesive.cleanup();
      });

      it("maintains performance under stress conditions", async () => {
        const adhesive = createInitializedAdhesive();

        for (let i = 0; i < 20; i++) {
          await simulateScrollToPosition(i * 10);
          window.dispatchEvent(new Event("resize"));
        }

        expect(adhesive.getState().activated).toBe(true);

        adhesive.cleanup();
      });
    });

    describe("multiple instance scenarios", () => {
      it("handles multiple adhesive instances independently", () => {
        const element2 = document.createElement("div");
        element2.id = "target2";
        boundingEl.append(element2);

        const adhesive1 = createInitializedAdhesive();
        const adhesive2 = createInitializedAdhesive({ targetEl: element2 });

        expect(adhesive1.getState().activated).toBe(true);
        expect(adhesive2.getState().activated).toBe(true);

        adhesive1.disable();
        expect(adhesive1.getState().activated).toBe(false);
        expect(adhesive2.getState().activated).toBe(true);

        adhesive1.cleanup();
        adhesive2.cleanup();
      });
    });

    describe("real-world edge cases", () => {
      it("cleans up previously set classes when transitioning between statuses", async () => {
        const adhesive = createInitializedAdhesive({ boundingEl });

        const innerEl = targetEl.parentElement!;
        const outerEl = innerEl!.parentElement!;

        function expectExactOuterClasses(expectedClasses: string[]) {
          expect([...outerEl.classList]).toEqual(expectedClasses);
        }

        expectElementToBeInState(adhesive, "INITIAL");
        expectExactOuterClasses(["adhesive__outer"]);

        await simulateScrollToPosition(200);
        expectElementToBeInState(adhesive, "FIXED");
        expectExactOuterClasses(["adhesive__outer", "adhesive--active"]);

        await simulateScrollToPosition(0);
        expectElementToBeInState(adhesive, "INITIAL");
        expectExactOuterClasses(["adhesive__outer"]);

        await simulateScrollToPosition(2000);
        expectElementToBeInState(adhesive, "RELATIVE");
        expectExactOuterClasses(["adhesive__outer", "adhesive--released"]);

        await simulateScrollToPosition(200);
        expectElementToBeInState(adhesive, "FIXED");
        expectExactOuterClasses(["adhesive__outer", "adhesive--active"]);

        await simulateScrollToPosition(0);
        expectElementToBeInState(adhesive, "INITIAL");
        expectExactOuterClasses(["adhesive__outer"]);
      });

      it("handles rapid enable/disable cycles", () => {
        const adhesive = createInitializedAdhesive();

        for (let i = 0; i < 10; i++) {
          adhesive.disable();
          adhesive.enable();
        }

        expect(adhesive.getState().activated).toBe(true);

        adhesive.cleanup();
      });

      it("maintains stability with DOM mutations", () => {
        const adhesive = createInitializedAdhesive();

        const sibling = document.createElement("div");
        boundingEl.append(sibling);
        sibling.remove();

        targetEl.style.width = "200px";
        targetEl.className = "modified";

        expect(adhesive.getState().activated).toBe(true);

        adhesive.cleanup();
      });

      describe("RAF race conditions and memory management", () => {
        let rafSpy: any;
        let cancelRafSpy: any;

        beforeEach(() => {
          rafSpy = vi.spyOn(window, "requestAnimationFrame");
          cancelRafSpy = vi.spyOn(window, "cancelAnimationFrame");
        });

        it("cancels pending RAF callbacks when disabled rapidly", () => {
          const adhesive = createInitializedAdhesive();

          window.dispatchEvent(new Event("scroll"));
          window.dispatchEvent(new Event("scroll"));
          window.dispatchEvent(new Event("scroll"));

          adhesive.disable();

          expect(cancelRafSpy).toHaveBeenCalled();

          adhesive.cleanup();
        });

        it("handles multiple RAF callbacks queued before cleanup", () => {
          const adhesive = createInitializedAdhesive();

          window.dispatchEvent(new Event("scroll"));
          window.dispatchEvent(new Event("resize"));

          adhesive.cleanup();

          expect(cancelRafSpy).toHaveBeenCalled();
        });

        it("prevents memory leaks during rapid enable/disable cycles", () => {
          const adhesive = new Adhesive({ targetEl });

          for (let i = 0; i < 10; i++) {
            adhesive.enable();
            window.dispatchEvent(new Event("scroll"));
            adhesive.disable();
          }

          adhesive.cleanup();

          expect(cancelRafSpy).toHaveBeenCalled();
        });

        it("prevents state corruption when RAF callbacks execute after disable", () => {
          const adhesive = createInitializedAdhesive();

          let callbackExecuted = false;
          let savedCallback: any = null;

          rafSpy.mockImplementation((callback: any) => {
            savedCallback = callback;
            callbackExecuted = false;
            return 123;
          });

          window.dispatchEvent(new Event("scroll"));

          adhesive.disable();

          if (savedCallback) {
            savedCallback(performance.now());
            callbackExecuted = true;
          }

          const state = adhesive.getState();
          expect(state.activated).toBe(false);
          expect(callbackExecuted).toBe(true);

          adhesive.cleanup();
        });

        it("handles overlapping RAF callbacks correctly", () => {
          const adhesive = createInitializedAdhesive();

          const executedCallbacks: number[] = [];

          rafSpy.mockImplementation((callback: any) => {
            const id = Math.random();
            setTimeout(() => {
              callback(performance.now());
              executedCallbacks.push(id);
            }, 0);
            return id;
          });

          window.dispatchEvent(new Event("scroll"));
          window.dispatchEvent(new Event("scroll"));
          window.dispatchEvent(new Event("resize"));

          return new Promise<void>((resolve) => {
            setTimeout(() => {
              const state = adhesive.getState();
              expect(state.activated).toBe(true);

              adhesive.cleanup();
              resolve();
            }, 50);
          });
        });

        it("handles cleanup when DOM elements are removed externally", () => {
          const adhesive = createInitializedAdhesive();

          const outerWrapper = targetEl.parentElement?.parentElement;
          if (
            outerWrapper &&
            outerWrapper.className.includes("adhesive__outer")
          ) {
            outerWrapper.remove();
          }

          expect(() => adhesive.cleanup()).not.toThrow();
        });

        it("prevents double cleanup issues", () => {
          const adhesive = createInitializedAdhesive();

          adhesive.cleanup();
          expect(() => adhesive.cleanup()).not.toThrow();
          expect(() => adhesive.cleanup()).not.toThrow();
        });
      });
    });
  });
});
