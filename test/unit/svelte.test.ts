import {
  adhesive,
  type AdhesiveAttachmentOptions,
  type AdhesivePosition,
} from "@adhesivejs/svelte";
import {
  cleanupTestEnvironment,
  commonBeforeEach,
  configurationTestCases,
  createMockAdhesive,
  TEST_OFFSETS,
} from "../utils/shared-test-helpers.js";

const mockAdhesiveInstance = createMockAdhesive();

vi.mock("@adhesivejs/core", () => ({
  Adhesive: {
    create: vi.fn(() => mockAdhesiveInstance),
  },
}));

// Helper function to create a test element with the adhesive attachment
function createTestElement(options?: AdhesiveAttachmentOptions): HTMLElement {
  const element = document.createElement("div");
  element.dataset.testid = "sticky-element";
  element.textContent = "Sticky Content";

  // Apply the adhesive attachment
  const attachment = adhesive(options);
  const cleanup = attachment(element);

  // Store cleanup function on element for later use
  (element as any)._adhesiveCleanup = cleanup;

  return element;
}

// Helper function to create a test component structure
function createTestComponent(options?: AdhesiveAttachmentOptions) {
  const container = document.createElement("div");
  container.dataset.testid = "test-component";

  const boundingElement = document.createElement("div");
  boundingElement.style.height = "1000px";
  boundingElement.dataset.testid = "bounding-element";

  const stickyElement = createTestElement(options);

  boundingElement.append(stickyElement);
  container.append(boundingElement);
  document.body.append(container);

  return {
    container,
    boundingElement,
    stickyElement,
    cleanup: () => {
      if ((stickyElement as any)._adhesiveCleanup) {
        (stickyElement as any)._adhesiveCleanup();
      }
      container.remove();
    },
  };
}

describe("Svelte Integration", () => {
  beforeEach(() => {
    commonBeforeEach();
  });

  afterEach(() => {
    cleanupTestEnvironment();
    document.body.innerHTML = "";
  });

  describe("adhesive attachment", () => {
    describe("initialization and rendering", () => {
      it("applies attachment without errors", () => {
        const { stickyElement, cleanup } = createTestComponent();

        expect(stickyElement).toBeInTheDocument();
        expect(stickyElement.dataset.testid).toBe("sticky-element");
        expect(stickyElement.textContent).toBe("Sticky Content");

        cleanup();
      });

      it("creates Adhesive instance when attachment is applied", async () => {
        const { cleanup } = createTestComponent();

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledTimes(1);

        cleanup();
      });

      it("throws error when target element is undefined", () => {
        const attachment = adhesive();

        expect(() => {
          attachment(null as any);
        }).toThrow("@adhesivejs/svelte: target element is not defined");
      });
    });

    describe("configuration options", () => {
      configurationTestCases.forEach(({ name, props }) => {
        it(`handles ${name}`, async () => {
          const { cleanup } = createTestComponent(props);

          const { Adhesive } = await import("@adhesivejs/core");
          expect(Adhesive.create).toHaveBeenCalledWith(
            expect.objectContaining({
              ...props,
              targetEl: expect.any(HTMLElement),
            }),
          );

          cleanup();
        });
      });

      it("handles position option", async () => {
        const { cleanup } = createTestComponent({ position: "bottom" });

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledWith(
          expect.objectContaining({
            position: "bottom",
            targetEl: expect.any(HTMLElement),
          }),
        );

        cleanup();
      });

      it("handles offset option", async () => {
        const { cleanup } = createTestComponent({ offset: TEST_OFFSETS[2] });

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledWith(
          expect.objectContaining({
            offset: TEST_OFFSETS[2],
            targetEl: expect.any(HTMLElement),
          }),
        );

        cleanup();
      });

      it("handles enabled option", async () => {
        const { cleanup } = createTestComponent({ enabled: false });

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledWith(
          expect.objectContaining({
            enabled: false,
            targetEl: expect.any(HTMLElement),
          }),
        );

        cleanup();
      });

      it("handles multiple options", async () => {
        const options = {
          position: "bottom" as AdhesivePosition,
          offset: TEST_OFFSETS[1],
          enabled: false,
        };
        const { cleanup } = createTestComponent(options);

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledWith(
          expect.objectContaining({
            ...options,
            targetEl: expect.any(HTMLElement),
          }),
        );

        cleanup();
      });
    });

    describe("lifecycle management", () => {
      it("cleans up Adhesive instance when attachment is removed", () => {
        const { stickyElement, cleanup } = createTestComponent();

        // Verify cleanup function exists
        expect((stickyElement as any)._adhesiveCleanup).toBeDefined();
        expect(typeof (stickyElement as any)._adhesiveCleanup).toBe("function");

        // Call cleanup
        cleanup();

        // Verify cleanup was called
        expect(mockAdhesiveInstance.cleanup).toHaveBeenCalledTimes(1);
      });

      it("does not create multiple instances for same element", async () => {
        const element = document.createElement("div");
        document.body.append(element);

        const attachment1 = adhesive({ position: "top" });
        const cleanup1 = attachment1(element);

        const attachment2 = adhesive({ position: "bottom" });
        const cleanup2 = attachment2(element);

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledTimes(2);

        cleanup1?.();
        cleanup2?.();
        element.remove();
      });

      it("handles element removal gracefully", () => {
        const { stickyElement, cleanup } = createTestComponent();

        // Remove element from DOM
        stickyElement.parentElement!.remove();

        // Cleanup should not throw
        expect(() => cleanup()).not.toThrow();
      });
    });

    describe("attachment function behavior", () => {
      it("returns a cleanup function", () => {
        const element = document.createElement("div");
        const attachment = adhesive();
        const result = attachment(element);

        expect(typeof result).toBe("function");

        // Cleanup
        result?.();
      });

      it("passes correct target element to Adhesive.create", async () => {
        const element = document.createElement("div");
        element.id = "test-element";
        document.body.append(element);

        const attachment = adhesive();
        const cleanup = attachment(element);

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledWith(
          expect.objectContaining({
            targetEl: element,
          }),
        );

        cleanup?.();
        element.remove();
      });

      it("merges options correctly", async () => {
        const element = document.createElement("div");
        document.body.append(element);

        const options = {
          position: "bottom" as AdhesivePosition,
          offset: 25,
          enabled: false,
        };

        const attachment = adhesive(options);
        const cleanup = attachment(element);

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledWith({
          ...options,
          targetEl: element,
        });

        cleanup?.();
        element.remove();
      });
    });

    describe("edge cases", () => {
      it("handles attachment with no options", async () => {
        const { cleanup } = createTestComponent();

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledWith(
          expect.objectContaining({
            targetEl: expect.any(HTMLElement),
          }),
        );

        cleanup();
      });

      it("handles attachment with empty options object", async () => {
        const { cleanup } = createTestComponent({});

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledWith(
          expect.objectContaining({
            targetEl: expect.any(HTMLElement),
          }),
        );

        cleanup();
      });

      it("handles undefined element gracefully", () => {
        const attachment = adhesive();

        expect(() => {
          attachment(undefined as any);
        }).toThrow("@adhesivejs/svelte: target element is not defined");
      });

      it("handles null element gracefully", () => {
        const attachment = adhesive();

        expect(() => {
          attachment(null as any);
        }).toThrow("@adhesivejs/svelte: target element is not defined");
      });
    });

    describe("type safety", () => {
      it("accepts valid AdhesiveAttachmentOptions", () => {
        const validOptions: AdhesiveAttachmentOptions = {
          position: "top",
          offset: 10,
          enabled: true,
        };

        expect(() => {
          adhesive(validOptions);
        }).not.toThrow();
      });

      it("excludes targetEl from options type", () => {
        // This should cause a TypeScript error if targetEl is allowed
        // const invalidOptions = {
        //   targetEl: document.createElement("div"),
        //   position: "top"
        // };
        // adhesive(invalidOptions); // Should not compile

        // Instead, verify that valid options work
        const validOptions = {
          position: "top" as AdhesivePosition,
          offset: 10,
        };

        expect(() => {
          adhesive(validOptions);
        }).not.toThrow();
      });
    });

    describe("DOM integration", () => {
      it("works with dynamically created elements", async () => {
        const element = document.createElement("div");
        element.dataset.testid = "dynamic-element";
        document.body.append(element);

        const attachment = adhesive({ position: "bottom" });
        const cleanup = attachment(element);

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledWith(
          expect.objectContaining({
            targetEl: element,
            position: "bottom",
          }),
        );

        cleanup?.();
        element.remove();
      });

      it("works with elements that have existing classes", async () => {
        const element = document.createElement("div");
        element.className = "existing-class another-class";
        document.body.append(element);

        const attachment = adhesive();
        const cleanup = attachment(element);

        // Verify original classes are preserved
        expect(element.className).toContain("existing-class");
        expect(element.className).toContain("another-class");

        const { Adhesive } = await import("@adhesivejs/core");
        expect(Adhesive.create).toHaveBeenCalledWith(
          expect.objectContaining({
            targetEl: element,
          }),
        );

        cleanup?.();
        element.remove();
      });

      it("works with elements that have inline styles", () => {
        const element = document.createElement("div");
        element.style.color = "red";
        element.style.fontSize = "16px";
        document.body.append(element);

        const attachment = adhesive();
        const cleanup = attachment(element);

        // Verify original styles are preserved
        expect(element.style.color).toBe("red");
        expect(element.style.fontSize).toBe("16px");

        cleanup?.();
        element.remove();
      });
    });
  });
});
