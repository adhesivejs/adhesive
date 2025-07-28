type ElementSelector = HTMLElement | string;

/**
 * Defines the position where the element should stick when activated.
 *
 * @example
 * ```ts
 * // Stick to the top of the viewport/container
 * position: "top"
 *
 * // Stick to the bottom of the viewport/container
 * position: "bottom"
 * ```
 */
export type AdhesivePosition = "top" | "bottom";

/**
 * Configuration options for the Adhesive sticky positioning behavior.
 *
 * Provides comprehensive control over how elements stick within their boundaries,
 * including positioning, offsets, styling, and boundary constraints.
 */
export interface AdhesiveOptions {
  /**
   * The element to make sticky. Can be an HTMLElement instance or a CSS selector string.
   * @example
   * ```ts
   * targetEl: '#target-element' // CSS selector
   * targetEl: document.querySelector('#target-element') // HTMLElement
   * ```
   */
  readonly targetEl: ElementSelector;

  /**
   * The element that defines the boundaries for the sticky behavior.
   * Defaults to document.body if not provided.
   *
   * @default `document.body`
   * @example
   * ```ts
   * boundingEl: '.container' // CSS selector
   * boundingEl: document.querySelector('.container') // HTMLElement
   * boundingEl: null // Use document.body
   * ```
   */
  readonly boundingEl?: ElementSelector | null;

  /**
   * Whether the sticky behavior is enabled.
   * @default true
   */
  readonly enabled?: boolean;

  /**
   * The offset from the top or bottom of the bounding element in pixels.
   * @default 0
   */
  readonly offset?: number;

  /**
   * The position where the element should stick.
   *
   * @default "top"
   */
  readonly position?: AdhesivePosition;

  /**
   * The z-index value for the sticky element when fixed.
   * @default 1
   */
  readonly zIndex?: number;

  /**
   * Additional CSS class to add to the outer element.
   * @default "adhesive__outer"
   */
  readonly outerClassName?: string;

  /**
   * Additional CSS class to add to the inner element.
   * @default "adhesive__inner"
   */
  readonly innerClassName?: string;

  /**
   * CSS class to add when the element is in active (fixed) state.
   * @default "adhesive--active"
   */
  readonly activeClassName?: string;

  /**
   * CSS class to add when the element is in released (relative) state.
   * @default "adhesive--released"
   */
  readonly releasedClassName?: string;
}

interface InternalAdhesiveOptions {
  targetEl: HTMLElement;
  boundingEl: HTMLElement;
  enabled: boolean;
  offset: number;
  position: AdhesivePosition;
  zIndex: number;
  outerClassName: string;
  innerClassName: string;
  activeClassName: string;
  releasedClassName: string;
}

const DEFAULTS = {
  OFFSET: 0,
  POSITION: "top" as const satisfies AdhesivePosition,
  Z_INDEX: 1,
  ENABLED: true,
  OUTER_CLASS: "adhesive__outer",
  INNER_CLASS: "adhesive__inner",
  ACTIVE_CLASS: "adhesive--active",
  RELEASED_CLASS: "adhesive--released",
} as const;

/**
 * Constants representing the different states an Adhesive element can be in.
 *
 * These states track the current positioning behavior of the sticky element
 * as it responds to scroll events and boundary constraints.
 *
 * @example
 * ```ts
 * import { ADHESIVE_STATUS } from '@adhesivejs/core';
 *
 * const state = adhesive.getState();
 * if (state.status === ADHESIVE_STATUS.FIXED) {
 *   console.log('Element is currently stuck to viewport');
 * }
 * ```
 */
export const ADHESIVE_STATUS = {
  /** Element is in its original position, not affected by sticky positioning */
  INITIAL: "initial",
  /** Element is positioned relative within its boundaries, following scroll */
  RELATIVE: "relative",
  /** Element is stuck to the bounding element (top or bottom) */
  FIXED: "fixed",
} as const;

/**
 * Union type representing all possible Adhesive status values.
 *
 * @see {@link ADHESIVE_STATUS} for available status constants
 */
export type AdhesiveStatus =
  (typeof ADHESIVE_STATUS)[keyof typeof ADHESIVE_STATUS];

/**
 * Read-only state information for an Adhesive instance.
 *
 * Provides comprehensive information about the current positioning state,
 * dimensions, boundaries, and behavior of the sticky element.
 *
 * @example
 * ```ts
 * const state = adhesive.getState();
 * console.log(`Status: ${state.status}`);
 * console.log(`Is currently sticky: ${state.isSticky}`);
 * console.log(`Element dimensions: ${state.width}x${state.height}`);
 * console.log(`Current position: (${state.x}, ${state.y})`);
 * ```
 */
export interface AdhesiveState {
  /** Current positioning status of the element */
  readonly status: AdhesiveStatus;
  /** Whether the element is currently in a sticky state (fixed or relative positioning) */
  readonly isSticky: boolean;
  /** Original CSS position value before Adhesive was applied */
  readonly originalPosition: string;
  /** Original CSS top value before Adhesive was applied */
  readonly originalTop: string;
  /** Original CSS z-index value before Adhesive was applied */
  readonly originalZIndex: string;
  /** Original CSS transform value before Adhesive was applied */
  readonly originalTransform: string;
  /** Current width of the element in pixels */
  readonly width: number;
  /** Current height of the element in pixels */
  readonly height: number;
  /** Current horizontal position (left offset) in pixels */
  readonly x: number;
  /** Current vertical position (top offset) in pixels */
  readonly y: number;
  /** Top boundary position where sticky behavior begins */
  readonly topBoundary: number;
  /** Bottom boundary position where sticky behavior ends */
  readonly bottomBoundary: number;
  /** Current positioning offset applied to the element */
  readonly pos: number;
  /** Whether the Adhesive instance has been activated (initialized) */
  readonly activated: boolean;
}

interface InternalAdhesiveState {
  status: AdhesiveStatus;
  isSticky: boolean;
  originalPosition: string;
  originalTop: string;
  originalZIndex: string;
  originalTransform: string;
  width: number;
  height: number;
  x: number;
  y: number;
  topBoundary: number;
  bottomBoundary: number;
  pos: number;
  activated: boolean;
}

/**
 * Custom error class for Adhesive-related errors.
 *
 * Provides structured error information with error codes and context
 * to help developers diagnose and fix configuration or runtime issues.
 *
 * @example
 * ```ts
 * try {
 *   new Adhesive({ targetEl: '#non-existent' });
 * } catch (error) {
 *   if (error instanceof AdhesiveError) {
 *     console.log(`Error code: ${error.code}`);
 *     console.log(`Context:`, error.context);
 *   }
 * }
 * ```
 */
export class AdhesiveError extends Error {
  /** Specific error code for programmatic error handling */
  public readonly code: string;
  /** Additional context information about the error */
  public readonly context: Record<string, unknown>;

  /**
   * Creates a new AdhesiveError instance.
   *
   * @param message - Human-readable error message
   * @param code - Specific error code for programmatic handling
   * @param context - Additional context information about the error
   */
  constructor(message: string, code: string, context: Record<string, unknown>) {
    super(`@adhesivejs/core: ${message}`);
    this.name = "AdhesiveError";
    this.code = code;
    this.context = context;

    // Maintain proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AdhesiveError);
    }
  }
}

const ERROR_CODES = {
  TARGET_EL_REQUIRED: "targetEl is required",
  TARGET_EL_NOT_FOUND: "targetEl not found in DOM",
  TARGET_EL_NO_PARENT: "targetEl must have a parent node for wrapper creation",
  BOUNDING_EL_NOT_FOUND: "boundingEl not found in DOM",
  RESIZE_OBSERVER_NOT_SUPPORTED:
    "ResizeObserver not supported in this environment",
} as const;

function createAdhesiveError(
  code: keyof typeof ERROR_CODES,
  context: Record<string, unknown>,
): AdhesiveError {
  return new AdhesiveError(ERROR_CODES[code], code, context);
}

function isBrowser(): boolean {
  const windowExists = typeof window !== "undefined";
  const documentExists = typeof document !== "undefined";
  return windowExists && documentExists;
}

function resolveElement(element: HTMLElement | string): HTMLElement | null {
  if (!isBrowser()) return null;
  if (typeof element === "string") {
    const resolved = document.querySelector(element);
    return resolved instanceof HTMLElement ? resolved : null;
  }
  return element;
}

function getScrollTop(): number {
  if (!isBrowser()) return 0;
  return window.scrollY ?? document.documentElement?.scrollTop ?? 0;
}

function getViewportHeight(): number {
  if (!isBrowser()) return 0;
  return window.innerHeight ?? document.documentElement?.clientHeight ?? 0;
}

function validateElement(
  element: HTMLElement | null,
  errorKey: keyof typeof ERROR_CODES,
  context: Record<string, unknown>,
): asserts element is HTMLElement {
  if (!element) {
    throw createAdhesiveError(errorKey, context);
  }
}

function createInitialState(
  innerWrapper?: HTMLElement | null,
): InternalAdhesiveState {
  return {
    status: ADHESIVE_STATUS.INITIAL,
    isSticky: false,
    originalPosition: innerWrapper?.style.position ?? "",
    originalTop: innerWrapper?.style.top ?? "",
    originalZIndex: innerWrapper?.style.zIndex ?? "",
    originalTransform: innerWrapper?.style.transform ?? "",
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    topBoundary: 0,
    bottomBoundary: Number.POSITIVE_INFINITY,
    pos: 0,
    activated: false,
  };
}

/**
 * Adhesive - A modern, performant, lightweight, dependency-free sticky positioning solution
 *
 * Provides smooth, performant sticky positioning for DOM elements with configurable boundaries,
 * offsets, and positioning modes. Built with modern TypeScript features and optimized for
 * performance through passive event listeners, ResizeObserver, and efficient DOM operations.
 *
 * ## Key Features
 * - 🚀 **High Performance**: Optimized with passive listeners and minimal DOM operations
 * - 📱 **Cross-platform**: Works seamlessly across all modern browsers and devices
 * - 🎯 **Flexible Positioning**: Supports both top and bottom sticky positioning modes
 * - 🔒 **Boundary Aware**: Intelligent boundary detection and tall element handling
 * - 📦 **Zero Dependencies**: No external dependencies, minimal bundle footprint
 * - 🛡️ **Type Safe**: Full TypeScript support with comprehensive type definitions
 * - 🖥️ **SSR Ready**: Safe for server-side rendering environments
 *
 * ## Performance Characteristics
 * - Uses `ResizeObserver` for efficient resize detection
 * - Leverages `transform3d` for hardware-accelerated animations
 * - Implements passive event listeners for optimal scroll performance
 * - Minimal DOM queries and intelligent state caching
 *
 * @example
 * ```ts
 * // Basic usage with automatic initialization
 * Adhesive.create({ targetEl: '#target-element' });
 * ```
 *
 * @example
 * ```ts
 * // Advanced configuration with boundary container
 * Adhesive.create({
 *   targetEl: document.querySelector('.sidebar'),
 *   boundingEl: '.main-content',
 *   position: 'bottom',
 *   offset: 20,
 *   zIndex: 999,
 *   outerClassName: 'custom-outer',
 *   innerClassName: 'custom-inner',
 *   activeClassName: 'custom-active',
 *   releasedClassName: 'custom-released',
 * });
 * ```
 *
 * @example
 * ```ts
 * const adhesive = Adhesive.create({ targetEl: '#target-element' });
 *
 * // Dynamic configuration updates
 * adhesive.updateOptions({
 *   position: 'bottom',
 *   offset: 50
 * });
 *
 * // State monitoring
 * const state = adhesive.getState();
 * console.log(`Status: ${state.status}, Sticky: ${state.isSticky}`);
 * ```
 */
export class Adhesive {
  #observer: ResizeObserver | null = null;
  #targetEl!: HTMLElement;
  #boundingEl!: HTMLElement;
  #outerWrapper: HTMLElement | null = null;
  #innerWrapper: HTMLElement | null = null;
  #options!: InternalAdhesiveOptions;
  #state!: InternalAdhesiveState;
  #isEnabled = true;
  #originalSelectors: {
    targetEl: ElementSelector;
    boundingEl: ElementSelector | null;
  } | null = null;

  // Performance optimization: cache frequently accessed values
  #scrollTop = -1;
  #winHeight = -1;

  // Request Animation Frame optimization for smooth updates
  #rafId: number | null = null;
  #pendingUpdate = false;
  #pendingResizeUpdate = false;

  /**
   * Static factory method for convenient instance creation and initialization
   *
   * @param options - Configuration options for the sticky behavior
   * @returns Initialized Adhesive instance ready for use
   *
   * @example
   * ```ts
   * // Convenient one-liner initialization
   * Adhesive.create({
   *   targetEl: '#target-element',
   *   offset: 20
   * });
   * ```
   */
  static create(options: AdhesiveOptions): Adhesive {
    return new Adhesive(options).init();
  }

  /**
   * Creates a new Adhesive instance.
   *
   * @param options - Configuration options for the sticky behavior
   * @throws {Error} When targetEl is not provided or not found in the DOM
   * @throws {Error} When targetEl doesn't have a parent node (required for wrapper creation)
   * @throws {Error} When boundingEl is specified but not found in the DOM
   *
   * @example
   * ```ts
   * // Basic usage with element selector
   * new Adhesive({
   *   targetEl: '#target-element',
   *   offset: 10
   * });
   * ```
   *
   * @example
   * ```ts
   * // Advanced usage with all options
   * new Adhesive({
   *   targetEl: document.querySelector('.sidebar'),
   *   boundingEl: '.main-content',
   *   position: 'bottom',
   *   offset: 20,
   *   zIndex: 999,
   *   outerClassName: 'custom-outer',
   *   innerClassName: 'custom-inner',
   *   activeClassName: 'custom-active',
   *   releasedClassName: 'custom-released',
   * });
   * ```
   */
  constructor(options: AdhesiveOptions) {
    // Handle SSR environment - create disabled instance and return early
    if (!isBrowser()) {
      // Still validate required options even in SSR
      if (!options.targetEl) {
        throw createAdhesiveError("TARGET_EL_REQUIRED", {
          selector: options.targetEl,
        });
      }
      this.#initializeSSRInstance(options);
      return;
    }

    // Validate required options early
    if (!options.targetEl) {
      throw createAdhesiveError("TARGET_EL_REQUIRED", {
        selector: options.targetEl,
      });
    }

    // Resolve and validate elements
    const targetEl = resolveElement(options.targetEl);
    validateElement(targetEl, "TARGET_EL_NOT_FOUND", {
      selector: options.targetEl,
    });
    this.#targetEl = targetEl;

    const boundingEl = options.boundingEl
      ? resolveElement(options.boundingEl)
      : document.body;
    validateElement(boundingEl, "BOUNDING_EL_NOT_FOUND", {
      selector: options.boundingEl,
    });
    this.#boundingEl = boundingEl;

    // Initialize options
    this.#options = {
      targetEl,
      boundingEl,
      enabled: options.enabled ?? DEFAULTS.ENABLED,
      offset: options.offset ?? DEFAULTS.OFFSET,
      position: options.position ?? DEFAULTS.POSITION,
      zIndex: options.zIndex ?? DEFAULTS.Z_INDEX,
      outerClassName: options.outerClassName ?? DEFAULTS.OUTER_CLASS,
      innerClassName: options.innerClassName ?? DEFAULTS.INNER_CLASS,
      activeClassName: options.activeClassName ?? DEFAULTS.ACTIVE_CLASS,
      releasedClassName: options.releasedClassName ?? DEFAULTS.RELEASED_CLASS,
    };

    // Handle disabled state - only set flag, don't create dummy elements
    if (options.enabled === false) {
      this.#isEnabled = false;
      this.#state = createInitialState();
      return;
    }

    // For enabled instances, create DOM structure and initialize
    this.#createWrappers();
    this.#state = createInitialState(this.#innerWrapper);
    this.#state.bottomBoundary = this.#getBottomBoundary();

    // Initialize viewport dimensions
    this.#winHeight = getViewportHeight();
    this.#scrollTop = getScrollTop();
  }

  #initializeSSRInstance(options: AdhesiveOptions): void {
    this.#isEnabled = false;
    // Store original selectors for later resolution when transitioning to browser
    this.#originalSelectors = {
      targetEl: options.targetEl,
      boundingEl: options.boundingEl ?? null,
    };
    // Create dummy elements that won't be used in SSR
    const dummyElement: HTMLElement = Object.create(null);
    this.#targetEl = dummyElement;
    this.#boundingEl = dummyElement;
    this.#options = {
      targetEl: this.#targetEl,
      boundingEl: this.#boundingEl,
      enabled: false,
      offset: options.offset ?? DEFAULTS.OFFSET,
      position: options.position ?? DEFAULTS.POSITION,
      zIndex: options.zIndex ?? DEFAULTS.Z_INDEX,
      outerClassName: options.outerClassName ?? DEFAULTS.OUTER_CLASS,
      innerClassName: options.innerClassName ?? DEFAULTS.INNER_CLASS,
      activeClassName: options.activeClassName ?? DEFAULTS.ACTIVE_CLASS,
      releasedClassName: options.releasedClassName ?? DEFAULTS.RELEASED_CLASS,
    };
    this.#state = createInitialState();
  }

  // =============================================================================
  // DOM Manipulation Methods
  // =============================================================================

  #createWrappers(): void {
    const { outerClassName, innerClassName } = this.#options;

    this.#outerWrapper = document.createElement("div");
    this.#outerWrapper.className = outerClassName;

    this.#innerWrapper = document.createElement("div");
    this.#innerWrapper.className = innerClassName;

    const parent = this.#targetEl.parentNode;
    if (!parent) {
      throw createAdhesiveError("TARGET_EL_NO_PARENT", {
        targetEl: this.#targetEl,
      });
    }

    parent.insertBefore(this.#outerWrapper, this.#targetEl);
    this.#outerWrapper.append(this.#innerWrapper);
    this.#innerWrapper.append(this.#targetEl);
  }

  #translate(style: CSSStyleDeclaration, pos: number): void {
    // Use translate3d for hardware acceleration and smooth animations
    const roundedPos = Math.round(pos * 100) / 100; // Round to 2 decimal places for precision
    style.transform = `translate3d(0, ${roundedPos}px, 0)`;
  }

  // =============================================================================
  // Calculation and Measurement Methods
  // =============================================================================

  #getBottomBoundary(): number {
    if (
      !isBrowser() ||
      !this.#boundingEl ||
      this.#boundingEl === document.body
    ) {
      return Number.POSITIVE_INFINITY;
    }
    const rect = this.#boundingEl.getBoundingClientRect();
    return getScrollTop() + rect.bottom;
  }

  #updateInitialDimensions(): void {
    if (!this.#outerWrapper || !this.#innerWrapper) return;

    const outerRect = this.#outerWrapper.getBoundingClientRect();
    const innerRect = this.#innerWrapper.getBoundingClientRect();

    // Get dimensions with fallbacks for browser compatibility
    const width =
      outerRect.width ||
      outerRect.right - outerRect.left ||
      this.#outerWrapper.offsetWidth;
    const height =
      innerRect.height ||
      innerRect.bottom - innerRect.top ||
      this.#innerWrapper.offsetHeight;
    const outerY = outerRect.top + this.#scrollTop;

    // Batch update state for better performance
    Object.assign(this.#state, {
      width,
      height,
      x: outerRect.left,
      y: outerY,
      topBoundary: outerY,
      bottomBoundary: this.#getBottomBoundary(),
    });
  }

  #updateWidthDimensions(): void {
    if (!this.#outerWrapper || !this.#innerWrapper) return;

    const wasPositioned = this.#state.status !== ADHESIVE_STATUS.INITIAL;
    let newWidth: number;
    let newX: number;

    if (wasPositioned) {
      // Temporarily reset positioning to get accurate measurements
      const innerStyle = this.#innerWrapper.style;
      const originalStyles = {
        position: innerStyle.position,
        transform: innerStyle.transform,
        top: innerStyle.top,
        bottom: innerStyle.bottom,
      };

      // Reset styles
      Object.assign(innerStyle, {
        position: "static",
        transform: "",
        top: "",
        bottom: "",
      });

      // Force reflow and measure
      this.#outerWrapper.offsetHeight; // eslint-disable-line @typescript-eslint/no-unused-expressions
      const rect = this.#outerWrapper.getBoundingClientRect();
      newWidth =
        rect.width || rect.right - rect.left || this.#outerWrapper.offsetWidth;
      newX = rect.left;

      // Restore styles
      Object.assign(innerStyle, originalStyles);
    } else {
      // Simple measurement for initial state
      const rect = this.#outerWrapper.getBoundingClientRect();
      newWidth =
        rect.width || rect.right - rect.left || this.#outerWrapper.offsetWidth;
      newX = rect.left;
    }

    this.#state.width = newWidth;
    this.#state.x = newX;
  }

  #forceWidthUpdate(): void {
    this.#updateWidthDimensions();
    this.#updateStyles();
  }

  // =============================================================================
  // State Management Methods
  // =============================================================================

  #setState(newState: Partial<InternalAdhesiveState>): void {
    const prevStatus = this.#state.status;

    // Batch update all state changes
    Object.assign(this.#state, newState);

    // Only update styles if status actually changed (performance optimization)
    if (prevStatus !== this.#state.status) {
      this.#updateStyles();
    }
  }

  /**
   * Ensures the options object is mutable by creating a copy if frozen.
   *
   * Note: This method assumes this.#options is always a complete InternalAdhesiveOptions
   * object (never partial), which is guaranteed by our initialization logic.
   * The spread operation preserves all existing properties from the frozen object.
   */
  #ensureOptionsAreMutable(): void {
    if (Object.isFrozen(this.#options)) {
      this.#options = { ...this.#options };
    }
  }

  #reset(): void {
    this.#setState({
      status: ADHESIVE_STATUS.INITIAL,
      pos: 0,
      isSticky: false,
    });
  }

  #release(pos: number): void {
    this.#setState({
      status: ADHESIVE_STATUS.RELATIVE,
      pos,
      isSticky: false,
    });
  }

  #fix(pos: number): void {
    this.#setState({
      status: ADHESIVE_STATUS.FIXED,
      pos,
      isSticky: true,
    });
  }

  // =============================================================================
  // Style and CSS Management Methods
  // =============================================================================

  #updateStyles(): void {
    if (!this.#innerWrapper || !this.#outerWrapper) return;

    const { status, pos, width, height } = this.#state;
    const { position, zIndex } = this.#options;
    const isFixed = status === ADHESIVE_STATUS.FIXED;
    const isRelative = status === ADHESIVE_STATUS.RELATIVE;

    // Reset all positioning styles
    const innerStyle = this.#innerWrapper.style;
    innerStyle.position = isFixed ? "fixed" : isRelative ? "relative" : "";
    innerStyle.top = "";
    innerStyle.bottom = "";
    innerStyle.transform = "";

    // Apply common styles
    innerStyle.zIndex = String(zIndex);
    innerStyle.width = isFixed ? `${width}px` : "";
    this.#outerWrapper.style.height = isFixed ? `${height}px` : "";

    // Apply positioning based on state
    if (isFixed) {
      if (position === "bottom") {
        innerStyle.bottom = `${pos}px`;
      } else {
        innerStyle.top = `${pos}px`;
      }
    } else if (isRelative) {
      this.#translate(innerStyle, pos);
    }

    this.#updateClassNames();
  }

  #updateClassNames(): void {
    if (!this.#outerWrapper) return;

    const { status } = this.#state;
    const { outerClassName, activeClassName, releasedClassName } =
      this.#options;

    const classes = [outerClassName];
    if (status === ADHESIVE_STATUS.FIXED) classes.push(activeClassName);
    if (status === ADHESIVE_STATUS.RELATIVE) classes.push(releasedClassName);

    this.#outerWrapper.className = classes.join(" ");
  }

  // =============================================================================
  // Positioning Logic Methods
  // =============================================================================

  #update(): void {
    const { bottomBoundary, topBoundary, height, width } = this.#state;

    const isDisabled =
      !this.#isEnabled ||
      bottomBoundary - topBoundary <= height ||
      (width === 0 && height === 0);

    if (isDisabled) {
      if (this.#state.status !== ADHESIVE_STATUS.INITIAL) {
        this.#reset();
      }
      return;
    }

    const { offset, position } = this.#options;

    if (position === "bottom") {
      this.#updateForBottomPosition(offset);
    } else {
      this.#updateForTopPosition(offset);
    }
  }

  #updateForTopPosition(offset: number): void {
    const { bottomBoundary, topBoundary, height } = this.#state;
    const top = this.#scrollTop + offset;
    const bottom = top + height;

    if (top <= topBoundary) {
      this.#reset();
    } else if (bottom >= bottomBoundary) {
      const stickyTop = bottomBoundary - height;
      const relativePos = stickyTop - this.#state.y;
      this.#release(relativePos);
    } else if (height > this.#winHeight - offset) {
      this.#handleTallElement(top, bottom);
    } else {
      this.#fix(offset);
    }
  }

  #updateForBottomPosition(offset: number): void {
    const { bottomBoundary, topBoundary, height } = this.#state;
    const viewportBottom = this.#scrollTop + this.#winHeight;
    const elementNaturalBottom = this.#state.y + height;

    // Check if element's natural position is above viewport bottom
    if (elementNaturalBottom >= viewportBottom - offset) {
      this.#reset();
      return;
    }

    // Calculate position if stuck to viewport bottom
    const stuckElementBottom = viewportBottom - offset;
    const stuckElementTop = stuckElementBottom - height;

    // Check boundary constraints
    if (stuckElementTop < topBoundary) {
      this.#release(topBoundary - this.#state.y);
      return;
    }

    if (stuckElementBottom > bottomBoundary) {
      this.#release(bottomBoundary - height - this.#state.y);
      return;
    }

    // Handle tall elements
    if (height > this.#winHeight - offset) {
      this.#handleTallElementBottom(stuckElementTop, stuckElementBottom);
      return;
    }

    this.#fix(offset);
  }

  // =============================================================================
  // Tall Element Handling Methods
  // =============================================================================

  #handleTallElement(top: number, bottom: number): void {
    const { status, y, height } = this.#state;
    const { offset } = this.#options;

    switch (status) {
      case ADHESIVE_STATUS.INITIAL:
        this.#release(0); // Start at natural position
        break;
      case ADHESIVE_STATUS.RELATIVE:
        if (bottom > y + height) {
          this.#fix(offset + height - this.#winHeight);
        } else if (top < y) {
          this.#fix(offset);
        }
        break;
      case ADHESIVE_STATUS.FIXED: {
        const releaseInfo = this.#shouldReleaseFromFixed(top, bottom);
        if (releaseInfo.release) {
          this.#release(releaseInfo.position);
        }
        break;
      }
    }
  }

  #handleTallElementBottom(elementTop: number, elementBottom: number): void {
    const { status, y, height } = this.#state;
    const { offset } = this.#options;

    switch (status) {
      case ADHESIVE_STATUS.INITIAL:
        this.#release(0);
        break;
      case ADHESIVE_STATUS.RELATIVE: {
        const currentTop = y + this.#state.pos;
        const currentBottom = currentTop + height;
        const viewportTop = this.#scrollTop;
        const viewportBottom = this.#scrollTop + this.#winHeight;

        // Check scroll direction and viewport boundaries
        if (elementBottom < currentBottom && currentTop < viewportTop) {
          this.#fix(offset); // Stick to bottom
        } else if (elementTop > currentTop && currentBottom > viewportBottom) {
          this.#fix(height - this.#winHeight + offset); // Stick to top
        }
        break;
      }
      case ADHESIVE_STATUS.FIXED: {
        const releaseInfo = this.#shouldReleaseFromFixedBottom(
          elementTop,
          elementBottom,
        );
        if (releaseInfo.release) {
          this.#release(releaseInfo.position);
        }
        break;
      }
    }
  }

  #shouldReleaseFromFixed(
    top: number,
    bottom: number,
  ): { release: boolean; position: number } {
    const { pos, height, y } = this.#state;
    const { offset } = this.#options;

    if (pos === offset) {
      return { release: true, position: top - y };
    }

    if (pos === offset + height - this.#winHeight) {
      return { release: true, position: bottom - height - y };
    }

    return { release: false, position: 0 };
  }

  #shouldReleaseFromFixedBottom(
    elementTop: number,
    elementBottom: number,
  ): { release: boolean; position: number } {
    const { pos, height, y } = this.#state;
    const { offset } = this.#options;

    // If currently stuck to bottom and element should be released
    if (pos === offset) {
      return { release: true, position: elementTop - y };
    }

    // If currently stuck to top (for tall elements) and should be released
    if (pos === height - this.#winHeight + offset) {
      return { release: true, position: elementBottom - height - y };
    }

    return { release: false, position: 0 };
  }

  // =============================================================================
  // Event Handlers
  // =============================================================================

  #setupEventListeners(): void {
    // Add event listeners with optimal performance settings
    window.addEventListener("scroll", this.#onScroll, { passive: true });
    window.addEventListener("resize", this.#onWindowResize, { passive: true });

    // Modern ResizeObserver for better performance
    if ("ResizeObserver" in window) {
      this.#observer = new ResizeObserver(this.#onElementResize);
      this.#observer.observe(this.#boundingEl);
      if (this.#outerWrapper) {
        this.#observer.observe(this.#outerWrapper);
      }
      // Also observe the target element for content changes
      this.#observer.observe(this.#targetEl);
    } else {
      console.warn(
        `@adhesivejs/core: ${ERROR_CODES.RESIZE_OBSERVER_NOT_SUPPORTED}`,
      );
    }
  }

  readonly #onScroll = (): void => {
    this.#scheduleUpdate(() => {
      this.#scrollTop = getScrollTop();
      this.#updateInitialDimensions();
      this.#update();
    });
  };

  readonly #onWindowResize = (): void => {
    this.#scheduleUpdate(() => {
      this.#winHeight = getViewportHeight();
      this.#updateInitialDimensions();
      this.#update();
    });
  };

  readonly #onElementResize = (entries: ResizeObserverEntry[]): void => {
    if (!this.#isEnabled) return;

    if (entries.length === 0) return;

    if (this.#pendingResizeUpdate) return;

    // Check if any entries are for tracked elements before scheduling update
    let needsWidthUpdate = false;
    let needsFullUpdate = false;

    for (const entry of entries) {
      if (entry.target === this.#outerWrapper) {
        needsWidthUpdate = true;
      } else if (
        entry.target === this.#boundingEl ||
        entry.target === this.#targetEl
      ) {
        needsFullUpdate = true;
      }
    }

    // Only schedule update if we found relevant entries
    if (!needsFullUpdate && !needsWidthUpdate) return;

    this.#pendingResizeUpdate = true;

    // Cancel any existing RAF callback before scheduling a new one
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
    }

    this.#rafId = requestAnimationFrame(() => {
      // Check if still enabled when callback executes (prevent state corruption)
      if (!this.#isEnabled) {
        this.#pendingResizeUpdate = false;
        return;
      }

      this.#pendingResizeUpdate = false;

      if (needsFullUpdate) {
        this.#updateInitialDimensions();
      } else if (needsWidthUpdate) {
        this.#updateWidthDimensions();
      }

      this.#updateStyles();
      this.#update();
    });
  };

  #scheduleUpdate(updateFn: () => void): void {
    if (!this.#isEnabled || this.#pendingUpdate) return;

    this.#pendingUpdate = true;

    // Cancel any existing RAF callback before scheduling a new one
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
    }

    this.#rafId = requestAnimationFrame(() => {
      // Check if still enabled when callback executes (prevent state corruption)
      if (!this.#isEnabled) {
        this.#pendingUpdate = false;
        return;
      }

      this.#pendingUpdate = false;
      updateFn();
    });
  }

  // =============================================================================
  // Public API Methods
  // =============================================================================

  /**
   * Initializes the sticky behavior by setting up event listeners and observers.
   * Must be called after creating the Adhesive instance to activate sticky positioning.
   *
   * @returns The Adhesive instance for method chaining
   *
   * @example
   * ```ts
   * new Adhesive({ targetEl: '#target-element' }).init();
   *
   * // Or use the convenient factory method
   * Adhesive.create({ targetEl: '#target-element' });
   * ```
   */
  init(): this {
    if (!isBrowser() || !this.#isEnabled) return this;

    this.#state.activated = true;
    this.#updateInitialDimensions();
    this.#update();

    // Only set up event listeners if they haven't been set up yet
    if (!this.#observer) {
      this.#setupEventListeners();
    }

    return this;
  }

  /**
   * Enables the sticky behavior if it was previously disabled.
   *
   * @returns The Adhesive instance for method chaining
   *
   * @example
   * ```ts
   * adhesive.enable(); // Re-enable sticky behavior
   * ```
   */
  enable(): this {
    if (this.#isEnabled) return this;

    this.#isEnabled = true;

    // In SSR environment, just set the flag and return
    if (!isBrowser()) {
      this.#state.activated = true;
      return this;
    }

    // Re-resolve elements if instance was created in SSR mode
    this.#resolveSSRElements();

    // Create wrappers if they don't exist yet (instance was created disabled)
    this.#ensureWrappersExist();

    // Always set activated to true after any state initialization
    this.#state.activated = true;

    this.#updateInitialDimensions();
    this.#update();

    // Set up event listeners if they haven't been set up yet
    if (!this.#observer) {
      this.#setupEventListeners();
    }

    return this;
  }

  #resolveSSRElements(): void {
    if (!this.#originalSelectors) return;

    const targetEl = resolveElement(this.#originalSelectors.targetEl);
    const boundingEl = this.#originalSelectors.boundingEl
      ? resolveElement(this.#originalSelectors.boundingEl)
      : null;

    if (!targetEl) {
      throw createAdhesiveError("TARGET_EL_REQUIRED", {
        targetEl: this.#originalSelectors.targetEl,
      });
    }

    this.#targetEl = targetEl;
    this.#boundingEl = boundingEl ?? targetEl;
    this.#options.targetEl = this.#targetEl;
    this.#options.boundingEl = this.#boundingEl;

    // Clear original selectors as they're no longer needed
    this.#originalSelectors = null;
  }

  #ensureWrappersExist(): void {
    if (!this.#outerWrapper || !this.#innerWrapper) {
      this.#createWrappers();
      this.#state = createInitialState(this.#innerWrapper);
      this.#state.bottomBoundary = this.#getBottomBoundary();
      this.#winHeight = getViewportHeight();
      this.#scrollTop = getScrollTop();
    }
  }

  /**
   * Disables the sticky behavior and resets the element to its original position.
   *
   * This method safely cancels any pending animation frames to prevent memory leaks
   * and race conditions that could occur with rapid enable/disable cycles.
   *
   * @returns The Adhesive instance for method chaining
   *
   * @example
   * ```ts
   * adhesive.disable(); // Temporarily disable sticky behavior
   *
   * // Safe to call multiple times or during rapid enable/disable cycles
   * adhesive.disable().enable().disable();
   * ```
   */
  disable(): this {
    this.#isEnabled = false;
    this.#state.activated = false;

    // Cancel any pending RAF operations to prevent memory leaks and race conditions
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
    this.#pendingUpdate = false;
    this.#pendingResizeUpdate = false;

    this.#reset();
    return this;
  }

  /**
   * Updates the configuration options of the Adhesive instance.
   * The instance will recalculate dimensions and update behavior based on new options.
   *
   * @param newOptions - Partial options object with properties to update
   * @returns The Adhesive instance for method chaining
   *
   * @example
   * ```ts
   * adhesive.updateOptions({
   *   offset: 50,
   *   zIndex: 2000
   * });
   * ```
   */
  updateOptions(newOptions: Partial<AdhesiveOptions>): this {
    const optionsToUpdate = Object.entries(newOptions).filter(
      ([, value]) => value !== undefined,
    ) as Array<[keyof InternalAdhesiveOptions, unknown]>;

    // Handle enabled state changes first (these may cause early return)
    for (const [key, value] of optionsToUpdate) {
      if (key === "enabled") {
        const isDisabling = value === false;
        if (isDisabling) return this.disable();
        this.enable();
        break; // Only one enabled key possible
      }
    }

    // Handle other option updates
    const otherOptions = optionsToUpdate.filter(([key]) => key !== "enabled");
    if (otherOptions.length > 0) {
      this.#ensureOptionsAreMutable();

      for (const [key, value] of otherOptions) {
        if (key in this.#options) {
          (this.#options as any)[key] = value;
        }
      }
    }

    this.#updateInitialDimensions();
    this.#update();
    return this;
  }

  /**
   * Returns a copy of the current state of the Adhesive instance.
   * This provides read-only access to internal state properties.
   *
   * @returns A copy of the current AdhesiveState
   *
   * @example
   * ```ts
   * const state = adhesive.getState();
   * console.log('Current status:', state.status);
   * console.log('Is sticky:', state.isSticky);
   * console.log('Element dimensions:', { width: state.width, height: state.height });
   * ```
   */
  getState(): AdhesiveState {
    return { ...this.#state };
  }

  /**
   * Manually triggers a width update for the sticky element.
   * This is useful when the element's container width changes due to external factors
   * that might not be detected by the ResizeObserver (e.g., CSS changes via JavaScript).
   *
   * @returns The Adhesive instance for method chaining
   *
   * @example
   * ```ts
   * // After programmatically changing container width
   * adhesive.refreshWidth();
   * ```
   */
  refreshWidth(): this {
    if (!this.#isEnabled) return this;
    this.#forceWidthUpdate();
    return this;
  }

  /**
   * Cleans up the Adhesive instance by removing event listeners, disconnecting observers,
   * canceling pending animations, and restoring the original DOM structure.
   *
   * This method ensures complete cleanup to prevent memory leaks and should be called
   * when the sticky behavior is no longer needed.
   *
   * @example
   * ```ts
   * // Clean up when component unmounts or sticky is no longer needed
   * adhesive.cleanup();
   * ```
   */
  cleanup(): void {
    if (!isBrowser()) return;

    // Cancel any pending RAF operations and timeouts
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }

    this.#pendingUpdate = false;
    this.#pendingResizeUpdate = false;

    // Remove event listeners
    window.removeEventListener("scroll", this.#onScroll);
    window.removeEventListener("resize", this.#onWindowResize);

    // Disconnect observers
    this.#observer?.disconnect();
    this.#observer = null;

    // Reset state
    this.#reset();
    this.#state.activated = false;

    // Restore original DOM structure
    if (this.#outerWrapper?.parentNode) {
      const parent = this.#outerWrapper.parentNode;
      parent.insertBefore(this.#targetEl, this.#outerWrapper);
      this.#outerWrapper.remove();
    }

    // Clear references for garbage collection
    this.#outerWrapper = null;
    this.#innerWrapper = null;
  }
}
