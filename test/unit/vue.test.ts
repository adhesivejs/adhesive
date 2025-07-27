import {
  AdhesiveContainer,
  useAdhesive,
  type AdhesivePosition,
} from "@adhesivejs/vue";
import { fireEvent, render } from "@testing-library/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import {
  commonBeforeEach,
  configurationTestCases,
  createMockAdhesive,
} from "../utils/shared-test-helpers.js";

// Create the mock Adhesive instance
const mockAdhesiveInstance = createMockAdhesive();

// Mock the Adhesive class
vi.mock("@adhesivejs/core", () => ({
  Adhesive: {
    create: vi.fn(() => mockAdhesiveInstance),
  },
}));

// Enhanced test component using useAdhesive composable
const TestComposableComponent = defineComponent({
  setup() {
    const targetRef = ref<HTMLElement>();
    const boundingRef = ref<HTMLElement>();
    const enabled = ref(true);
    const position = ref<AdhesivePosition>("top");
    const offset = ref(10);

    useAdhesive(targetRef, () => ({
      boundingRef: boundingRef.value,
      enabled: enabled.value,
      position: position.value,
      offset: offset.value,
    }));

    return {
      targetRef,
      boundingRef,
      enabled,
      position,
      offset,
      toggleEnabled() {
        enabled.value = !enabled.value;
      },
      togglePosition() {
        position.value = position.value === "top" ? "bottom" : "top";
      },
      toggleOffset() {
        offset.value = offset.value === 10 ? 20 : 10;
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
      <button @click="toggleOffset" data-testid="toggle-offset">
        Offset: {{ offset }}
      </button>
      <div ref="boundingRef" style="height: 1000px;">
        <div ref="targetRef" data-testid="sticky-element">
          Sticky Content
        </div>
      </div>
    </div>
  `,
});

describe("Vue Integration", () => {
  beforeEach(() => {
    commonBeforeEach();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  // Helper functions
  const renderTestComponent = () => render(TestComposableComponent);

  const renderContainer = (props = {}, slots = {}) => {
    return render(AdhesiveContainer, {
      props,
      slots: {
        default: '<div data-testid="container-child">Container Content</div>',
        ...slots,
      },
    });
  };

  describe("useAdhesive Composable", () => {
    describe("initialization and rendering", () => {
      it("should render without errors", () => {
        const { getByTestId } = renderTestComponent();

        expect(getByTestId("sticky-element")).toBeTruthy();
        expect(getByTestId("toggle-enabled")).toHaveTextContent("enabled");
      });

      it("should create Adhesive instance on mount", async () => {
        renderTestComponent();

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledTimes(1);
      });

      it("should not create multiple instances on re-renders", async () => {
        const { rerender } = renderTestComponent();

        rerender({});
        rerender({});

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledTimes(1);
      });
    });

    describe("state management", () => {
      it("should handle enabled toggle correctly", async () => {
        const { getByTestId } = renderTestComponent();
        const toggleButton = getByTestId("toggle-enabled");

        // Initial state
        expect(toggleButton).toHaveTextContent("enabled");

        // Toggle to disabled
        await fireEvent.click(toggleButton);
        expect(toggleButton).toHaveTextContent("disabled");

        // Toggle back to enabled
        await fireEvent.click(toggleButton);
        expect(toggleButton).toHaveTextContent("enabled");
      });

      it("should handle position changes correctly", async () => {
        const { getByTestId } = renderTestComponent();
        const positionButton = getByTestId("toggle-position");

        // Initial position
        expect(positionButton).toHaveTextContent("top");

        // Change to bottom
        await fireEvent.click(positionButton);
        expect(positionButton).toHaveTextContent("bottom");

        // Change back to top
        await fireEvent.click(positionButton);
        expect(positionButton).toHaveTextContent("top");
      });

      it("should handle offset changes correctly", async () => {
        const { getByTestId } = renderTestComponent();
        const offsetButton = getByTestId("toggle-offset");

        // Initial offset
        expect(offsetButton).toHaveTextContent("10");

        // Change offset
        await fireEvent.click(offsetButton);
        expect(offsetButton).toHaveTextContent("20");

        // Change back
        await fireEvent.click(offsetButton);
        expect(offsetButton).toHaveTextContent("10");
      });
    });

    describe("cleanup and lifecycle", () => {
      it("should cleanup on unmount without errors", () => {
        const { unmount, getByTestId } = renderTestComponent();

        expect(getByTestId("sticky-element")).toBeTruthy();

        expect(() => unmount()).not.toThrow();
      });

      it("should handle disabled state properly", () => {
        const DisabledComponent = defineComponent({
          setup() {
            const targetRef = ref<HTMLElement>();
            const boundingRef = ref<HTMLElement>();

            useAdhesive(targetRef, () => ({
              boundingRef: boundingRef.value,
              enabled: false,
            }));

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

  describe("AdhesiveContainer Component", () => {
    describe("basic rendering", () => {
      it("should render children correctly", () => {
        const { getByTestId } = renderContainer();

        expect(getByTestId("container-child")).toBeTruthy();
        expect(getByTestId("container-child")).toHaveTextContent(
          "Container Content",
        );
      });

      it("should handle empty children", () => {
        const { container } = render(AdhesiveContainer);
        expect(container).toBeTruthy();
      });
    });

    describe("styling and customization", () => {
      it("should apply custom class names", async () => {
        const customProps = {
          class: "custom-class",
          outerClass: "custom-outer",
          innerClass: "custom-inner",
          activeClass: "custom-active",
          releasedClass: "custom-released",
        };

        const { getByTestId } = renderContainer(customProps);

        expect(getByTestId("container-child")).toBeTruthy();
        expect(getByTestId("container-child")).toHaveTextContent(
          "Container Content",
        );

        // Verify Adhesive.create was called with correct options
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

      it("should handle z-index styling", () => {
        const { getByTestId } = renderContainer({ zIndex: 999 });

        expect(getByTestId("container-child")).toBeTruthy();
      });
    });

    describe("configuration options", () => {
      configurationTestCases.forEach(({ name, props }) => {
        it(`should handle ${name} correctly`, async () => {
          const { getByTestId, rerender } = renderContainer(props);

          expect(getByTestId("container-child")).toBeTruthy();

          // Test that re-rendering with different props works
          await rerender(props);

          expect(getByTestId("container-child")).toBeTruthy();
        });
      });

      it("should handle bounding element with string selector", () => {
        document.body.innerHTML = '<div class="bounding-container"></div>';

        const { getByTestId } = renderContainer({
          boundingEl: ".bounding-container",
        });

        expect(getByTestId("container-child")).toBeTruthy();
      });
    });
  });
});
