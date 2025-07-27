import {
  AdhesiveContainer,
  useAdhesive,
  type AdhesivePosition,
} from "@adhesivejs/react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

// Enhanced test component using useAdhesive hook
function TestHookComponent() {
  const targetRef = useRef<HTMLDivElement>(null);
  const boundingRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(true);
  const [position, setPosition] = useState<AdhesivePosition>("top");
  const [offset, setOffset] = useState(10);

  useAdhesive(
    { target: targetRef, bounding: boundingRef },
    { enabled, position, offset },
  );

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
        onClick={() => setOffset(offset === 10 ? 20 : 10)}
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

  // Helper functions
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
      it("should render without errors", () => {
        renderTestComponent();
        const { stickyElement, toggleEnabledButton } = getTestElements();

        expect(stickyElement).toBeInTheDocument();
        expect(toggleEnabledButton).toBeInTheDocument();
        expect(screen.getByText("Toggle (enabled)")).toBeInTheDocument();
      });

      it("should create Adhesive instance on mount", async () => {
        renderTestComponent();

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledTimes(1);
      });

      it("should not create multiple instances on re-renders", async () => {
        const { rerender } = renderTestComponent();

        rerender(<TestHookComponent />);
        rerender(<TestHookComponent />);

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledTimes(1);
      });
    });

    describe("state management", () => {
      it("should handle enabled toggle correctly", async () => {
        const user = userEvent.setup();
        renderTestComponent();
        const { toggleEnabledButton } = getTestElements();

        // Initial state
        expect(screen.getByText("Toggle (enabled)")).toBeInTheDocument();

        // Toggle to disabled
        await user.click(toggleEnabledButton);
        expect(screen.getByText("Toggle (disabled)")).toBeInTheDocument();

        // Toggle back to enabled
        await user.click(toggleEnabledButton);
        expect(screen.getByText("Toggle (enabled)")).toBeInTheDocument();
      });

      it("should handle position changes correctly", async () => {
        const user = userEvent.setup();
        renderTestComponent();
        const { togglePositionButton } = getTestElements();

        // Initial position
        expect(screen.getByText("Position: top")).toBeInTheDocument();

        // Change to bottom
        await user.click(togglePositionButton);
        expect(screen.getByText("Position: bottom")).toBeInTheDocument();

        // Change back to top
        await user.click(togglePositionButton);
        expect(screen.getByText("Position: top")).toBeInTheDocument();
      });

      it("should handle offset changes correctly", async () => {
        const user = userEvent.setup();
        renderTestComponent();
        const { toggleOffsetButton } = getTestElements();

        // Initial offset
        expect(screen.getByText("Offset: 10")).toBeInTheDocument();

        // Change offset
        await user.click(toggleOffsetButton);
        expect(screen.getByText("Offset: 20")).toBeInTheDocument();

        // Change back
        await user.click(toggleOffsetButton);
        expect(screen.getByText("Offset: 10")).toBeInTheDocument();
      });
    });

    describe("cleanup and lifecycle", () => {
      it("should cleanup on unmount without errors", () => {
        const { unmount } = renderTestComponent();
        const { stickyElement } = getTestElements();

        expect(stickyElement).toBeInTheDocument();

        expect(() => unmount()).not.toThrow();
      });

      it("should handle disabled state properly", () => {
        function DisabledComponent() {
          const targetRef = useRef<HTMLDivElement>(null);
          const boundingRef = useRef<HTMLDivElement>(null);

          useAdhesive(
            { target: targetRef, bounding: boundingRef },
            { enabled: false },
          );

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
      it("should render children correctly", () => {
        renderContainer();

        expect(screen.getByTestId("container-child")).toBeInTheDocument();
        expect(screen.getByText("Container Content")).toBeInTheDocument();
      });

      it("should handle empty children", () => {
        render(<AdhesiveContainer />);
        // Should not throw errors
      });
    });

    describe("styling and customization", () => {
      it("should apply custom class names", async () => {
        const customProps = {
          className: "custom-class",
          outerClassName: "custom-outer",
          innerClassName: "custom-inner",
          activeClassName: "custom-active",
          releasedClassName: "custom-released",
        };

        renderContainer(customProps);

        const child = screen.getByTestId("container-child");
        expect(child).toBeInTheDocument();

        // The className should be applied to the target div
        const targetDiv = child.parentElement;
        expect(targetDiv).toHaveClass("custom-class");

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
        renderContainer({ zIndex: 999 });

        expect(screen.getByTestId("container-child")).toBeInTheDocument();
      });
    });

    describe("configuration options", () => {
      configurationTestCases.forEach(({ name, props }) => {
        it(`should handle ${name} correctly`, () => {
          const { rerender } = renderContainer(props);

          expect(screen.getByTestId("container-child")).toBeInTheDocument();

          // Test that re-rendering with different props works
          rerender(
            <AdhesiveContainer {...props}>
              <div data-testid="container-child">Container Content</div>
            </AdhesiveContainer>,
          );

          expect(screen.getByTestId("container-child")).toBeInTheDocument();
        });
      });

      it("should handle bounding element with string selector", () => {
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
