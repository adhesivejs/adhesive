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
  cleanupTestEnvironment,
  commonBeforeEach,
  configurationTestCases,
  createMockAdhesive,
  CUSTOM_CLASS_NAMES,
  TEST_OFFSETS,
  TEST_Z_INDEXES,
} from "../utils/shared-test-helpers.js";

const mockAdhesiveInstance = createMockAdhesive();

vi.mock("@adhesivejs/core", () => {
  const MockAdhesive = {
    create: vi.fn(() => mockAdhesiveInstance),
  };

  return {
    Adhesive: MockAdhesive,
    default: MockAdhesive,
  };
});

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
    cleanupTestEnvironment();
  });

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
      it("renders without errors", () => {
        const { getByTestId } = renderTestComponent();

        expect(getByTestId("sticky-element")).toBeTruthy();
        expect(getByTestId("toggle-enabled")).toHaveTextContent("enabled");
      });

      it("creates Adhesive instance on mount", async () => {
        renderTestComponent();

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledTimes(1);
      });

      it("does not create multiple instances on re-renders", async () => {
        const { rerender } = renderTestComponent();

        rerender({});
        rerender({});

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledTimes(1);
      });
    });

    describe("state management", () => {
      it("handles enabled toggle correctly", async () => {
        const { getByTestId } = renderTestComponent();
        const toggleButton = getByTestId("toggle-enabled");

        expect(toggleButton).toHaveTextContent("enabled");

        await fireEvent.click(toggleButton);
        expect(toggleButton).toHaveTextContent("disabled");

        await fireEvent.click(toggleButton);
        expect(toggleButton).toHaveTextContent("enabled");
      });

      it("handles position changes correctly", async () => {
        const { getByTestId } = renderTestComponent();
        const positionButton = getByTestId("toggle-position");

        expect(positionButton).toHaveTextContent("top");

        await fireEvent.click(positionButton);
        expect(positionButton).toHaveTextContent("bottom");

        await fireEvent.click(positionButton);
        expect(positionButton).toHaveTextContent("top");
      });

      it("handles offset changes correctly", async () => {
        const { getByTestId } = renderTestComponent();
        const offsetButton = getByTestId("toggle-offset");

        expect(offsetButton).toHaveTextContent("10");

        await fireEvent.click(offsetButton);
        expect(offsetButton).toHaveTextContent("20");

        await fireEvent.click(offsetButton);
        expect(offsetButton).toHaveTextContent("10");
      });

      it("calls updateOptions when options change", async () => {
        const { getByTestId } = renderTestComponent();
        const toggleEnabledButton = getByTestId("toggle-enabled");
        const togglePositionButton = getByTestId("toggle-position");
        const toggleOffsetButton = getByTestId("toggle-offset");

        mockAdhesiveInstance.updateOptions.mockClear();

        await fireEvent.click(toggleEnabledButton);
        expect(mockAdhesiveInstance.updateOptions).toHaveBeenCalledWith(
          expect.objectContaining({
            enabled: false,
          }),
        );

        await fireEvent.click(togglePositionButton);
        expect(mockAdhesiveInstance.updateOptions).toHaveBeenCalledWith(
          expect.objectContaining({
            position: "bottom",
          }),
        );

        await fireEvent.click(toggleOffsetButton);
        expect(mockAdhesiveInstance.updateOptions).toHaveBeenCalledWith(
          expect.objectContaining({
            offset: TEST_OFFSETS[2],
          }),
        );
      });
    });

    describe("cleanup and lifecycle", () => {
      it("cleans up on unmount without errors", () => {
        const { unmount, getByTestId } = renderTestComponent();

        expect(getByTestId("sticky-element")).toBeTruthy();

        expect(() => unmount()).not.toThrow();
      });

      it("handles disabled state properly", () => {
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
      it("renders children correctly", () => {
        const { getByTestId } = renderContainer();

        expect(getByTestId("container-child")).toBeTruthy();
        expect(getByTestId("container-child")).toHaveTextContent(
          "Container Content",
        );
      });

      it("handles empty children", () => {
        const { container } = render(AdhesiveContainer);
        expect(container).toBeTruthy();
      });
    });

    describe("styling and customization", () => {
      it("applies custom class names", async () => {
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

      it("handles z-index styling", () => {
        const { getByTestId } = renderContainer({ zIndex: TEST_Z_INDEXES[3] });

        expect(getByTestId("container-child")).toBeTruthy();
      });
    });

    describe("configuration options", () => {
      configurationTestCases.forEach(({ name, props }) => {
        it(`handles ${name} correctly`, async () => {
          const { getByTestId, rerender } = renderContainer(props);

          expect(getByTestId("container-child")).toBeTruthy();

          await rerender(props);

          expect(getByTestId("container-child")).toBeTruthy();
        });
      });

      it("handles bounding element with string selector", () => {
        document.body.innerHTML = '<div class="bounding-container"></div>';

        const { getByTestId } = renderContainer({
          boundingEl: ".bounding-container",
        });

        expect(getByTestId("container-child")).toBeTruthy();
      });
    });
  });

  describe("v-adhesive Directive", () => {
    const createTestApp = (template: string, setup?: any) => {
      return defineComponent({
        setup,
        template,
      });
    };

    describe("basic functionality", () => {
      it("renders element with directive", () => {
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

      it("creates Adhesive instance when directive is applied", async () => {
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

      it("handles position argument", async () => {
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

      it("handles options object", async () => {
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

      it("handles position argument with options", async () => {
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
      it("handles reactive options changes", async () => {
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

        mockAdhesiveInstance.updateOptions.mockClear();

        await fireEvent.click(getByTestId("toggle-enabled"));
        expect(getByTestId("toggle-enabled")).toHaveTextContent("Enable");
        expect(mockAdhesiveInstance.updateOptions).toHaveBeenCalledWith(
          expect.objectContaining({
            enabled: false,
          }),
        );

        await fireEvent.click(getByTestId("change-offset"));
        expect(getByTestId("change-offset")).toHaveTextContent("Offset: 30");
        expect(mockAdhesiveInstance.updateOptions).toHaveBeenCalledWith(
          expect.objectContaining({
            offset: 30,
          }),
        );
      });

      it("calls updateOptions when directive value changes", async () => {
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
      it("cleans up Adhesive instance on unmount", () => {
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

        expect(mockAdhesiveInstance.cleanup).not.toHaveBeenCalled();

        unmount();

        expect(mockAdhesiveInstance.cleanup).toHaveBeenCalledTimes(1);
      });

      it("does not create multiple instances on re-renders", async () => {
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

        const { Adhesive } = await import("@adhesivejs/core");
        const initialCallCount = (Adhesive.create as any).mock.calls.length;

        await rerender({});
        await rerender({});

        expect((Adhesive.create as any).mock.calls.length).toBe(
          initialCallCount,
        );
      });

      it("handles conditional rendering correctly", async () => {
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

        mockAdhesiveInstance.cleanup.mockClear();

        await fireEvent.click(getByTestId("toggle-visibility"));
        expect(queryByTestId("conditional-element")).toBeNull();
        expect(getByTestId("toggle-visibility")).toHaveTextContent("Show");

        expect(mockAdhesiveInstance.cleanup).toHaveBeenCalledTimes(1);

        mockAdhesiveInstance.cleanup.mockClear();
        await fireEvent.click(getByTestId("toggle-visibility"));
        expect(getByTestId("conditional-element")).toBeTruthy();
        expect(getByTestId("toggle-visibility")).toHaveTextContent("Hide");
      });
    });

    describe("edge cases", () => {
      it("handles directive with undefined options gracefully", async () => {
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

      it("handles directive with empty options object", async () => {
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

      it("handles position argument override", async () => {
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
            position: "top",
          }),
        );
      });

      it("handles multiple directives on same page", async () => {
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
