/**
 * Core-specific test helpers for DOM manipulation testing
 * These utilities are specific to core Adhesive testing and complement shared-test-helpers.ts
 */

/**
 * Creates a mock DOM structure for core Adhesive testing
 */
export function createMockDOM() {
  document.body.innerHTML = `
    <div id="container" style="height: 2000px; position: relative;">
      <div id="target" style="width: 100px; height: 50px; background: red;">
        Target Element
      </div>
      <div id="viewport" style="height: 400px; overflow: auto;">
        <div style="height: 1000px;">Scrollable content</div>
      </div>
    </div>
  `;

  const container = document.querySelector("#container")! as HTMLElement;
  const target = document.querySelector("#target")! as HTMLElement;
  const viewport = document.querySelector("#viewport")! as HTMLElement;

  return {
    container,
    target,
    viewport,
    // Legacy aliases for compatibility
    targetElement: target,
    boundingElement: container,
    cleanup: () => {
      document.body.innerHTML = "";
    },
  };
}

/**
 * Enhanced getBoundingClientRect mock for dynamic testing
 * Allows per-element rect overrides for realistic core testing
 */
export function mockGetBoundingClientRect(
  overrides: Record<string, Partial<DOMRect>> = {},
) {
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;

  Element.prototype.getBoundingClientRect = function (this: Element) {
    const id = this.id;
    const override = overrides[id];

    if (override) {
      const rect: DOMRect = {
        width: 100,
        height: 50,
        top: 0,
        left: 0,
        bottom: 50,
        right: 100,
        x: 0,
        y: 0,
        toJSON: () => {},
        ...override,
      };
      return rect;
    }

    return originalGetBoundingClientRect.call(this);
  };

  return {
    restore: () => {
      Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    },
  };
}
