/**
 * Core-specific test helpers for DOM manipulation testing
 * These utilities are specific to core Adhesive testing and complement shared-test-helpers.ts
 */

/**
 * Creates a mock DOM structure for core Adhesive testing
 */
export function createMockDOM() {
  document.body.innerHTML = `
    <div id="bounding" style="height: 2000px; position: relative;">
      <div id="target" style="width: 100px; height: 50px; background: red;">
        Target Element
      </div>
    </div>
  `;

  const target = document.querySelector("#target")! as HTMLElement;
  const bounding = document.querySelector("#bounding")! as HTMLElement;

  return {
    target,
    bounding,
    cleanup: () => {
      document.body.innerHTML = "";
    },
  };
}
