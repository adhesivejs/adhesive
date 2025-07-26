// =============================================================================
// TYPE DEFINITIONS & INTERFACES
// =============================================================================

/**
 * Modern element selector type supporting both HTMLElement instances and CSS selectors
 * @template T - The specific HTMLElement type
 */
type ElementSelector<T extends HTMLElement = HTMLElement> = T | string;

/**
 * Position types for sticky behavior with enhanced type safety
 * @public
 */
export type AdhesivePosition = "top" | "bottom";

/**
 * Configuration options for creating a Adhesive instance.
 *
 * Uses modern TypeScript features for enhanced type safety and better DX.
 * All properties are readonly by default to prevent accidental mutations.
 *
 * @template TTargetEl - The type of the sticky element (extends HTMLElement)
 * @template TBoundingEl - The type of the bounding element (extends HTMLElement)
 * @public
 */
export interface AdhesiveOptions<
  TTargetEl extends HTMLElement = HTMLElement,
  TBoundingEl extends HTMLElement = HTMLElement,
> {
  /**
   * The element to make sticky. Can be an HTMLElement instance or a CSS selector string.
   * @example
   * ```ts
   * targetEl: '#my-element' // CSS selector
   * targetEl: document.querySelector('#my-element') // HTMLElement
   * ```
   */
  readonly targetEl: ElementSelector<TTargetEl>;

  /**
   * The element that defines the boundaries for the sticky behavior.
   * Defaults to document.body if not provided.
   *
   * @defaultValue `document.body`
   * @example
   * ```ts
   * boundingEl: '.container' // CSS selector
   * boundingEl: document.querySelector('.container') // HTMLElement
   * boundingEl: null // Use document.body
   * ```
   */
  readonly boundingEl?: ElementSelector<TBoundingEl> | null;

  /**
   * Whether the sticky behavior is enabled.
   * @defaultValue `true`
   */
  readonly enabled?: boolean;

  /**
   * The offset from the top or bottom of the bounding element in pixels.
   * @defaultValue `0`
   * @example
   * ```ts
   * offset: 20 // 20px offset from the position
   * ```
   */
  readonly offset?: number;

  /**
   * The position where the element should stick.
   *
   * @defaultValue `"top"`
   * @example
   * ```ts
   * position: "top"    // Element sticks to the top
   * position: "bottom" // Element sticks to the bottom
   * ```
   */
  readonly position?: AdhesivePosition;

  /**
   * The z-index value for the sticky element when fixed.
   * @defaultValue `1`
   */
  readonly zIndex?: number;

  /**
   * Additional CSS class to add to the outer element.
   * @example
   * ```ts
   * outerClassName: "my-sticky-outer"
   * ```
   */
  readonly outerClassName?: string;

  /**
   * Additional CSS class to add to the inner element.
   * @example
   * ```ts
   * innerClassName: "my-sticky-inner"
   * ```
   */
  readonly innerClassName?: string;

  /**
   * CSS class to add when the element is in active (fixed) state.
   * @defaultValue `"adhesive--active"`
   */
  readonly activeClassName?: string;

  /**
   * CSS class to add when the element is in released (relative) state.
   * @defaultValue `"adhesive--released"`
   */
  readonly releasedClassName?: string;
}

// =============================================================================
// CONSTANTS & ENUMS
// =============================================================================

/**
 * Constants representing the different states of a sticky element.
 * Uses modern const assertion for better type inference and immutability.
 * @public
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
 * Union type representing the possible sticky status values.
 * Automatically derived from ADHESIVE_STATUS for type safety.
 * @public
 */
export type AdhesiveStatus =
  (typeof ADHESIVE_STATUS)[keyof typeof ADHESIVE_STATUS];

/**
 * Default configuration values with enhanced type safety
 * @internal
 */
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

// =============================================================================
// STATE INTERFACES
// =============================================================================

/**
 * Comprehensive read-only state interface representing the current state of a Adhesive instance.
 *
 * This interface provides complete access to all internal state properties without allowing
 * modification, ensuring immutability from the public API perspective.
 *
 * @example
 * ```ts
 * const adhesive = Adhesive.create({ targetEl: '#header' });
 * const state = adhesive.getState();
 *
 * // Type-safe access to all state properties
 * console.log(`Status: ${state.status}`);
 * console.log(`Is sticky: ${state.isSticky}`);
 * console.log(`Dimensions: ${state.width}x${state.height}`);
 * ```
 * @public
 */
export interface AdhesiveState {
  /** Current sticky status of the element */
  readonly status: AdhesiveStatus;
  /** Whether the element is currently in a sticky (fixed) state */
  readonly isSticky: boolean;
  /** Original CSS position value before sticky positioning was applied */
  readonly originalPosition: string;
  /** Original CSS top value before sticky positioning was applied */
  readonly originalTop: string;
  /** Original CSS z-index value before sticky positioning was applied */
  readonly originalZIndex: string;
  /** Original CSS transform value before sticky positioning was applied */
  readonly originalTransform: string;
  /** Current width of the element in pixels */
  readonly width: number;
  /** Current height of the element in pixels */
  readonly height: number;
  /** X-coordinate of the element relative to the bounding element */
  readonly x: number;
  /** Y-coordinate of the element relative to the bounding element */
  readonly y: number;
  /** Top boundary for sticky behavior (element's initial position) */
  readonly topBoundary: number;
  /** Bottom boundary for sticky behavior (end of bounding container) */
  readonly bottomBoundary: number;
  /** Current position offset applied to the element */
  readonly pos: number;
  /** Whether the sticky behavior has been activated via init() */
  readonly activated: boolean;
}

/**
 * Internal mutable state interface for implementation details.
 * Mirrors AdhesiveState but allows mutations for internal operations.
 * @internal
 */
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
 * Internal mutable options interface for implementation details.
 * Contains resolved and validated options with proper defaults applied.
 * @internal
 */
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

// =============================================================================
// ERROR HANDLING & VALIDATION
// =============================================================================

/**
 * Custom error class for Adhesive-specific errors with enhanced debugging capabilities
 * @public
 */
export class AdhesiveError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
  ) {
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

/**
 * Error codes and messages for better debugging and internationalization support
 * @internal
 */
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

/**
 * Creates a AdhesiveError with proper context
 * @internal
 */
function createAdhesiveError(
  errorKey: keyof typeof ERROR_REGISTRY,
  context?: Record<string, unknown>,
): AdhesiveError {
  const error = ERROR_REGISTRY[errorKey];
  return new AdhesiveError(error.message, error.code, context);
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Modern element resolution with enhanced error handling
 * @internal
 */
function resolveElement(element: HTMLElement | string): HTMLElement | null {
  if (typeof element === "string") {
    const resolved = document.querySelector(element);
    return resolved instanceof HTMLElement ? resolved : null;
  }
  return element;
}

/**
 * Gets the current scroll position with modern fallbacks and type safety
 * @internal
 */
function getScrollTop(): number {
  return (
    window.scrollY ??
    window.pageYOffset ??
    document.documentElement.scrollTop ??
    0
  );
}

/**
 * Gets the current viewport height with modern fallbacks and type safety
 * @internal
 */
function getViewportHeight(): number {
  return window.innerHeight ?? document.documentElement.clientHeight ?? 0;
}

/**
 * Type-safe element validation with enhanced error reporting
 * @internal
 */
function validateElement(
  element: HTMLElement | null,
  errorKey: keyof typeof ERROR_REGISTRY,
  context?: Record<string, unknown>,
): asserts element is HTMLElement {
  if (!element) {
    throw createAdhesiveError(errorKey, context);
  }
}

/**
 * Creates validated options with proper type safety
 * @internal
 */
function createValidatedOptions(
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

/**
 * Creates initial state for a Adhesive instance with enhanced type safety
 * @internal
 */
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
 * const adhesive = Adhesive.create({
 *   targetEl: '#header',
 *   offset: 20
 * });
 * ```
 *
 * @example
 * ```ts
 * // Advanced configuration with boundary container
 * const adhesive = Adhesive.create({
 *   targetEl: document.querySelector('.sidebar'),
 *   boundingEl: '.main-content',
 *   position: 'bottom',
 *   offset: 20,
 *   zIndex: 999,
 *   className: 'custom-sticky',
 *   activeClassName: 'is-stuck',
 * });
 * ```
 *
 * @example
 * ```ts
 * // SSR-safe initialization
 * const adhesive = typeof window !== 'undefined'
 *   ? Adhesive.create({
 *       targetEl: '#element'
 *     })
 *   : new Adhesive({
 *       targetEl: '#element',
 *       enabled: false
 *     });
 * ```
 *
 * @example
 * ```ts
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
 *
 * @public
 */
export class Adhesive {
  // Private fields with enhanced type safety
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

  /**
   * Static factory method for convenient instance creation and initialization
   *
   * @param options - Configuration options for the sticky behavior
   * @returns Initialized Adhesive instance ready for use
   *
   * @example
   * ```ts
   * // Convenient one-liner initialization
   * const adhesive = Adhesive.create({
   *   targetEl: '#header',
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
   * const adhesive = new Adhesive({
   *   targetEl: '#header',
   *   offset: 10
   * });
   * ```
   *
   * @example
   * ```ts
   * // Advanced usage with all options
   * const adhesive = new Adhesive({
   *   targetEl: document.querySelector('.sidebar'),
   *   boundingEl: '.main-content',
   *   position: 'bottom',
   *   offset: 20,
   *   zIndex: 999,
   *   className: 'custom-sticky',
   *   activeClassName: 'is-stuck',
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
      throw createAdhesiveError("TARGET_EL_REQUIRED");
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
    this.#options = createValidatedOptions(options);

    // Create DOM structure
    this.#createWrappers();

    // Initialize state
    this.#state = createInitialState(this.#innerWrapper);
    this.#state.bottomBoundary = this.#getBottomBoundary();

    // Initialize viewport dimensions
    this.#winHeight = getViewportHeight();
    this.#scrollTop = getScrollTop();
  }

  /** Initializes instance in disabled state */
  #initializeDisabledInstance(): void {
    this.#isEnabled = false;
    this.#targetEl = document.createElement("div");
    this.#boundingEl = document.createElement("div");
    this.#options = this.#createDisabledOptions();
    this.#state = createInitialState();
  }

  /** Creates frozen options object for disabled instances */
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

  /** Creates wrapper elements around the target element */
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

  /**
   * Applies hardware-accelerated CSS transform for smooth element movement
   * Uses translate3d to leverage GPU acceleration for optimal performance
   * @internal
   */
  #translate(style: CSSStyleDeclaration, pos: number): void {
    // Use translate3d for hardware acceleration and smooth animations
    const roundedPos = Math.round(pos * 100) / 100; // Round to 2 decimal places for precision
    style.transform = `translate3d(0, ${roundedPos}px, 0)`;
  }

  // =============================================================================
  // Calculation and Measurement Methods
  // =============================================================================

  /** Calculates the bottom boundary for sticky behavior */
  #getBottomBoundary(): number {
    if (!this.#boundingEl || this.#boundingEl === document.body) {
      return Number.POSITIVE_INFINITY;
    }
    const rect = this.#boundingEl.getBoundingClientRect();
    return getScrollTop() + rect.bottom;
  }

  /**
   * Updates element dimensions and boundaries with enhanced precision
   * Uses modern getBoundingClientRect for accurate measurements
   * @internal
   */
  #updateInitialDimensions(): void {
    if (!this.#outerWrapper || !this.#innerWrapper) return;

    // Use getBoundingClientRect for precise measurements
    const outerRect = this.#outerWrapper.getBoundingClientRect();
    const innerRect = this.#innerWrapper.getBoundingClientRect();

    // Calculate dimensions with fallbacks for browser compatibility
    const width = outerRect.width || outerRect.right - outerRect.left;
    const height = innerRect.height || innerRect.bottom - innerRect.top;
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

  // =============================================================================
  // State Management Methods
  // =============================================================================

  /**
   * Updates internal state with type safety and triggers optimized style updates
   * Only triggers style updates when status actually changes for better performance
   * @internal
   */
  #setState(newState: Partial<InternalAdhesiveState>): void {
    const prevStatus = this.#state.status;

    // Batch update all state changes
    Object.assign(this.#state, newState);

    // Only update styles if status actually changed (performance optimization)
    if (prevStatus !== this.#state.status) {
      this.#updateStyles();
    }
  }

  /** Sets element to initial (non-sticky) state */
  #reset(): void {
    this.#setState({
      status: ADHESIVE_STATUS.INITIAL,
      pos: 0,
      isSticky: false,
    });
  }

  /** Sets element to relative positioning with specified offset */
  #release(pos: number): void {
    this.#setState({
      status: ADHESIVE_STATUS.RELATIVE,
      pos,
      isSticky: false,
    });
  }

  /** Sets element to fixed positioning with specified offset */
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

  /** Updates element styles based on current state */
  #updateStyles(): void {
    if (!this.#innerWrapper || !this.#outerWrapper) return;

    const { innerWrapper, outerWrapper } = {
      innerWrapper: this.#innerWrapper,
      outerWrapper: this.#outerWrapper,
    };

    const isFixed = this.#state.status === ADHESIVE_STATUS.FIXED;
    const isNotInitial = this.#state.status !== ADHESIVE_STATUS.INITIAL;
    const { position } = this.#options;

    // Clear all positioning styles first
    innerWrapper.style.position = "";
    innerWrapper.style.top = "";
    innerWrapper.style.bottom = "";
    innerWrapper.style.transform = "";

    // Set common styles
    innerWrapper.style.zIndex = String(this.#options.zIndex);
    innerWrapper.style.width = isNotInitial ? `${this.#state.width}px` : "";
    outerWrapper.style.height = isNotInitial ? `${this.#state.height}px` : "";

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

  /** Updates CSS classes based on current state */
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

  /** Main update method that determines positioning based on scroll state */
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

  /** Updates positioning logic for top-stick behavior */
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

  /** Updates positioning logic for bottom-stick behavior */
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

  /** Handles positioning for elements taller than viewport (top positioning) */
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

  /** Handles positioning for elements taller than viewport (bottom positioning) */
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

  /** Determines if an element should be released from fixed positioning for bottom positioning */
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

  /** Determines if an element should be released from fixed positioning for top positioning */
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

  /**
   * Optimized scroll handler using RAF for smooth performance
   * @internal
   */
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

  /**
   * Optimized resize handler with RAF throttling
   * @internal
   */
  readonly #onResize = (): void => {
    if (!this.#isEnabled || this.#pendingUpdate) return;

    this.#pendingUpdate = true;
    this.#rafId = requestAnimationFrame(() => {
      this.#pendingUpdate = false;
      this.#winHeight = getViewportHeight();
      this.#updateInitialDimensions();
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
   * const adhesive = new Adhesive({ targetEl: '#header' });
   * adhesive.init(); // Activate sticky behavior
   *
   * // Or use the convenient factory method
   * const adhesive2 = Adhesive.create({ targetEl: '#header' });
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
    window.addEventListener("resize", this.#onResize, { passive: true });

    // Modern ResizeObserver for better performance
    if ("ResizeObserver" in window) {
      this.#observer = new ResizeObserver(this.#onResize);
      this.#observer.observe(this.#boundingEl);
      if (this.#outerWrapper) {
        this.#observer.observe(this.#outerWrapper);
      }
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
    // Cancel any pending RAF operations
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
    this.#pendingUpdate = false;

    // Remove event listeners
    window.removeEventListener("scroll", this.#onScroll);
    window.removeEventListener("resize", this.#onResize);

    // Disconnect observers
    this.#observer?.disconnect();
    this.#observer = null;

    // Reset state
    this.#reset();

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
