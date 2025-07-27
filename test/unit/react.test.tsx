import {
  AdhesiveContainer,
  useAdhesive,
  type AdhesivePosition,
} from "@adhesivejs/react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
    create: vi.fn(() => ({
      ...mockAdhesive,
      cleanup: vi.fn(),
      updateOptions: vi.fn(),
    })),
  },
}));

// Test component using useAdhesive hook
function TestHookComponent() {
  const targetRef = useRef<HTMLDivElement>(null);
  const boundingRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(true);
  const [position, setPosition] = useState<AdhesivePosition>("top");

  useAdhesive(
    { target: targetRef, bounding: boundingRef },
    { enabled, position, offset: 10 },
  );

  return (
    <div data-testid="test-component">
      <button onClick={() => setEnabled(!enabled)}>
        Toggle ({enabled ? "enabled" : "disabled"})
      </button>
      <button
        onClick={() => setPosition(position === "top" ? "bottom" : "top")}
      >
        Position: {position}
      </button>
      <div ref={boundingRef} style={{ height: "1000px" }}>
        <div ref={targetRef} data-testid="sticky-element">
          Sticky Content
        </div>
      </div>
    </div>
  );
}

describe("react", () => {
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
    cleanup();
  });

  describe("useAdhesive Hook", () => {
    it("should render without errors", () => {
      render(<TestHookComponent />);

      expect(screen.getByTestId("sticky-element")).toBeInTheDocument();
      expect(screen.getByText("Toggle (enabled)")).toBeInTheDocument();
    });

    it("should handle enabled toggle", async () => {
      const user = userEvent.setup();
      render(<TestHookComponent />);

      const toggleButton = screen.getByText("Toggle (enabled)");

      await user.click(toggleButton);
      expect(screen.getByText("Toggle (disabled)")).toBeInTheDocument();

      await user.click(toggleButton);
      expect(screen.getByText("Toggle (enabled)")).toBeInTheDocument();
    });

    it("should handle position changes", async () => {
      const user = userEvent.setup();
      render(<TestHookComponent />);

      const positionButton = screen.getByText("Position: top");

      await user.click(positionButton);
      expect(screen.getByText("Position: bottom")).toBeInTheDocument();

      await user.click(positionButton);
      expect(screen.getByText("Position: top")).toBeInTheDocument();
    });

    it("should create wrapper elements", async () => {
      render(<TestHookComponent />);

      const stickyElement = screen.getByTestId("sticky-element");
      expect(stickyElement).toBeInTheDocument();

      // Verify that Adhesive.create was called, which means the hook is working
      const { Adhesive } = await import("@adhesivejs/core");
      expect(Adhesive.create).toHaveBeenCalled();
    });
  });

  describe("AdhesiveContainer Component", () => {
    it("should render children", () => {
      render(
        <AdhesiveContainer>
          <div data-testid="container-child">Container Content</div>
        </AdhesiveContainer>,
      );

      expect(screen.getByTestId("container-child")).toBeInTheDocument();
      expect(screen.getByText("Container Content")).toBeInTheDocument();
    });

    it("should apply custom class names", async () => {
      render(
        <AdhesiveContainer
          className="custom-class"
          outerClassName="custom-outer"
          innerClassName="custom-inner"
          activeClassName="custom-active"
          releasedClassName="custom-released"
        >
          <div data-testid="container-child">Content</div>
        </AdhesiveContainer>,
      );

      const child = screen.getByTestId("container-child");
      expect(child).toBeInTheDocument();

      // The className should be applied to the target div (parent of the child)
      const targetDiv = child.parentElement;
      expect(targetDiv).toHaveClass("custom-class");

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

    it("should handle position prop", () => {
      const { rerender } = render(
        <AdhesiveContainer position="top">
          <div data-testid="container-child">Content</div>
        </AdhesiveContainer>,
      );

      expect(screen.getByTestId("container-child")).toBeInTheDocument();

      rerender(
        <AdhesiveContainer position="bottom">
          <div data-testid="container-child">Content</div>
        </AdhesiveContainer>,
      );

      expect(screen.getByTestId("container-child")).toBeInTheDocument();
    });

    it("should handle enabled prop", () => {
      const { rerender } = render(
        <AdhesiveContainer enabled={true}>
          <div data-testid="container-child">Content</div>
        </AdhesiveContainer>,
      );

      expect(screen.getByTestId("container-child")).toBeInTheDocument();

      rerender(
        <AdhesiveContainer enabled={false}>
          <div data-testid="container-child">Content</div>
        </AdhesiveContainer>,
      );

      expect(screen.getByTestId("container-child")).toBeInTheDocument();
    });

    it("should handle offset prop", () => {
      render(
        <AdhesiveContainer offset={20}>
          <div data-testid="container-child">Content</div>
        </AdhesiveContainer>,
      );

      expect(screen.getByTestId("container-child")).toBeInTheDocument();
    });

    it("should handle zIndex prop", () => {
      render(
        <AdhesiveContainer zIndex={999}>
          <div data-testid="container-child">Content</div>
        </AdhesiveContainer>,
      );

      expect(screen.getByTestId("container-child")).toBeInTheDocument();
    });

    it("should handle boundingEl prop with string", () => {
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

  describe("Hook Cleanup", () => {
    it("should cleanup on unmount", () => {
      const { unmount } = render(<TestHookComponent />);

      // Verify component is rendered
      expect(screen.getByTestId("sticky-element")).toBeInTheDocument();

      // Unmount should not throw errors
      unmount();
    });
  });

  describe("Error Handling", () => {
    it("should handle disabled state", () => {
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
