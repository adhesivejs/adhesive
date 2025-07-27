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

const DEFAULT_CONFIG = {
  OFFSET: 0,
  POSITION: "top" as const satisfies AdhesivePosition,
  Z_INDEX: 1,
  ENABLED: true,
  CLASS_NAMES: {
    OUTER_WRAPPER: "adhesive__outer",
    INNER_WRAPPER: "adhesive__inner",
    ACTIVE: "adhesive--active",
    RELEASED: "adhesive--released",
  },
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

const ERROR_REGISTRY = {
  TARGET_EL_REQUIRED: {
    code: "TARGET_EL_REQUIRED",
    message: "targetEl is required",
  },
  TARGET_EL_NOT_FOUND: {
    code: "TARGET_EL_NOT_FOUND",
    message: "targetEl not found in DOM",
  },
  TARGET_EL_NO_PARENT: {
    code: "TARGET_EL_NO_PARENT",
    message: "targetEl must have a parent node for wrapper creation",
  },
  BOUNDING_EL_NOT_FOUND: {
    code: "BOUNDING_EL_NOT_FOUND",
    message: "boundingEl not found in DOM",
  },
  INSTANCE_DISABLED: {
    code: "INSTANCE_DISABLED",
    message: "Instance is disabled",
  },
  RESIZE_OBSERVER_NOT_SUPPORTED: {
    code: "RESIZE_OBSERVER_NOT_SUPPORTED",
    message: "ResizeObserver not supported in this environment",
  },
} as const;

function createAdhesiveError(
  errorKey: keyof typeof ERROR_REGISTRY,
  context: Record<string, unknown>,
): AdhesiveError {
  const error = ERROR_REGISTRY[errorKey];
  return new AdhesiveError(error.message, error.code, context);
}

function resolveElement(element: HTMLElement | string): HTMLElement | null {
  if (typeof element === "string") {
    const resolved = document.querySelector(element);
    return resolved instanceof HTMLElement ? resolved : null;
  }
  return element;
}

function getScrollTop(): number {
  return (
    window.scrollY ??
    window.pageYOffset ??
    document.documentElement.scrollTop ??
    0
  );
}

function getViewportHeight(): number {
  return window.innerHeight ?? document.documentElement.clientHeight ?? 0;
}

function validateElement(
  element: HTMLElement | null,
  errorKey: keyof typeof ERROR_REGISTRY,
  context: Record<string, unknown>,
): asserts element is HTMLElement {
  if (!element) {
    throw createAdhesiveError(errorKey, context);
  }
}

function createInitialOptions(
  options: AdhesiveOptions,
): InternalAdhesiveOptions {
  const targetEl = resolveElement(options.targetEl);
  validateElement(targetEl, "TARGET_EL_NOT_FOUND", {
    selector: options.targetEl,
  });

  const boundingEl = options.boundingEl
    ? resolveElement(options.boundingEl)
    : document.body;
  validateElement(boundingEl, "BOUNDING_EL_NOT_FOUND", {
    selector: options.boundingEl,
  });

  return {
    targetEl,
    boundingEl,
    enabled: options.enabled ?? DEFAULT_CONFIG.ENABLED,
    offset: options.offset ?? DEFAULT_CONFIG.OFFSET,
    position: options.position ?? DEFAULT_CONFIG.POSITION,
    zIndex: options.zIndex ?? DEFAULT_CONFIG.Z_INDEX,
    outerClassName:
      options.outerClassName ?? DEFAULT_CONFIG.CLASS_NAMES.OUTER_WRAPPER,
    innerClassName:
      options.innerClassName ?? DEFAULT_CONFIG.CLASS_NAMES.INNER_WRAPPER,
    activeClassName:
      options.activeClassName ?? DEFAULT_CONFIG.CLASS_NAMES.ACTIVE,
    releasedClassName:
      options.releasedClassName ?? DEFAULT_CONFIG.CLASS_NAMES.RELEASED,
  };
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
 * // SSR-safe initialization
 * typeof window !== 'undefined'
 *   ? Adhesive.create({ targetEl: '#element' })
 *   : new Adhesive({ targetEl: '#element', enabled: false });
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
    // Handle disabled state early
    if (options.enabled === false) {
      this.#initializeDisabledInstance();
      return;
    }

    // Validate required options
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
    this.#options = createInitialOptions(options);

    // Create DOM structure
    this.#createWrappers();

    // Initialize state
    this.#state = createInitialState(this.#innerWrapper);
    this.#state.bottomBoundary = this.#getBottomBoundary();

    // Initialize viewport dimensions
    this.#winHeight = getViewportHeight();
    this.#scrollTop = getScrollTop();
  }

  #initializeDisabledInstance(): void {
    this.#isEnabled = false;
    this.#targetEl = document.createElement("div");
    this.#boundingEl = document.createElement("div");
    this.#options = this.#createDisabledOptions();
    this.#state = createInitialState();
  }

  #createDisabledOptions(): InternalAdhesiveOptions {
    return Object.freeze({
      targetEl: this.#targetEl,
      boundingEl: this.#boundingEl,
      enabled: false,
      offset: DEFAULT_CONFIG.OFFSET,
      position: DEFAULT_CONFIG.POSITION,
      zIndex: 1,
      outerClassName: DEFAULT_CONFIG.CLASS_NAMES.OUTER_WRAPPER,
      innerClassName: DEFAULT_CONFIG.CLASS_NAMES.INNER_WRAPPER,
      activeClassName: DEFAULT_CONFIG.CLASS_NAMES.ACTIVE,
      releasedClassName: DEFAULT_CONFIG.CLASS_NAMES.RELEASED,
    });
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
    if (!this.#boundingEl || this.#boundingEl === document.body) {
      return Number.POSITIVE_INFINITY;
    }
    const rect = this.#boundingEl.getBoundingClientRect();
    return getScrollTop() + rect.bottom;
  }

  #updateInitialDimensions(): void {
    if (!this.#outerWrapper || !this.#innerWrapper) return;

    // Use getBoundingClientRect for precise measurements
    const outerRect = this.#outerWrapper.getBoundingClientRect();
    const innerRect = this.#innerWrapper.getBoundingClientRect();

    // Calculate dimensions with fallbacks for browser compatibility
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

    // For width updates, we need to temporarily reset positioning to get accurate measurements
    const wasFixed = this.#state.status === ADHESIVE_STATUS.FIXED;
    const wasRelative = this.#state.status === ADHESIVE_STATUS.RELATIVE;

    if (wasFixed || wasRelative) {
      // Temporarily clear positioning styles to get natural width
      const innerStyle = this.#innerWrapper.style;
      const originalPosition = innerStyle.position;
      const originalTransform = innerStyle.transform;
      const originalTop = innerStyle.top;
      const originalBottom = innerStyle.bottom;

      innerStyle.position = "static";
      innerStyle.transform = "";
      innerStyle.top = "";
      innerStyle.bottom = "";

      // Force reflow to get accurate measurements
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.#outerWrapper.offsetHeight;

      const outerRect = this.#outerWrapper.getBoundingClientRect();
      const newWidth =
        outerRect.width ||
        outerRect.right - outerRect.left ||
        this.#outerWrapper.offsetWidth;

      // Restore positioning styles
      innerStyle.position = originalPosition;
      innerStyle.transform = originalTransform;
      innerStyle.top = originalTop;
      innerStyle.bottom = originalBottom;

      // Update state with new width
      this.#state.width = newWidth;
      this.#state.x = outerRect.left;
    } else {
      // For initial state, simple measurement is sufficient
      const outerRect = this.#outerWrapper.getBoundingClientRect();
      const newWidth =
        outerRect.width ||
        outerRect.right - outerRect.left ||
        this.#outerWrapper.offsetWidth;
      this.#state.width = newWidth;
      this.#state.x = outerRect.left;
    }
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

    const { innerWrapper, outerWrapper } = {
      innerWrapper: this.#innerWrapper,
      outerWrapper: this.#outerWrapper,
    };

    const isFixed = this.#state.status === ADHESIVE_STATUS.FIXED;
    const { position } = this.#options;

    // Clear all positioning styles first
    innerWrapper.style.position = "";
    innerWrapper.style.top = "";
    innerWrapper.style.bottom = "";
    innerWrapper.style.transform = "";

    // Set common styles
    innerWrapper.style.zIndex = String(this.#options.zIndex);
    innerWrapper.style.width = isFixed ? `${this.#state.width}px` : "";
    outerWrapper.style.height = isFixed ? `${this.#state.height}px` : "";

    // Apply positioning based on state
    if (isFixed) {
      // Fixed positioning: use CSS top/bottom properties
      innerWrapper.style.position = "fixed";
      if (position === "bottom") {
        innerWrapper.style.bottom = `${this.#state.pos}px`;
      } else {
        innerWrapper.style.top = `${this.#state.pos}px`;
      }
    } else if (this.#state.status === ADHESIVE_STATUS.RELATIVE) {
      // Relative positioning: use transform for smooth movement
      innerWrapper.style.position = "relative";
      this.#translate(innerWrapper.style, this.#state.pos);
    } else {
      // Initial state: no special positioning
      innerWrapper.style.position = "relative";
    }

    this.#updateClassNames();
  }

  #updateClassNames(): void {
    if (!this.#outerWrapper) return;

    const { status } = this.#state;
    const { outerClassName, activeClassName, releasedClassName } =
      this.#options;

    const classes: string[] = [outerClassName];
    if (status === ADHESIVE_STATUS.FIXED) classes.push(activeClassName);
    if (status === ADHESIVE_STATUS.RELATIVE) classes.push(releasedClassName);
    this.#outerWrapper.className = classes.join(" ").trim();
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

    // For bottom positioning, the element should stick to the bottom of the viewport
    const viewportBottom = this.#scrollTop + this.#winHeight;
    const elementNaturalBottom = this.#state.y + height;

    // Check if the element's natural position is above the viewport bottom
    // If so, the element should be in its initial state
    if (elementNaturalBottom >= viewportBottom - offset) {
      this.#reset();
      return;
    }

    // Calculate where the element would be if stuck to viewport bottom
    const stuckElementBottom = viewportBottom - offset;
    const stuckElementTop = stuckElementBottom - height;

    // Check if element would extend above its top boundary when stuck
    if (stuckElementTop < topBoundary) {
      const relativePos = topBoundary - this.#state.y;
      this.#release(relativePos);
      return;
    }

    // Check if the stuck position would exceed the bottom boundary
    if (stuckElementBottom > bottomBoundary) {
      const relativePos = bottomBoundary - height - this.#state.y;
      this.#release(relativePos);
      return;
    }

    // Handle tall elements
    if (height > this.#winHeight - offset) {
      this.#handleTallElementBottom(stuckElementTop, stuckElementBottom);
      return;
    }

    // Element should be fixed to bottom
    this.#fix(offset);
  }

  // =============================================================================
  // Tall Element Handling Methods
  // =============================================================================

  #handleTallElement(top: number, bottom: number): void {
    const { status, y, height } = this.#state;
    const { offset } = this.#options;

    switch (status) {
      case ADHESIVE_STATUS.INITIAL: {
        const relativePos = 0; // Start at element's natural position
        this.#release(relativePos);
        break;
      }
      case ADHESIVE_STATUS.RELATIVE: {
        if (bottom > y + height) {
          this.#fix(offset + height - this.#winHeight);
        } else if (top < y) {
          this.#fix(offset);
        }
        break;
      }
      case ADHESIVE_STATUS.FIXED: {
        const shouldRelease = this.#shouldReleaseFromFixed(top, bottom);
        if (shouldRelease.release) {
          this.#release(shouldRelease.position);
        }
        break;
      }
    }
  }

  #handleTallElementBottom(elementTop: number, elementBottom: number): void {
    const { status, y, height } = this.#state;
    const { offset } = this.#options;

    switch (status) {
      case ADHESIVE_STATUS.INITIAL: {
        // Start in relative position
        this.#release(0);
        break;
      }
      case ADHESIVE_STATUS.RELATIVE: {
        const currentElementTop = y + this.#state.pos;
        const currentElementBottom = currentElementTop + height;
        const viewportTop = this.#scrollTop;
        const viewportBottom = this.#scrollTop + this.#winHeight;

        // If scrolling down and element bottom would go above viewport bottom
        if (
          elementBottom < currentElementBottom &&
          currentElementTop < viewportTop
        ) {
          // Stick to bottom with appropriate offset
          this.#fix(offset);
        }
        // If scrolling up and element top would go below viewport top
        else if (
          elementTop > currentElementTop &&
          currentElementBottom > viewportBottom
        ) {
          // Stick to top with appropriate offset
          this.#fix(height - this.#winHeight + offset);
        }
        break;
      }
      case ADHESIVE_STATUS.FIXED: {
        const shouldRelease = this.#shouldReleaseFromFixedBottom(
          elementTop,
          elementBottom,
        );
        if (shouldRelease.release) {
          this.#release(shouldRelease.position);
        }
        break;
      }
    }
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

  // =============================================================================
  // Event Handlers
  // =============================================================================

  readonly #onScroll = (): void => {
    if (!this.#isEnabled || this.#pendingUpdate) return;

    this.#pendingUpdate = true;
    this.#rafId = requestAnimationFrame(() => {
      this.#pendingUpdate = false;
      this.#scrollTop = getScrollTop();
      this.#updateInitialDimensions();
      this.#update();
    });
  };

  readonly #onWindowResize = (): void => {
    if (!this.#isEnabled || this.#pendingUpdate) return;

    this.#pendingUpdate = true;
    this.#rafId = requestAnimationFrame(() => {
      this.#pendingUpdate = false;
      this.#winHeight = getViewportHeight();
      this.#updateInitialDimensions();
      this.#update();
    });
  };

  readonly #onElementResize = (entries: ResizeObserverEntry[]): void => {
    if (!this.#isEnabled) return;

    if (this.#pendingResizeUpdate) return;

    this.#pendingResizeUpdate = true;
    this.#rafId = requestAnimationFrame(() => {
      this.#pendingResizeUpdate = false;

      // Check if this is a width-affecting resize
      let needsWidthUpdate = false;
      let needsFullUpdate = false;

      for (const entry of entries) {
        if (entry.target === this.#outerWrapper) {
          // Outer wrapper resize affects width
          needsWidthUpdate = true;
        } else if (entry.target === this.#boundingEl) {
          // Bounding element resize affects boundaries
          needsFullUpdate = true;
        } else if (entry.target === this.#targetEl) {
          // Target element content changes might affect height
          needsFullUpdate = true;
        }
      }

      if (needsFullUpdate) {
        this.#updateInitialDimensions();
      } else if (needsWidthUpdate) {
        this.#updateWidthDimensions();
      }

      this.#updateStyles();
      this.#update();
    });
  };

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
    if (!this.#isEnabled) {
      const error = ERROR_REGISTRY.INSTANCE_DISABLED;
      console.warn(`@adhesivejs/core: ${error.message}`);
      return this;
    }

    this.#state.activated = true;
    this.#updateInitialDimensions();
    this.#update();

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
      const error = ERROR_REGISTRY.RESIZE_OBSERVER_NOT_SUPPORTED;
      console.warn(`@adhesivejs/core: ${error.message}`);
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
    this.#isEnabled = true;
    this.#state.activated = true;
    this.#updateInitialDimensions();
    this.#update();
    return this;
  }

  /**
   * Disables the sticky behavior and resets the element to its original position.
   *
   * @returns The Adhesive instance for method chaining
   *
   * @example
   * ```ts
   * adhesive.disable(); // Temporarily disable sticky behavior
   * ```
   */
  disable(): this {
    this.#isEnabled = false;
    this.#state.activated = false;
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

    for (const [key, value] of optionsToUpdate) {
      if (key === "enabled") {
        const isDisabling = value === false;
        if (isDisabling) return this.disable();
        this.enable();
      }
      if (key in this.#options) {
        (this.#options as any)[key] = value;
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
