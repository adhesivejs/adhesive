import {
  AdhesiveContainer,
  useAdhesive,
  type AdhesivePosition,
} from "@adhesivejs/react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import {
  commonBeforeEach,
  configurationTestCases,
  createMockAdhesive,
  CUSTOM_CLASS_NAMES,
  TEST_OFFSETS,
  TEST_Z_INDEXES,
} from "../utils/shared-test-helpers.js";

const mockAdhesiveInstance = createMockAdhesive();

vi.mock("@adhesivejs/core", () => ({
  Adhesive: {
    create: vi.fn(() => mockAdhesiveInstance),
  },
}));

function TestHookComponent() {
  const targetRef = useRef<HTMLDivElement>(null);
  const boundingRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(true);
  const [position, setPosition] = useState<AdhesivePosition>("top");
  const [offset, setOffset] = useState<number>(TEST_OFFSETS[1]);

  useAdhesive(targetRef, {
    boundingRef,
    enabled,
    position,
    offset,
  });

  return (
    <div data-testid="test-component">
      <button onClick={() => setEnabled(!enabled)} data-testid="toggle-enabled">
        Toggle ({enabled ? "enabled" : "disabled"})
      </button>
      <button
        onClick={() => setPosition(position === "top" ? "bottom" : "top")}
        data-testid="toggle-position"
      >
        Position: {position}
      </button>
      <button
        onClick={() =>
          setOffset(
            offset === TEST_OFFSETS[1] ? TEST_OFFSETS[2] : TEST_OFFSETS[1],
          )
        }
        data-testid="toggle-offset"
      >
        Offset: {offset}
      </button>
      <div ref={boundingRef} style={{ height: "1000px" }}>
        <div ref={targetRef} data-testid="sticky-element">
          Sticky Content
        </div>
      </div>
    </div>
  );
}

describe("React Integration", () => {
  beforeEach(() => {
    commonBeforeEach();
  });

  afterEach(() => {
    cleanup();
  });

  const renderTestComponent = () => render(<TestHookComponent />);

  const getTestElements = () => ({
    component: screen.getByTestId("test-component"),
    toggleEnabledButton: screen.getByTestId("toggle-enabled"),
    togglePositionButton: screen.getByTestId("toggle-position"),
    toggleOffsetButton: screen.getByTestId("toggle-offset"),
    stickyElement: screen.getByTestId("sticky-element"),
  });

  const renderContainer = (props = {}) => {
    return render(
      <AdhesiveContainer {...props}>
        <div data-testid="container-child">Container Content</div>
      </AdhesiveContainer>,
    );
  };

  describe("useAdhesive Hook", () => {
    describe("initialization and rendering", () => {
      it("renders without errors", () => {
        renderTestComponent();
        const { stickyElement, toggleEnabledButton } = getTestElements();

        expect(stickyElement).toBeInTheDocument();
        expect(toggleEnabledButton).toBeInTheDocument();
        expect(screen.getByText("Toggle (enabled)")).toBeInTheDocument();
      });

      it("creates Adhesive instance on mount", async () => {
        renderTestComponent();

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledTimes(1);
      });

      it("does not create multiple instances on re-renders", async () => {
        const { rerender } = renderTestComponent();

        rerender(<TestHookComponent />);
        rerender(<TestHookComponent />);

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledTimes(1);
      });
    });

    describe("state management", () => {
      it("handles enabled toggle correctly", async () => {
        const user = userEvent.setup();
        renderTestComponent();
        const { toggleEnabledButton } = getTestElements();

        expect(screen.getByText("Toggle (enabled)")).toBeInTheDocument();

        await user.click(toggleEnabledButton);
        expect(screen.getByText("Toggle (disabled)")).toBeInTheDocument();

        await user.click(toggleEnabledButton);
        expect(screen.getByText("Toggle (enabled)")).toBeInTheDocument();
      });

      it("handles position changes correctly", async () => {
        const user = userEvent.setup();
        renderTestComponent();
        const { togglePositionButton } = getTestElements();

        expect(screen.getByText("Position: top")).toBeInTheDocument();

        await user.click(togglePositionButton);
        expect(screen.getByText("Position: bottom")).toBeInTheDocument();

        await user.click(togglePositionButton);
        expect(screen.getByText("Position: top")).toBeInTheDocument();
      });

      it("handles offset changes correctly", async () => {
        const user = userEvent.setup();
        renderTestComponent();
        const { toggleOffsetButton } = getTestElements();

        expect(
          screen.getByText(`Offset: ${TEST_OFFSETS[1]}`),
        ).toBeInTheDocument();

        await user.click(toggleOffsetButton);
        expect(
          screen.getByText(`Offset: ${TEST_OFFSETS[2]}`),
        ).toBeInTheDocument();

        await user.click(toggleOffsetButton);
        expect(
          screen.getByText(`Offset: ${TEST_OFFSETS[1]}`),
        ).toBeInTheDocument();
      });

      it("calls updateOptions when options change", async () => {
        const user = userEvent.setup();
        renderTestComponent();
        const {
          toggleEnabledButton,
          togglePositionButton,
          toggleOffsetButton,
        } = getTestElements();

        mockAdhesiveInstance.updateOptions.mockClear();

        await user.click(toggleEnabledButton);
        expect(mockAdhesiveInstance.updateOptions).toHaveBeenCalledWith(
          expect.objectContaining({
            enabled: false,
          }),
        );

        await user.click(togglePositionButton);
        expect(mockAdhesiveInstance.updateOptions).toHaveBeenCalledWith(
          expect.objectContaining({
            position: "bottom",
          }),
        );

        await user.click(toggleOffsetButton);
        expect(mockAdhesiveInstance.updateOptions).toHaveBeenCalledWith(
          expect.objectContaining({
            offset: TEST_OFFSETS[2],
          }),
        );
      });
    });

    describe("cleanup and lifecycle", () => {
      it("cleans up on unmount without errors", () => {
        const { unmount } = renderTestComponent();
        const { stickyElement } = getTestElements();

        expect(stickyElement).toBeInTheDocument();

        expect(() => unmount()).not.toThrow();
      });

      it("handles disabled state properly", () => {
        function DisabledComponent() {
          const targetRef = useRef<HTMLDivElement>(null);
          const boundingRef = useRef<HTMLDivElement>(null);

          useAdhesive(targetRef, { boundingRef, enabled: false });

          return (
            <div ref={boundingRef}>
              <div ref={targetRef} data-testid="disabled-sticky">
                Disabled Sticky
              </div>
            </div>
          );
        }

        render(<DisabledComponent />);
        expect(screen.getByTestId("disabled-sticky")).toBeInTheDocument();
      });
    });
  });

  describe("AdhesiveContainer Component", () => {
    describe("basic rendering", () => {
      it("renders children correctly", () => {
        renderContainer();

        expect(screen.getByTestId("container-child")).toBeInTheDocument();
        expect(screen.getByText("Container Content")).toBeInTheDocument();
      });

      it("handles empty children", () => {
        render(<AdhesiveContainer />);
      });
    });

    describe("styling and customization", () => {
      it("applies custom class names", async () => {
        const customProps = {
          className: "custom-class",
          outerClassName: CUSTOM_CLASS_NAMES.outerClassName,
          innerClassName: CUSTOM_CLASS_NAMES.innerClassName,
          fixedClassName: CUSTOM_CLASS_NAMES.fixedClassName,
          relativeClassName: CUSTOM_CLASS_NAMES.relativeClassName,
        };

        renderContainer(customProps);

        const child = screen.getByTestId("container-child");
        expect(child).toBeInTheDocument();

        const targetDiv = child.parentElement;
        expect(targetDiv).toHaveClass("custom-class");

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledWith(
          expect.objectContaining({
            outerClassName: CUSTOM_CLASS_NAMES.outerClassName,
            innerClassName: CUSTOM_CLASS_NAMES.innerClassName,
            fixedClassName: CUSTOM_CLASS_NAMES.fixedClassName,
            relativeClassName: CUSTOM_CLASS_NAMES.relativeClassName,
          }),
        );
      });

      it("handles z-index styling", () => {
        renderContainer({ zIndex: TEST_Z_INDEXES[3] });

        expect(screen.getByTestId("container-child")).toBeInTheDocument();
      });
    });

    describe("configuration options", () => {
      configurationTestCases.forEach(({ name, props }) => {
        it(`handles ${name} correctly`, () => {
          const { rerender } = renderContainer(props);

          expect(screen.getByTestId("container-child")).toBeInTheDocument();

          rerender(
            <AdhesiveContainer {...props}>
              <div data-testid="container-child">Container Content</div>
            </AdhesiveContainer>,
          );

          expect(screen.getByTestId("container-child")).toBeInTheDocument();
        });
      });

      it("handles bounding element with string selector", () => {
        render(
          <div className="bounding-container">
            <AdhesiveContainer boundingEl=".bounding-container">
              <div data-testid="container-child">Content</div>
            </AdhesiveContainer>
          </div>,
        );

        expect(screen.getByTestId("container-child")).toBeInTheDocument();
      });
    });
  });
});
