import { Adhesive, ADHESIVE_STATUS, AdhesiveError } from "@adhesivejs/core";

describe("SSR Safety", () => {
  let originalWindow: typeof globalThis.window;
  let originalDocument: typeof globalThis.document;
  let originalResizeObserver: typeof globalThis.ResizeObserver;
  let originalRequestAnimationFrame: typeof globalThis.requestAnimationFrame;
  let originalCancelAnimationFrame: typeof globalThis.cancelAnimationFrame;

  const simulateSSREnvironment = () => {
    originalWindow = globalThis.window;
    originalDocument = globalThis.document;
    originalResizeObserver = globalThis.ResizeObserver;
    originalRequestAnimationFrame = globalThis.requestAnimationFrame;
    originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

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
      originalDocument = globalThis.document;
      // @ts-expect-error - Intentionally deleting for SSR simulation
      delete globalThis.document;

      const adhesive = new Adhesive({
        targetEl: "#target",
      });

      const state = adhesive.getState();
      expect(state.activated).toBe(false);
      expect(state.status).toBe(ADHESIVE_STATUS.INITIAL);

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
        fixedClassName: "custom-fixed",
        relativeClassName: "custom-relative",
      };

      const adhesive = new Adhesive(options);

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

      expect(result).toBe(adhesive);

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

    it("handles replaceOptions() safely in SSR", () => {
      expect(() => {
        adhesive.replaceOptions({
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
          activated: false,
          position: 0,
          elementWidth: 0,
          elementHeight: 0,
          elementX: 0,
          elementY: 0,
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
          .replaceOptions({ offset: 20 })
          .disable()
          .refresh();

        adhesive.cleanup();
      }).not.toThrow();
    });
  });

  describe("Browser Environment Detection", () => {
    it("correctly detects browser environment when globals are present", () => {
      expect(typeof window).toBe("object");
      expect(typeof document).toBe("object");

      document.body.innerHTML = '<div id="target">Test</div>';

      expect(() => {
        new Adhesive({ targetEl: "#target" });
      }).not.toThrow();
    });

    it("correctly detects SSR environment when globals are missing", () => {
      simulateSSREnvironment();

      expect(() => {
        new Adhesive({ targetEl: "#target" });
      }).not.toThrow();
    });
  });

  describe("Hybrid SSR/Hydration Scenarios", () => {
    it("transitions from SSR to browser environment correctly", () => {
      simulateSSREnvironment();

      const adhesive = new Adhesive({ targetEl: "#target" });

      const state = adhesive.getState();
      expect(state.activated).toBe(false);

      restoreBrowserEnvironment();
      document.body.innerHTML = '<div><div id="target">Test</div></div>';

      expect(() => adhesive.enable()).not.toThrow();
    });

    it("handles multiple instances across SSR/browser transitions", () => {
      simulateSSREnvironment();
      const ssrInstance = new Adhesive({ targetEl: "#target" });

      restoreBrowserEnvironment();
      document.body.innerHTML = '<div id="target">Test</div>';

      const browserInstance = new Adhesive({ targetEl: "#target" });

      expect(() => ssrInstance.getState()).not.toThrow();
      expect(() => browserInstance.getState()).not.toThrow();

      expect(() => {
        ssrInstance.cleanup();
        browserInstance.cleanup();
      }).not.toThrow();
    });
  });

  describe("Error Handling in SSR", () => {
    it("does not throw AdhesiveError for missing elements in SSR", () => {
      simulateSSREnvironment();

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

      expect(() => adhesive.init()).not.toThrow();

      expect(() => adhesive.cleanup()).not.toThrow();
    });

    it("does not create ResizeObserver in SSR", () => {
      simulateSSREnvironment();

      const adhesive = new Adhesive({
        targetEl: "#target",
      });

      expect(() => adhesive.init()).not.toThrow();
      expect(() => adhesive.cleanup()).not.toThrow();
    });
  });

  describe("Performance in SSR", () => {
    it("has minimal performance impact in SSR", () => {
      simulateSSREnvironment();

      const start = performance.now();

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

      expect(duration).toBeLessThan(100);
    });
  });
});
