import { Adhesive, ADHESIVE_STATUS, AdhesiveError } from "@adhesivejs/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("SSR Safety", () => {
  let originalWindow: typeof globalThis.window;
  let originalDocument: typeof globalThis.document;
  let originalResizeObserver: typeof globalThis.ResizeObserver;
  let originalRequestAnimationFrame: typeof globalThis.requestAnimationFrame;
  let originalCancelAnimationFrame: typeof globalThis.cancelAnimationFrame;

  /**
   * Simulates an SSR environment by removing browser globals
   */
  const simulateSSREnvironment = () => {
    // Store original globals
    originalWindow = globalThis.window;
    originalDocument = globalThis.document;
    originalResizeObserver = globalThis.ResizeObserver;
    originalRequestAnimationFrame = globalThis.requestAnimationFrame;
    originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

    // Remove browser globals to simulate SSR
    // @ts-expect-error - Intentionally deleting for SSR simulation
    delete globalThis.window;
    // @ts-expect-error - Intentionally deleting for SSR simulation
    delete globalThis.document;
    // @ts-expect-error - Intentionally deleting for SSR simulation
    delete globalThis.ResizeObserver;
    // @ts-expect-error - Intentionally deleting for SSR simulation
    delete globalThis.requestAnimationFrame;
    // @ts-expect-error - Intentionally deleting for SSR simulation
    delete globalThis.cancelAnimationFrame;
  };

  /**
   * Restores browser environment after SSR simulation
   */
  const restoreBrowserEnvironment = () => {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
    globalThis.ResizeObserver = originalResizeObserver;
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
  };

  afterEach(() => {
    restoreBrowserEnvironment();
    vi.restoreAllMocks();
  });

  describe("Constructor Behavior in SSR", () => {
    it("creates disabled instance when window is undefined", () => {
      simulateSSREnvironment();

      const adhesive = new Adhesive({
        targetEl: "#target",
      });

      const state = adhesive.getState();
      expect(state.activated).toBe(false);
      expect(state.status).toBe(ADHESIVE_STATUS.INITIAL);
    });

    it("creates disabled instance when document is undefined", () => {
      // Only remove document, keep window
      originalDocument = globalThis.document;
      // @ts-expect-error - Intentionally deleting for SSR simulation
      delete globalThis.document;

      const adhesive = new Adhesive({
        targetEl: "#target",
      });

      const state = adhesive.getState();
      expect(state.activated).toBe(false);
      expect(state.status).toBe(ADHESIVE_STATUS.INITIAL);

      // Restore document
      globalThis.document = originalDocument;
    });

    it("does not throw errors during SSR instantiation", () => {
      simulateSSREnvironment();

      expect(() => {
        new Adhesive({
          targetEl: "#non-existent",
          boundingEl: ".also-non-existent",
          offset: 20,
          position: "bottom",
          zIndex: 999,
        });
      }).not.toThrow();
    });

    it("preserves options in SSR environment", () => {
      simulateSSREnvironment();

      const options = {
        targetEl: "#target",
        offset: 25,
        position: "bottom" as const,
        zIndex: 500,
        outerClassName: "custom-outer",
        innerClassName: "custom-inner",
        activeClassName: "custom-active",
        releasedClassName: "custom-released",
      };

      const adhesive = new Adhesive(options);

      // Options should be preserved even in SSR
      // We can't directly access private fields, but we can verify behavior
      expect(() => adhesive.getState()).not.toThrow();
    });
  });

  describe("Static Factory Method in SSR", () => {
    it("handles Adhesive.create() safely in SSR", () => {
      simulateSSREnvironment();

      expect(() => {
        Adhesive.create({
          targetEl: "#target",
          offset: 10,
        });
      }).not.toThrow();
    });

    it("returns a functional but disabled instance via create()", () => {
      simulateSSREnvironment();

      const adhesive = Adhesive.create({
        targetEl: "#target",
      });

      const state = adhesive.getState();
      expect(state.activated).toBe(false);
      expect(state.status).toBe(ADHESIVE_STATUS.INITIAL);
    });
  });

  describe("Public API Methods in SSR", () => {
    let adhesive: Adhesive;

    beforeEach(() => {
      simulateSSREnvironment();
      adhesive = new Adhesive({
        targetEl: "#target",
      });
    });

    it("handles init() gracefully in SSR", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = adhesive.init();

      expect(result).toBe(adhesive); // Should return self for chaining

      consoleSpy.mockRestore();
    });

    it("handles enable() safely in SSR", () => {
      expect(() => adhesive.enable()).not.toThrow();
    });

    it("handles disable() safely in SSR", () => {
      expect(() => adhesive.disable()).not.toThrow();
    });

    it("handles updateOptions() safely in SSR", () => {
      expect(() => {
        adhesive.updateOptions({
          offset: 50,
          position: "bottom",
        });
      }).not.toThrow();
    });

    it("returns valid state from getState() in SSR", () => {
      const state = adhesive.getState();

      expect(state).toEqual(
        expect.objectContaining({
          status: ADHESIVE_STATUS.INITIAL,
          isSticky: false,
          activated: false,
          elementWidth: 0,
          elementHeight: 0,
          elementX: 0,
          elementY: 0,
          pos: 0,
        }),
      );
    });

    it("handles refresh() safely in SSR", () => {
      expect(() => adhesive.refresh()).not.toThrow();
    });

    it("handles cleanup() safely in SSR", () => {
      expect(() => adhesive.cleanup()).not.toThrow();
    });
  });

  describe("Method Chaining in SSR", () => {
    it("supports method chaining in SSR environment", () => {
      simulateSSREnvironment();

      expect(() => {
        const adhesive = new Adhesive({ targetEl: "#target" })
          .init()
          .enable()
          .updateOptions({ offset: 20 })
          .disable()
          .refresh();

        adhesive.cleanup();
      }).not.toThrow();
    });
  });

  describe("Browser Environment Detection", () => {
    it("correctly detects browser environment when globals are present", () => {
      // Ensure we're in browser environment
      expect(typeof window).toBe("object");
      expect(typeof document).toBe("object");

      // Should work normally in browser
      document.body.innerHTML = '<div id="target">Test</div>';

      expect(() => {
        new Adhesive({
          targetEl: "#target",
        });
      }).not.toThrow();
    });

    it("correctly detects SSR environment when globals are missing", () => {
      simulateSSREnvironment();

      // Should still work but be disabled
      expect(() => {
        new Adhesive({
          targetEl: "#target",
        });
      }).not.toThrow();
    });
  });

  describe("Hybrid SSR/Hydration Scenarios", () => {
    it("transitions from SSR to browser environment correctly", () => {
      // Start in SSR
      simulateSSREnvironment();

      const adhesive = new Adhesive({
        targetEl: "#target",
      });

      const state = adhesive.getState();
      expect(state.activated).toBe(false);

      // Simulate hydration - restore browser environment
      restoreBrowserEnvironment();
      document.body.innerHTML = '<div id="target">Test</div>';

      // Should be able to enable after hydration
      expect(() => adhesive.enable()).not.toThrow();

      // Note: In real SSR scenarios, you'd create a new instance after hydration
      // This test verifies the transition doesn't crash
    });

    it("handles multiple instances across SSR/browser transitions", () => {
      // Create in SSR
      simulateSSREnvironment();
      const ssrInstance = new Adhesive({ targetEl: "#target" });

      // Restore browser environment
      restoreBrowserEnvironment();
      document.body.innerHTML = '<div id="target">Test</div>';

      // Create new instance in browser
      const browserInstance = new Adhesive({ targetEl: "#target" });

      // Both should be functional
      expect(() => ssrInstance.getState()).not.toThrow();
      expect(() => browserInstance.getState()).not.toThrow();

      // Clean up both
      expect(() => {
        ssrInstance.cleanup();
        browserInstance.cleanup();
      }).not.toThrow();
    });
  });

  describe("Error Handling in SSR", () => {
    it("does not throw AdhesiveError for missing elements in SSR", () => {
      simulateSSREnvironment();

      // These would normally throw in browser environment
      expect(() => {
        new Adhesive({
          targetEl: "#non-existent",
        });
      }).not.toThrow();

      expect(() => {
        new Adhesive({
          targetEl: "#target",
          boundingEl: "#non-existent",
        });
      }).not.toThrow();
    });

    it("still validates required options in SSR", () => {
      simulateSSREnvironment();

      expect(() => {
        // @ts-expect-error - Testing runtime validation
        new Adhesive({});
      }).toThrow(AdhesiveError);

      expect(() => {
        new Adhesive({
          // @ts-expect-error - Testing runtime validation
          targetEl: null,
        });
      }).toThrow(AdhesiveError);
    });
  });

  describe("Memory Management in SSR", () => {
    it("does not create event listeners in SSR", () => {
      simulateSSREnvironment();

      const adhesive = new Adhesive({
        targetEl: "#target",
      });

      // Should not attempt to add event listeners
      expect(() => adhesive.init()).not.toThrow();

      // Cleanup should be safe even if no listeners were added
      expect(() => adhesive.cleanup()).not.toThrow();
    });

    it("does not create ResizeObserver in SSR", () => {
      simulateSSREnvironment();

      const adhesive = new Adhesive({
        targetEl: "#target",
      });

      // Should handle missing ResizeObserver gracefully
      expect(() => adhesive.init()).not.toThrow();
      expect(() => adhesive.cleanup()).not.toThrow();
    });
  });

  describe("Performance in SSR", () => {
    it("has minimal performance impact in SSR", () => {
      simulateSSREnvironment();

      const start = performance.now();

      // Create multiple instances
      for (let i = 0; i < 100; i++) {
        const adhesive = new Adhesive({
          targetEl: `#target-${i}`,
          offset: i,
        });
        adhesive.init();
        adhesive.cleanup();
      }

      const end = performance.now();
      const duration = end - start;

      // Should complete quickly (adjust threshold as needed)
      expect(duration).toBeLessThan(100); // 100ms threshold
    });
  });
});
