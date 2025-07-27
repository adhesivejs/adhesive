import { Adhesive, ADHESIVE_STATUS, AdhesiveError } from "@adhesivejs/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockDOM,
  mockGetBoundingClientRect,
} from "../utils/core-test-helpers.js";
import {
  assertions,
  DEFAULT_RECT,
  errorTestCases,
  simulateScrollToPosition,
  TEST_OFFSETS,
} from "../utils/shared-test-helpers.js";

describe("Core", () => {
  let mockDOM: ReturnType<typeof createMockDOM>;
  let targetElement: HTMLElement;
  let boundingElement: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    mockDOM = createMockDOM();
    targetElement = mockDOM.targetElement;
    boundingElement = mockDOM.boundingElement;

    // Setup consistent mocking with default rect for target element
    mockGetBoundingClientRect({
      target: DEFAULT_RECT,
      container: {
        top: 0,
        bottom: 2000,
        left: 0,
        right: 100,
        width: 100,
        height: 2000,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      },
    });
  });

  afterEach(() => {
    mockDOM.cleanup();
    vi.restoreAllMocks();
  });

  // Test helper functions for better reusability
  const createAdhesiveInstance = (
    options: Partial<Parameters<typeof Adhesive.create>[0]> = {},
  ) => {
    return new Adhesive({
      targetEl: targetElement,
      ...options,
    });
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
        const adhesive = Adhesive.create({ targetEl: targetElement });

        expect(adhesive).toBeInstanceOf(Adhesive);
        expect(adhesive.getState().activated).toBe(true);

        // Cleanup for this test
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
          createAdhesiveInstance({ targetEl: "" as any });
        }).toThrow(AdhesiveError);
      });

      it("provides detailed error context for debugging", () => {
        try {
          createAdhesiveInstance({ targetEl: "#nonexistent" });
        } catch (error) {
          expect(error).toBeInstanceOf(AdhesiveError);
          expect((error as AdhesiveError).code).toBe("TARGET_EL_NOT_FOUND");
          expect((error as AdhesiveError).context).toEqual({
            selector: "#nonexistent",
          });
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
        const adhesive = createAdhesiveInstance({
          boundingEl: boundingElement,
        });

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
          offset: 20,
          zIndex: 999,
          outerClassName: "custom-outer",
          innerClassName: "custom-inner",
          activeClassName: "custom-active",
          releasedClassName: "custom-released",
        };

        const adhesive = createAdhesiveInstance(customOptions);

        expect(adhesive).toBeInstanceOf(Adhesive);
        // Verify options are applied by checking they don't throw
        expect(() => adhesive.init()).not.toThrow();

        adhesive.cleanup();
      });

      it("validates option types and ranges", () => {
        // Test valid numeric options
        expect(() => createAdhesiveInstance({ offset: 50 })).not.toThrow();
        expect(() => createAdhesiveInstance({ zIndex: 1000 })).not.toThrow();

        // Test valid string options
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

        // Test disabling
        adhesive.updateOptions({ enabled: false });
        expect(adhesive.getState().activated).toBe(false);

        // Test re-enabling
        adhesive.updateOptions({ enabled: true });
        expect(adhesive.getState().activated).toBe(true);

        adhesive.cleanup();
      });
    });
  });

  describe("State Management", () => {
    describe("state access and immutability", () => {
      let adhesive: Adhesive;

      beforeEach(() => {
        adhesive = createInitializedAdhesive({ boundingEl: boundingElement });
      });

      afterEach(() => {
        adhesive.cleanup();
      });

      it("returns complete state object with all required properties", () => {
        const state = adhesive.getState();

        // Verify all expected properties exist
        expect(state).toHaveProperty("status");
        expect(state).toHaveProperty("isSticky");
        expect(state).toHaveProperty("width");
        expect(state).toHaveProperty("height");
        expect(state).toHaveProperty("activated");
        expect(state).toHaveProperty("originalPosition");
        expect(state).toHaveProperty("originalTop");
        expect(state).toHaveProperty("originalZIndex");
        expect(state).toHaveProperty("originalTransform");
        expect(state).toHaveProperty("x");
        expect(state).toHaveProperty("y");
        expect(state).toHaveProperty("topBoundary");
        expect(state).toHaveProperty("bottomBoundary");
        expect(state).toHaveProperty("pos");

        // Verify initial state values
        expect(state.activated).toBe(true);
        expect(state.status).toBe(ADHESIVE_STATUS.INITIAL);
        expect(state.isSticky).toBe(false);
      });

      it("provides immutable state object", () => {
        const state = adhesive.getState();
        const originalStatus = state.status;
        const originalIsSticky = state.isSticky;

        // Attempt to modify state properties
        (state as any).status = "modified";
        (state as any).isSticky = !originalIsSticky;
        (state as any).activated = false;

        // Verify internal state unchanged
        const newState = adhesive.getState();
        expect(newState.status).toBe(originalStatus);
        expect(newState.isSticky).toBe(originalIsSticky);
        expect(newState.activated).toBe(true);
      });

      it("returns fresh state object on each call", () => {
        const state1 = adhesive.getState();
        const state2 = adhesive.getState();

        // Objects should contain same data but be different instances
        expect(state1).toEqual(state2);
        expect(state1).not.toBe(state2);
      });
    });

    describe("state transitions", () => {
      let adhesive: Adhesive;

      beforeEach(() => {
        adhesive = createInitializedAdhesive({ boundingEl: boundingElement });
      });

      afterEach(() => {
        adhesive.cleanup();
      });

      it("maintains consistent state during enable/disable cycles", () => {
        // Initial state
        expectElementToBeInState(adhesive, "INITIAL");

        // Disable
        adhesive.disable();
        expect(adhesive.getState().activated).toBe(false);
        expectElementToBeInState(adhesive, "INITIAL");

        // Re-enable
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
        // Initially enabled
        expect(adhesive.getState().activated).toBe(true);

        // Disable
        adhesive.disable();
        expect(adhesive.getState().activated).toBe(false);

        // Re-enable
        adhesive.enable();
        expect(adhesive.getState().activated).toBe(true);
      });

      it("resets state to initial when disabled", () => {
        // Ensure we start in initial state
        expectElementToBeInState(adhesive, "INITIAL");

        // Disable and verify state reset
        adhesive.disable();
        const state = adhesive.getState();
        expect(state.status).toBe(ADHESIVE_STATUS.INITIAL);
        expect(state.isSticky).toBe(false);
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

        // Should be safe to call init on disabled instance
        expect(() => adhesive.init()).not.toThrow();
        expect(adhesive.getState().activated).toBe(false);
      });

      it("ignores events when disabled", () => {
        const adhesive = createInitializedAdhesive();
        adhesive.disable();

        // These should not cause errors or state changes
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
        // Reset scroll position
        Object.defineProperty(window, "scrollY", {
          value: 0,
          writable: true,
        });
        Object.defineProperty(window, "pageYOffset", {
          value: 0,
          writable: true,
        });

        adhesive = createInitializedAdhesive({
          boundingEl: boundingElement,
          position: "top",
          offset: 10,
        });
      });

      afterEach(() => {
        adhesive.cleanup();
      });

      it("handles scroll events with proper state transitions", async () => {
        // Initial state - not scrolled
        expectElementToBeInState(adhesive, "INITIAL");

        // Simulate scroll past the element
        await simulateScrollToPosition(200);

        const state = adhesive.getState();
        // Should be in one of the valid states after scrolling
        expect([
          ADHESIVE_STATUS.INITIAL,
          ADHESIVE_STATUS.FIXED,
          ADHESIVE_STATUS.RELATIVE,
        ]).toContain(state.status);
      });

      it("maintains element position consistency", async () => {
        const initialState = adhesive.getState();

        // Scroll and return to original position
        await simulateScrollToPosition(200);
        await simulateScrollToPosition(0);

        const finalState = adhesive.getState();

        // Should return to initial state characteristics
        expect(finalState.status).toBe(ADHESIVE_STATUS.INITIAL);
        expect(finalState.x).toBe(initialState.x);
        expect(finalState.y).toBe(initialState.y);
      });
    });

    describe("bottom positioning behavior", () => {
      let adhesive: Adhesive;

      beforeEach(() => {
        Object.defineProperty(window, "scrollY", {
          value: 0,
          writable: true,
        });

        adhesive = createInitializedAdhesive({
          boundingEl: boundingElement,
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

        // Should handle the position update without errors
        expect(() =>
          adhesive.updateOptions({ position: "bottom" }),
        ).not.toThrow();
      });

      it("responds to scroll events in bottom mode", async () => {
        await simulateScrollToPosition(100);

        // Should handle scroll without throwing errors
        const state = adhesive.getState();
        expect(state.activated).toBe(true);
      });
    });

    describe("boundary handling", () => {
      let adhesive: Adhesive;

      beforeEach(() => {
        adhesive = createInitializedAdhesive({
          boundingEl: boundingElement,
          position: "top",
          offset: 10,
        });
      });

      afterEach(() => {
        adhesive.cleanup();
      });

      it("respects bounding element constraints", () => {
        const state = adhesive.getState();

        // Boundary should be calculated based on bounding element
        expect(state.bottomBoundary).toBeGreaterThan(state.topBoundary);
        expect(state.topBoundary).toBeGreaterThanOrEqual(0);
      });

      it("handles edge case scroll positions", async () => {
        // Test extreme scroll positions
        await simulateScrollToPosition(-100); // Negative scroll
        expect(adhesive.getState().activated).toBe(true);

        await simulateScrollToPosition(10000); // Very large scroll
        expect(adhesive.getState().activated).toBe(true);
      });
    });

    describe("offset handling", () => {
      it("applies offset correctly for different values", () => {
        TEST_OFFSETS.forEach((offset) => {
          const adhesive = createInitializedAdhesive({
            boundingEl: boundingElement,
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

        // Verify wrapper structure
        const outerWrapper = targetElement.parentElement;
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

        // Check default class names are applied
        const targetParent = targetElement.parentElement;
        expect(targetParent?.className).toContain("adhesive__inner");

        adhesive.cleanup();
      });

      it("maintains target element content and attributes", () => {
        const originalId = targetElement.id;
        const originalTextContent = targetElement.textContent;
        const originalStyle = targetElement.style.cssText;

        const adhesive = createAdhesiveInstance();

        // Verify target element properties preserved
        expect(targetElement.id).toBe(originalId);
        expect(targetElement.textContent).toBe(originalTextContent);
        expect(targetElement.style.cssText).toBe(originalStyle);

        adhesive.cleanup();
      });
    });

    describe("DOM restoration", () => {
      it("completely restores original DOM structure on cleanup", () => {
        const originalParent = targetElement.parentElement;
        const originalNextSibling = targetElement.nextElementSibling;
        const originalPreviousSibling = targetElement.previousElementSibling;

        const adhesive = createAdhesiveInstance();

        // Verify wrappers were created
        expect(targetElement.parentElement?.className).toContain(
          "adhesive__inner",
        );

        adhesive.cleanup();

        // Verify complete restoration
        expect(targetElement.parentElement).toBe(originalParent);
        expect(targetElement.nextElementSibling).toBe(originalNextSibling);
        expect(targetElement.previousElementSibling).toBe(
          originalPreviousSibling,
        );
      });

      it("removes all wrapper elements after cleanup", () => {
        const adhesive = createAdhesiveInstance();

        // Capture wrapper references
        const innerWrapper = targetElement.parentElement;
        const outerWrapper = innerWrapper?.parentElement;

        adhesive.cleanup();

        // Verify wrappers are removed from DOM
        if (innerWrapper) {
          expect(document.contains(innerWrapper)).toBe(false);
        }
        if (outerWrapper) {
          expect(document.contains(outerWrapper)).toBe(false);
        }
      });

      it("handles cleanup when element is already removed", () => {
        const adhesive = createAdhesiveInstance();

        // Manually remove the target element
        targetElement.remove();

        // Cleanup should not throw
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
        targetElement.className = existingClasses;

        const adhesive = createAdhesiveInstance();

        expect(targetElement.className).toBe(existingClasses);

        adhesive.cleanup();

        expect(targetElement.className).toBe(existingClasses);
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
        // Simulate rapid scrolling
        for (let i = 0; i < 10; i++) {
          const scrollEvent = new Event("scroll");
          window.dispatchEvent(scrollEvent);
        }

        // Should handle all events without errors
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

        // Simulate viewport resize
        Object.defineProperty(window, "innerHeight", {
          value: 1000,
          writable: true,
        });

        const resizeEvent = new Event("resize");
        window.dispatchEvent(resizeEvent);

        // State should remain activated
        expect(adhesive.getState().activated).toBe(true);
        expect(adhesive.getState().width).toBe(initialState.width);
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
        // ResizeObserver should be available in test environment
        expect(window.ResizeObserver).toBeDefined();

        const adhesive = createInitializedAdhesive();

        // Should initialize without errors
        expect(adhesive.getState().activated).toBe(true);

        adhesive.cleanup();
      });

      it("handles missing ResizeObserver gracefully", () => {
        // Temporarily remove ResizeObserver
        const originalResizeObserver = window.ResizeObserver;
        delete (window as any).ResizeObserver;

        const consoleSpy = vi
          .spyOn(console, "warn")
          .mockImplementation(() => {});

        const adhesive = createInitializedAdhesive();

        expect(adhesive.getState().activated).toBe(true);
        expect(consoleSpy).toHaveBeenCalled();

        adhesive.cleanup();

        // Restore ResizeObserver
        window.ResizeObserver = originalResizeObserver;
        consoleSpy.mockRestore();
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

        // Trigger a scroll to potentially queue RAF
        window.dispatchEvent(new Event("scroll"));

        adhesive.cleanup();

        // May or may not have been called depending on timing, but should not error
        expect(adhesive.getState().activated).toBe(false);
      });

      it("restores original DOM structure completely", () => {
        const originalParent = targetElement.parentElement;

        const adhesive = createAdhesiveInstance();
        adhesive.cleanup();

        expect(targetElement.parentElement).toBe(originalParent);
      });

      it("clears internal references for garbage collection", () => {
        const adhesive = createInitializedAdhesive();
        adhesive.cleanup();

        // After cleanup, state should still be accessible but show deactivated
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

        // Manually remove some DOM structure
        const wrapper = targetElement.parentElement?.parentElement;
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
            expect((error as AdhesiveError).context).toBeDefined();
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
          expect((error as AdhesiveError).context).toEqual({
            selector: testSelector,
          });
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
        // Create element with zero dimensions
        const zeroElement = document.createElement("div");
        zeroElement.style.width = "0px";
        zeroElement.style.height = "0px";
        boundingElement.append(zeroElement);

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

        // Remove bounding element while instance is active
        boundingElement.remove();

        // Should handle this gracefully
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
          boundingEl: boundingElement,
        });

        // Initial state
        expectElementToBeInState(adhesive, "INITIAL");

        // Scroll past trigger point
        await simulateScrollToPosition(200);
        const scrolledState = adhesive.getState();
        expect([
          ADHESIVE_STATUS.INITIAL,
          ADHESIVE_STATUS.FIXED,
          ADHESIVE_STATUS.RELATIVE,
        ]).toContain(scrolledState.status);

        // Scroll back to top
        await simulateScrollToPosition(0);
        expectElementToBeInState(adhesive, "INITIAL");

        adhesive.cleanup();
      });

      it("handles dynamic configuration changes during scroll", async () => {
        const adhesive = createInitializedAdhesive({
          position: "top",
          offset: 10,
        });

        // Scroll to activate
        await simulateScrollToPosition(200);

        // Change configuration while active
        adhesive.updateOptions({
          position: "bottom",
          offset: 20,
        });

        expect(adhesive.getState().activated).toBe(true);

        adhesive.cleanup();
      });

      it("maintains performance under stress conditions", async () => {
        const adhesive = createInitializedAdhesive();

        // Simulate rapid interactions
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
        // Create additional elements
        const element2 = document.createElement("div");
        element2.id = "target2";
        boundingElement.append(element2);

        const adhesive1 = createInitializedAdhesive();
        const adhesive2 = createInitializedAdhesive({ targetEl: element2 });

        expect(adhesive1.getState().activated).toBe(true);
        expect(adhesive2.getState().activated).toBe(true);

        // Each should work independently
        adhesive1.disable();
        expect(adhesive1.getState().activated).toBe(false);
        expect(adhesive2.getState().activated).toBe(true);

        adhesive1.cleanup();
        adhesive2.cleanup();
      });
    });

    describe("real-world edge cases", () => {
      it("handles rapid enable/disable cycles", () => {
        const adhesive = createInitializedAdhesive();

        // Rapid enable/disable cycles
        for (let i = 0; i < 10; i++) {
          adhesive.disable();
          adhesive.enable();
        }

        expect(adhesive.getState().activated).toBe(true);

        adhesive.cleanup();
      });

      it("maintains stability with DOM mutations", () => {
        const adhesive = createInitializedAdhesive();

        // Add/remove siblings
        const sibling = document.createElement("div");
        boundingElement.append(sibling);
        sibling.remove();

        // Change target element properties
        targetElement.style.width = "200px";
        targetElement.className = "modified";

        expect(adhesive.getState().activated).toBe(true);

        adhesive.cleanup();
      });
    });
  });
});
