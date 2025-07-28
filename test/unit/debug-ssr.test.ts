import { Adhesive } from "@adhesivejs/core";
import { afterEach, describe, expect, it } from "vitest";

/**
 * Debug test to understand SSR simulation issues
 */
describe("SSR Debug", () => {
  let originalWindow: typeof globalThis.window;
  let originalDocument: typeof globalThis.document;

  const simulateSSREnvironment = () => {
    originalWindow = globalThis.window;
    originalDocument = globalThis.document;

    // @ts-expect-error - Intentionally deleting for SSR simulation
    delete globalThis.window;
    // @ts-expect-error - Intentionally deleting for SSR simulation
    delete globalThis.document;
  };

  const restoreBrowserEnvironment = () => {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
  };

  afterEach(() => {
    restoreBrowserEnvironment();
  });

  it("should detect environment correctly", () => {
    // Test browser environment first
    expect(typeof window).toBe("object");
    expect(typeof document).toBe("object");

    // Now simulate SSR
    simulateSSREnvironment();
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");

    // Test the isBrowser function by copying its logic
    const isBrowser = () => {
      return typeof window !== "undefined" && typeof document !== "undefined";
    };

    expect(isBrowser()).toBe(false);
  });

  it("should handle document access in SSR", () => {
    simulateSSREnvironment();

    expect(() => {
      // This should throw because document doesn't exist
      document.querySelector("div");
    }).toThrow();

    expect(() => {
      // This should be safe
      if (typeof document !== "undefined") {
        document.querySelector("div");
      }
    }).not.toThrow();
  });

  it("should handle Adhesive constructor in SSR", () => {
    simulateSSREnvironment();

    try {
      new Adhesive({
        targetEl: "#target",
      });
    } catch (error) {
      console.error("Error details:", error);
      throw error;
    }
  });
});
