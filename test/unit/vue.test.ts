import {
  AdhesiveContainer,
  useAdhesive,
  type AdhesivePosition,
} from "@adhesivejs/vue";
import { fireEvent, render } from "@testing-library/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";

// Mock the Adhesive imports since we're testing in isolation
const mockAdhesive = {
  init: vi.fn(() => mockAdhesive),
  cleanup: vi.fn(),
  updateOptions: vi.fn(),
  getState: vi.fn(() => ({ status: "initial", isSticky: false })),
};

// Mock the Adhesive class
vi.mock("@adhesivejs/core", () => ({
  Adhesive: {
    create: vi.fn((options) => {
      // Create wrapper elements like the real Adhesive does
      const targetEl =
        typeof options.targetEl === "string"
          ? document.querySelector(options.targetEl)
          : options.targetEl;

      if (targetEl && targetEl.parentNode) {
        const outerWrapper = document.createElement("div");
        outerWrapper.className = options.outerClassName || "adhesive__outer";

        const innerWrapper = document.createElement("div");
        innerWrapper.className = options.innerClassName || "adhesive__inner";

        targetEl.before(outerWrapper);
        outerWrapper.append(innerWrapper);
        innerWrapper.append(targetEl);
      }

      return {
        ...mockAdhesive,
        cleanup: vi.fn(),
        updateOptions: vi.fn((newOptions) => {
          // Handle option updates by recreating wrappers if needed
          const newTargetEl =
            typeof newOptions.targetEl === "string"
              ? document.querySelector(newOptions.targetEl)
              : newOptions.targetEl;

          if (newTargetEl && newTargetEl.parentNode) {
            // Check if wrappers already exist
            const existingOuter = newTargetEl.closest(".adhesive__outer");
            if (!existingOuter) {
              const outerWrapper = document.createElement("div");
              outerWrapper.className =
                newOptions.outerClassName || "adhesive__outer";

              const innerWrapper = document.createElement("div");
              innerWrapper.className =
                newOptions.innerClassName || "adhesive__inner";

              newTargetEl.before(outerWrapper);
              outerWrapper.append(innerWrapper);
              innerWrapper.append(newTargetEl);
            }
          }
        }),
      };
    }),
  },
}));

// Test component using useAdhesive composable
const TestComposableComponent = defineComponent({
  setup() {
    const targetRef = ref<HTMLElement>();
    const boundingRef = ref<HTMLElement>();
    const enabled = ref(true);
    const position = ref<AdhesivePosition>("top");

    useAdhesive({ target: targetRef, bounding: boundingRef }, () => ({
      enabled: enabled.value,
      position: position.value,
      offset: 10,
    }));

    return {
      targetRef,
      boundingRef,
      enabled,
      position,
      toggleEnabled() {
        enabled.value = !enabled.value;
      },
      togglePosition() {
        position.value = position.value === "top" ? "bottom" : "top";
      },
    };
  },
  template: `
    <div data-testid="test-component">
      <button @click="toggleEnabled" data-testid="toggle-enabled">
        Toggle ({{ enabled ? 'enabled' : 'disabled' }})
      </button>
      <button @click="togglePosition" data-testid="toggle-position">
        Position: {{ position }}
      </button>
      <div ref="boundingRef" style="height: 1000px;">
        <div ref="targetRef" data-testid="sticky-element">
          Sticky Content
        </div>
      </div>
    </div>
  `,
});

describe("vue", () => {
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = "";

    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      top: 100,
      bottom: 150,
      left: 0,
      right: 100,
      width: 100,
      height: 50,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    }));
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("useAdhesive Composable", () => {
    it("should render without errors", () => {
      const { getByTestId } = render(TestComposableComponent);

      expect(getByTestId("sticky-element")).toBeTruthy();
      expect(getByTestId("toggle-enabled")).toHaveTextContent("enabled");
    });

    it("should handle enabled toggle", async () => {
      const { getByTestId } = render(TestComposableComponent);

      const toggleButton = getByTestId("toggle-enabled");

      await fireEvent.click(toggleButton);
      expect(toggleButton).toHaveTextContent("disabled");

      await fireEvent.click(toggleButton);
      expect(toggleButton).toHaveTextContent("enabled");
    });

    it("should handle position changes", async () => {
      const { getByTestId } = render(TestComposableComponent);

      const positionButton = getByTestId("toggle-position");

      expect(positionButton).toHaveTextContent("top");

      await fireEvent.click(positionButton);
      expect(positionButton).toHaveTextContent("bottom");

      await fireEvent.click(positionButton);
      expect(positionButton).toHaveTextContent("top");
    });
  });

  describe("AdhesiveContainer Component", () => {
    it("should render children", () => {
      const { getByTestId } = render(AdhesiveContainer, {
        slots: {
          default: '<div data-testid="container-child">Container Content</div>',
        },
      });

      expect(getByTestId("container-child")).toBeTruthy();
      expect(getByTestId("container-child")).toHaveTextContent(
        "Container Content",
      );
    });

    it("should apply custom class names", async () => {
      const { getByTestId } = render(AdhesiveContainer, {
        props: {
          class: "custom-class",
          outerClass: "custom-outer",
          innerClass: "custom-inner",
          activeClass: "custom-active",
          releasedClass: "custom-released",
        },
        slots: {
          default: '<div data-testid="container-child">Content</div>',
        },
      });

      // Verify the component renders and the content is present
      expect(getByTestId("container-child")).toBeTruthy();
      expect(getByTestId("container-child")).toHaveTextContent("Content");

      // Verify that Adhesive.create was called with the correct options
      const { Adhesive } = await import("@adhesivejs/core");
      expect(Adhesive.create).toHaveBeenCalledWith(
        expect.objectContaining({
          outerClassName: "custom-outer",
          innerClassName: "custom-inner",
          activeClassName: "custom-active",
          releasedClassName: "custom-released",
        }),
      );
    });

    it("should handle position prop", async () => {
      const { getByTestId, rerender } = render(AdhesiveContainer, {
        props: { position: "top" },
        slots: {
          default: '<div data-testid="container-child">Content</div>',
        },
      });

      expect(getByTestId("container-child")).toBeTruthy();

      await rerender({ position: "bottom" });
      expect(getByTestId("container-child")).toBeTruthy();
    });

    it("should handle enabled prop", async () => {
      const { getByTestId, rerender } = render(AdhesiveContainer, {
        props: { enabled: true },
        slots: {
          default: '<div data-testid="container-child">Content</div>',
        },
      });

      expect(getByTestId("container-child")).toBeTruthy();

      await rerender({ enabled: false });
      expect(getByTestId("container-child")).toBeTruthy();
    });

    it("should handle offset prop", () => {
      const { getByTestId } = render(AdhesiveContainer, {
        props: { offset: 20 },
        slots: {
          default: '<div data-testid="container-child">Content</div>',
        },
      });

      expect(getByTestId("container-child")).toBeTruthy();
    });

    it("should handle zIndex prop", () => {
      const { getByTestId } = render(AdhesiveContainer, {
        props: { zIndex: 999 },
        slots: {
          default: '<div data-testid="container-child">Content</div>',
        },
      });

      expect(getByTestId("container-child")).toBeTruthy();
    });

    it("should handle boundingEl prop with string", () => {
      document.body.innerHTML = '<div class="bounding-container"></div>';

      const { getByTestId } = render(AdhesiveContainer, {
        props: { boundingEl: ".bounding-container" },
        slots: {
          default: '<div data-testid="container-child">Content</div>',
        },
      });

      expect(getByTestId("container-child")).toBeTruthy();
    });
  });

  describe("Composable Cleanup", () => {
    it("should cleanup on unmount", () => {
      const { getByTestId, unmount } = render(TestComposableComponent);

      // Verify component is rendered
      expect(getByTestId("sticky-element")).toBeTruthy();

      // Unmount should not throw errors
      unmount();
    });
  });

  describe("Error Handling", () => {
    it("should handle disabled state", () => {
      const DisabledComponent = defineComponent({
        setup() {
          const targetRef = ref<HTMLElement>();
          const boundingRef = ref<HTMLElement>();

          useAdhesive(
            { target: targetRef, bounding: boundingRef },
            { enabled: false },
          );

          return { targetRef, boundingRef };
        },
        template: `
          <div ref="boundingRef">
            <div ref="targetRef" data-testid="disabled-sticky">
              Disabled Sticky
            </div>
          </div>
        `,
      });

      const { getByTestId } = render(DisabledComponent);
      expect(getByTestId("disabled-sticky")).toBeTruthy();
    });
  });
});
