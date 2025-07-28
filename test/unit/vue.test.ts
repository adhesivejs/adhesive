import {
  AdhesiveContainer,
  useAdhesive,
  vAdhesive,
  type AdhesivePosition,
} from "@adhesivejs/vue";
import { fireEvent, render } from "@testing-library/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { computed, defineComponent, ref } from "vue";
import {
  commonBeforeEach,
  configurationTestCases,
  createMockAdhesive,
  CUSTOM_CLASS_NAMES,
  TEST_OFFSETS,
  TEST_Z_INDEXES,
} from "../utils/shared-test-helpers.js";

// Create the mock Adhesive instance
const mockAdhesiveInstance = createMockAdhesive();

// Mock the Adhesive class
vi.mock("@adhesivejs/core", () => {
  const MockAdhesive = {
    create: vi.fn(() => mockAdhesiveInstance),
  };

  return {
    Adhesive: MockAdhesive,
    default: MockAdhesive,
  };
});

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
  beforeEach(async () => {
    commonBeforeEach();
    // Clear the mock call count for each test
    const { Adhesive } = await import("@adhesivejs/core");
    (Adhesive.create as any).mockClear();
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

      it("should call updateOptions when options change", async () => {
        const { getByTestId } = renderTestComponent();
        const toggleEnabledButton = getByTestId("toggle-enabled");
        const togglePositionButton = getByTestId("toggle-position");
        const toggleOffsetButton = getByTestId("toggle-offset");

        // Reset the mock to clear initial calls
        mockAdhesiveInstance.updateOptions.mockClear();

        // Test enabled toggle
        await fireEvent.click(toggleEnabledButton);
        expect(mockAdhesiveInstance.updateOptions).toHaveBeenCalledWith(
          expect.objectContaining({
            enabled: false,
          }),
        );

        // Test position change
        await fireEvent.click(togglePositionButton);
        expect(mockAdhesiveInstance.updateOptions).toHaveBeenCalledWith(
          expect.objectContaining({
            position: "bottom",
          }),
        );

        // Test offset change
        await fireEvent.click(toggleOffsetButton);
        expect(mockAdhesiveInstance.updateOptions).toHaveBeenCalledWith(
          expect.objectContaining({
            offset: TEST_OFFSETS[2],
          }),
        );
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
          outerClass: CUSTOM_CLASS_NAMES.outerClassName,
          innerClass: CUSTOM_CLASS_NAMES.innerClassName,
          activeClass: CUSTOM_CLASS_NAMES.activeClassName,
          releasedClass: CUSTOM_CLASS_NAMES.releasedClassName,
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
            outerClassName: CUSTOM_CLASS_NAMES.outerClassName,
            innerClassName: CUSTOM_CLASS_NAMES.innerClassName,
            activeClassName: CUSTOM_CLASS_NAMES.activeClassName,
            releasedClassName: CUSTOM_CLASS_NAMES.releasedClassName,
          }),
        );
      });

      it("should handle z-index styling", () => {
        const { getByTestId } = renderContainer({ zIndex: TEST_Z_INDEXES[3] });

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

  describe("v-adhesive Directive", () => {
    // Test component using directive through app registration
    const createTestApp = (template: string, setup?: any) => {
      return defineComponent({
        setup,
        template,
      });
    };

    describe("basic functionality", () => {
      it("should render element with directive", () => {
        const TestComponent = createTestApp(
          `<div data-testid="directive-basic">Basic Directive Content</div>`,
        );

        const { getByTestId } = render(TestComponent, {
          global: {
            directives: {
              adhesive: vAdhesive as any,
            },
          },
        });

        expect(getByTestId("directive-basic")).toBeTruthy();
        expect(getByTestId("directive-basic")).toHaveTextContent(
          "Basic Directive Content",
        );
      });

      it("should create Adhesive instance when directive is applied", async () => {
        const TestComponent = createTestApp(
          `<div v-adhesive data-testid="directive-with-adhesive">Directive Content</div>`,
        );

        render(TestComponent, {
          global: {
            directives: {
              adhesive: vAdhesive as any,
            },
          },
        });

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledWith(
          expect.objectContaining({
            targetEl: expect.any(HTMLElement),
          }),
        );
      });

      it("should handle position argument", async () => {
        const TestComponent = createTestApp(
          `<div v-adhesive:bottom data-testid="directive-position">Bottom Position</div>`,
        );

        render(TestComponent, {
          global: {
            directives: {
              adhesive: vAdhesive as any,
            },
          },
        });

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledWith(
          expect.objectContaining({
            targetEl: expect.any(HTMLElement),
            position: "bottom",
          }),
        );
      });

      it("should handle options object", async () => {
        const TestComponent = createTestApp(
          `<div v-adhesive="options" data-testid="directive-options">Options Content</div>`,
          () => ({
            options: {
              offset: TEST_OFFSETS[2],
              zIndex: TEST_Z_INDEXES[3],
              enabled: true,
              activeClassName: CUSTOM_CLASS_NAMES.activeClassName,
              releasedClassName: CUSTOM_CLASS_NAMES.releasedClassName,
            },
          }),
        );

        render(TestComponent, {
          global: {
            directives: {
              adhesive: vAdhesive as any,
            },
          },
        });

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledWith(
          expect.objectContaining({
            targetEl: expect.any(HTMLElement),
            offset: TEST_OFFSETS[2],
            zIndex: TEST_Z_INDEXES[3],
            enabled: true,
            activeClassName: CUSTOM_CLASS_NAMES.activeClassName,
            releasedClassName: CUSTOM_CLASS_NAMES.releasedClassName,
          }),
        );
      });

      it("should handle position argument with options", async () => {
        const TestComponent = createTestApp(
          `<div v-adhesive:top="{ offset: ${TEST_OFFSETS[1]}, zIndex: 500 }" data-testid="directive-combined">Combined Content</div>`,
        );

        render(TestComponent, {
          global: {
            directives: {
              adhesive: vAdhesive as any,
            },
          },
        });

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledWith(
          expect.objectContaining({
            targetEl: expect.any(HTMLElement),
            position: "top",
            offset: TEST_OFFSETS[1],
            zIndex: 500,
          }),
        );
      });
    });

    describe("reactivity and updates", () => {
      it("should handle reactive options changes", async () => {
        const TestComponent = createTestApp(
          `
          <div>
            <button @click="toggleEnabled" data-testid="toggle-enabled">
              {{ enabled ? 'Disable' : 'Enable' }}
            </button>
            <button @click="changeOffset" data-testid="change-offset">
              Offset: {{ offset }}
            </button>
            <div v-adhesive="options" data-testid="directive-reactive">
              Reactive Content
            </div>
          </div>
          `,
          () => {
            const enabled = ref(true);
            const offset = ref(10);

            const options = computed(() => ({
              enabled: enabled.value,
              offset: offset.value,
            }));

            return {
              enabled,
              offset,
              options,
              toggleEnabled() {
                enabled.value = !enabled.value;
              },
              changeOffset() {
                offset.value = offset.value === 10 ? 30 : 10;
              },
            };
          },
        );

        const { getByTestId } = render(TestComponent, {
          global: {
            directives: {
              adhesive: vAdhesive as any,
            },
          },
        });

        expect(getByTestId("directive-reactive")).toBeTruthy();
        expect(getByTestId("toggle-enabled")).toHaveTextContent("Disable");
        expect(getByTestId("change-offset")).toHaveTextContent("Offset: 10");

        // Reset mock to track updates
        mockAdhesiveInstance.updateOptions.mockClear();

        // Test enabled toggle
        await fireEvent.click(getByTestId("toggle-enabled"));
        expect(getByTestId("toggle-enabled")).toHaveTextContent("Enable");
        expect(mockAdhesiveInstance.updateOptions).toHaveBeenCalledWith(
          expect.objectContaining({
            enabled: false,
          }),
        );

        // Test offset change
        await fireEvent.click(getByTestId("change-offset"));
        expect(getByTestId("change-offset")).toHaveTextContent("Offset: 30");
        expect(mockAdhesiveInstance.updateOptions).toHaveBeenCalledWith(
          expect.objectContaining({
            offset: 30,
          }),
        );
      });

      it("should call updateOptions when directive value changes", async () => {
        const TestComponent = createTestApp(
          `
          <div>
            <button @click="incrementOffset" data-testid="increment-offset">
              Increment
            </button>
            <div v-adhesive="{ offset: dynamicOffset }" data-testid="dynamic-element">
              Dynamic Content
            </div>
          </div>
          `,
          () => {
            const dynamicOffset = ref(15);

            return {
              dynamicOffset,
              incrementOffset() {
                dynamicOffset.value += 5;
              },
            };
          },
        );

        const { getByTestId } = render(TestComponent, {
          global: {
            directives: {
              adhesive: vAdhesive as any,
            },
          },
        });

        // Reset mock to track updates
        mockAdhesiveInstance.updateOptions.mockClear();

        await fireEvent.click(getByTestId("increment-offset"));

        expect(mockAdhesiveInstance.updateOptions).toHaveBeenCalledWith(
          expect.objectContaining({
            offset: 20,
          }),
        );
      });
    });

    describe("lifecycle management", () => {
      it("should cleanup Adhesive instance on unmount", () => {
        const TestComponent = createTestApp(
          `<div v-adhesive data-testid="directive-basic">Basic Content</div>`,
        );

        const { unmount, getByTestId } = render(TestComponent, {
          global: {
            directives: {
              adhesive: vAdhesive as any,
            },
          },
        });

        expect(getByTestId("directive-basic")).toBeTruthy();

        // Verify instance was created
        expect(mockAdhesiveInstance.cleanup).not.toHaveBeenCalled();

        // Unmount component
        unmount();

        // Verify cleanup was called
        expect(mockAdhesiveInstance.cleanup).toHaveBeenCalledTimes(1);
      });

      it("should not create multiple instances on re-renders", async () => {
        const TestComponent = createTestApp(
          `<div v-adhesive data-testid="directive-basic">Basic Content</div>`,
        );

        const { rerender, getByTestId } = render(TestComponent, {
          global: {
            directives: {
              adhesive: vAdhesive as any,
            },
          },
        });

        expect(getByTestId("directive-basic")).toBeTruthy();

        // Get initial call count
        const { Adhesive } = await import("@adhesivejs/core");
        const initialCallCount = (Adhesive.create as any).mock.calls.length;

        // Trigger re-render
        await rerender({});
        await rerender({});

        // Verify no additional instances were created
        expect((Adhesive.create as any).mock.calls.length).toBe(
          initialCallCount,
        );
      });

      it("should handle conditional rendering correctly", async () => {
        const TestComponent = createTestApp(
          `
          <div>
            <button @click="toggle" data-testid="toggle-visibility">
              {{ show ? 'Hide' : 'Show' }}
            </button>
            <div v-if="show" v-adhesive data-testid="conditional-element">
              Conditional Content
            </div>
          </div>
          `,
          () => {
            const show = ref(true);

            return {
              show,
              toggle() {
                show.value = !show.value;
              },
            };
          },
        );

        const { getByTestId, queryByTestId } = render(TestComponent, {
          global: {
            directives: {
              adhesive: vAdhesive as any,
            },
          },
        });

        expect(getByTestId("conditional-element")).toBeTruthy();
        expect(getByTestId("toggle-visibility")).toHaveTextContent("Hide");

        // Reset cleanup mock
        mockAdhesiveInstance.cleanup.mockClear();

        // Hide element
        await fireEvent.click(getByTestId("toggle-visibility"));
        expect(queryByTestId("conditional-element")).toBeNull();
        expect(getByTestId("toggle-visibility")).toHaveTextContent("Show");

        // Verify cleanup was called when element was removed
        expect(mockAdhesiveInstance.cleanup).toHaveBeenCalledTimes(1);

        // Show element again
        mockAdhesiveInstance.cleanup.mockClear();
        await fireEvent.click(getByTestId("toggle-visibility"));
        expect(getByTestId("conditional-element")).toBeTruthy();
        expect(getByTestId("toggle-visibility")).toHaveTextContent("Hide");
      });
    });

    describe("edge cases", () => {
      it("should handle directive with undefined options gracefully", async () => {
        const TestComponent = createTestApp(
          `<div v-adhesive="undefined" data-testid="undefined-options">Undefined Options</div>`,
        );

        const { getByTestId } = render(TestComponent, {
          global: {
            directives: {
              adhesive: vAdhesive as any,
            },
          },
        });

        expect(getByTestId("undefined-options")).toBeTruthy();

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledWith(
          expect.objectContaining({
            targetEl: expect.any(HTMLElement),
          }),
        );
      });

      it("should handle directive with empty options object", async () => {
        const TestComponent = createTestApp(
          `<div v-adhesive="{}" data-testid="empty-options">Empty Options</div>`,
        );

        const { getByTestId } = render(TestComponent, {
          global: {
            directives: {
              adhesive: vAdhesive as any,
            },
          },
        });

        expect(getByTestId("empty-options")).toBeTruthy();

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledWith(
          expect.objectContaining({
            targetEl: expect.any(HTMLElement),
          }),
        );
      });

      it("should handle position argument override", async () => {
        const TestComponent = createTestApp(
          `<div v-adhesive:top="{ position: 'bottom' }" data-testid="position-override">Position Override</div>`,
        );

        const { getByTestId } = render(TestComponent, {
          global: {
            directives: {
              adhesive: vAdhesive as any,
            },
          },
        });

        expect(getByTestId("position-override")).toBeTruthy();

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledWith(
          expect.objectContaining({
            targetEl: expect.any(HTMLElement),
            position: "top", // Argument should override options
          }),
        );
      });

      it("should handle multiple directives on same page", async () => {
        const TestComponent = createTestApp(
          `
          <div>
            <div v-adhesive:top data-testid="directive-1">First Directive</div>
            <div v-adhesive:bottom data-testid="directive-2">Second Directive</div>
            <div v-adhesive="{ offset: 15 }" data-testid="directive-3">Third Directive</div>
          </div>
          `,
        );

        const { getByTestId } = render(TestComponent, {
          global: {
            directives: {
              adhesive: vAdhesive as any,
            },
          },
        });

        expect(getByTestId("directive-1")).toBeTruthy();
        expect(getByTestId("directive-2")).toBeTruthy();
        expect(getByTestId("directive-3")).toBeTruthy();

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledTimes(3);
      });
    });
  });
});
