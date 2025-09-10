/**
 * Sticky positioning options.
 */
export const ADHESIVE_POSITION = {
  /** Stick to the top of the viewport. */
  TOP: "top",
  /** Stick to the bottom of the viewport. */
  BOTTOM: "bottom",
} as const;

/**
 * Type representing the available sticky positioning options.
 */
export type AdhesivePosition =
  (typeof ADHESIVE_POSITION)[keyof typeof ADHESIVE_POSITION];

/**
 * Element status states.
 */
export const ADHESIVE_STATUS = {
  /** Element is in its normal position. */
  INITIAL: "initial",
  /** Element is sticky and positioned fixed. */
  FIXED: "fixed",
  /** Element is positioned relative at boundary. */
  RELATIVE: "relative",
} as const;

/**
 * Type representing the available element status states.
 */
export type AdhesiveStatus =
  (typeof ADHESIVE_STATUS)[keyof typeof ADHESIVE_STATUS];

type ElementSelector = HTMLElement | string;

/**
 * Configuration options for Adhesive instances.
 */
export interface AdhesiveOptions {
  /** The element to make sticky. */
  readonly targetEl: ElementSelector;
  /** The container element that constrains sticky positioning. */
  readonly boundingEl?: ElementSelector | null;
  /**
   * Whether sticky positioning is enabled.
   * @default true
   */
  readonly enabled?: boolean;
  /**
   * Distance from the viewport edge when sticking.
   * @default 0
   */
  readonly offset?: number;
  /**
   * Whether to stick to the top or bottom of the viewport.
   * @default "top"
   */
  readonly position?: AdhesivePosition;
  /**
   * CSS z-index for the sticky element.
   * @default "var(--adhesive-z-index, 1)"
   */
  readonly zIndex?: number | string;
  /**
   * CSS class for the outer wrapper element.
   * @default "adhesive__outer"
   */
  readonly outerClassName?: string;
  /**
   * CSS class for the inner wrapper element.
   * @default "adhesive__inner"
   */
  readonly innerClassName?: string;
  /**
   * CSS class applied when the element is in its initial state.
   * @default "adhesive--initial"
   */
  readonly initialClassName?: string;
  /**
   * CSS class applied when the element is sticky.
   * @default "adhesive--fixed"
   */
  readonly fixedClassName?: string;
  /**
   * CSS class applied when the element reaches its boundary.
   * @default "adhesive--relative"
   */
  readonly relativeClassName?: string;
}

interface InternalAdhesiveOptions {
  enabled: boolean;
  offset: number;
  position: AdhesivePosition;
  zIndex: number | string;
  outerClassName: string;
  innerClassName: string;
  initialClassName: string;
  fixedClassName: string;
  relativeClassName: string;
}

/**
 * Current state information for an Adhesive instance.
 */
export interface AdhesiveState {
  /** Current positioning status. */
  readonly status: AdhesiveStatus;
  /** Whether the instance is actively tracking scroll. */
  readonly activated: boolean;
  /** Current position offset in pixels. */
  readonly position: number;
  /** Original CSS position value. */
  readonly originalPosition: string;
  /** Original CSS top value. */
  readonly originalTop: string;
  /** Original CSS z-index value. */
  readonly originalZIndex: string;
  /** Original CSS transform value. */
  readonly originalTransform: string;
  /** Current element width in pixels. */
  readonly elementWidth: number;
  /** Current element height in pixels. */
  readonly elementHeight: number;
  /** Current element X position. */
  readonly elementX: number;
  /** Current element Y position. */
  readonly elementY: number;
  /** Top boundary position for sticky behavior. */
  readonly topBoundary: number;
  /** Bottom boundary position for sticky behavior. */
  readonly bottomBoundary: number;
}

interface InternalAdhesiveState {
  status: AdhesiveStatus;
  activated: boolean;
  position: number;
  originalPosition: string;
  originalTop: string;
  originalZIndex: string;
  originalTransform: string;
  elementWidth: number;
  elementHeight: number;
  elementX: number;
  elementY: number;
  topBoundary: number;
  bottomBoundary: number;
}

/**
 * Error thrown by Adhesive operations.
 */
export class AdhesiveError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(`@adhesivejs/core: ${message}`);
    this.name = "AdhesiveError";
    this.code = code;
  }
}

const DEFAULT_OPTIONS = {
  enabled: true as boolean,
  offset: 0,
  position: ADHESIVE_POSITION.TOP as AdhesivePosition,
  zIndex: "var(--adhesive-z-index, 1)",
  outerClassName: "adhesive__outer",
  innerClassName: "adhesive__inner",
  initialClassName: "adhesive--initial",
  fixedClassName: "adhesive--fixed",
  relativeClassName: "adhesive--relative",
} satisfies Omit<AdhesiveOptions, "targetEl" | "boundingEl">;

const isBrowser = () =>
  typeof window !== "undefined" && typeof document !== "undefined";

const resolveElement = (selector: ElementSelector): HTMLElement | null => {
  if (!isBrowser()) return null;
  return typeof selector === "string"
    ? document.querySelector(selector)
    : selector;
};

const assertTargetElement = (
  selector: AdhesiveOptions["targetEl"],
): HTMLElement => {
  if (!isBrowser()) return Object.create(null);

  const element = resolveElement(selector);

  if (!element) {
    throw new AdhesiveError("TARGET_EL_NOT_FOUND", "targetEl not found");
  }

  return element;
};

const assertBoundingElement = (
  selector: AdhesiveOptions["boundingEl"] | undefined,
): HTMLElement => {
  if (!isBrowser()) return Object.create(null);

  const element = selector ? resolveElement(selector) : document.body;

  if (!element) {
    throw new AdhesiveError("BOUNDING_EL_NOT_FOUND", "boundingEl not found");
  }

  return element;
};

const getScrollTop = () =>
  isBrowser()
    ? (window.scrollY ?? document.documentElement?.scrollTop ?? 0)
    : 0;

const getViewportHeight = () =>
  isBrowser()
    ? (window.innerHeight ?? document.documentElement?.clientHeight ?? 0)
    : 0;

const overwriteClassNames = (element: HTMLElement, classNames: string[]) => {
  element.className = "";
  const tokens = classNames
    .join(" ")
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => !!token);
  for (const token of tokens) {
    element.classList.add(token);
  }
};

const expectNever = (value: never): never => {
  throw new TypeError(`Unexpected value: ${value}`);
};

/**
 * Adhesive - A modern, performant, lightweight, dependency free, cross platform solution for flexible sticky positioned elements
 *
 * https://github.com/adhesivejs/adhesive/tree/main/packages/core#readme
 *
 * Provides advanced sticky positioning for DOM elements with configurable boundaries,
 * offsets, and positioning modes. Built for performance with passive event listeners,
 * ResizeObserver, and efficient DOM operations.
 *
 * - **🚀 Modern** - Built with TypeScript, distributed as ESM only
 * - **📦 Lightweight** - Zero dependencies, minimal bundle size
 * - **🔧 Flexible** - Supports top/bottom positioning with customizable offsets and boundaries
 * - **⚡️ Performant** - Optimized for smooth scrolling with efficient DOM updates
 * - **🎯 Type Safe** - Full TypeScript support with comprehensive type definitions
 * - **🌍 Cross Platform** - Works across all modern browsers and devices
 * - **🎨 Framework Ready** - Core library with framework specific adapters
 * - **🖥️ SSR Friendly** - Handles server-side rendering environments gracefully
 *
 * @example Basic usage
 * ```ts
 * Adhesive.create({ targetEl: '#target-element' });
 * ```
 *
 * Styling hook: the outer wrapper gets `data-adhesive-status` with values
 * `initial` | `fixed` | `relative` to enable attribute-based styling.
 *
 * @example Advanced configuration
 * ```ts
 * Adhesive.create({
 *   targetEl: document.querySelector('.sidebar'),
 *   boundingEl: '.main-content',
 *   position: 'bottom',
 *   offset: 20,
 *   zIndex: 999
 * });
 * ```
 */
export class Adhesive {
  /**
   * Create a new Adhesive instance.
   */
  static create(options: AdhesiveOptions): Adhesive {
    return new Adhesive(options).init();
  }

  #targetEl: HTMLElement;
  #boundingEl: HTMLElement;
  #targetElSelector: ElementSelector;
  #boundingElSelector: ElementSelector | null;

  #outerWrapper: HTMLElement | null = null;
  #innerWrapper: HTMLElement | null = null;

  #options: InternalAdhesiveOptions = {
    enabled: DEFAULT_OPTIONS.enabled,
    offset: DEFAULT_OPTIONS.offset,
    position: DEFAULT_OPTIONS.position,
    zIndex: DEFAULT_OPTIONS.zIndex,
    outerClassName: DEFAULT_OPTIONS.outerClassName,
    innerClassName: DEFAULT_OPTIONS.innerClassName,
    initialClassName: DEFAULT_OPTIONS.initialClassName,
    fixedClassName: DEFAULT_OPTIONS.fixedClassName,
    relativeClassName: DEFAULT_OPTIONS.relativeClassName,
  };

  #state: InternalAdhesiveState = {
    status: ADHESIVE_STATUS.INITIAL,
    activated: false,
    position: 0,
    originalPosition: "",
    originalTop: "",
    originalZIndex: "",
    originalTransform: "",
    elementWidth: 0,
    elementHeight: 0,
    elementX: 0,
    elementY: 0,
    topBoundary: 0,
    bottomBoundary: Number.POSITIVE_INFINITY,
  };

  #observer: ResizeObserver | null = null;
  #trackedElements = new Set<Element>();
  #rafId: number | null = null;

  constructor(options: AdhesiveOptions) {
    if (!options.targetEl) {
      throw new AdhesiveError("TARGET_EL_REQUIRED", "targetEl is required");
    }

    this.#targetElSelector = options.targetEl;
    this.#boundingElSelector = options.boundingEl ?? null;
    this.#targetEl = assertTargetElement(this.#targetElSelector);
    this.#boundingEl = assertBoundingElement(this.#boundingElSelector);

    if (!isBrowser()) return;

    this.#options.enabled = options.enabled ?? DEFAULT_OPTIONS.enabled;
    this.#options.offset = options.offset ?? DEFAULT_OPTIONS.offset;
    this.#options.position = options.position ?? DEFAULT_OPTIONS.position;
    this.#options.zIndex = options.zIndex ?? DEFAULT_OPTIONS.zIndex;
    this.#options.outerClassName =
      options.outerClassName ?? DEFAULT_OPTIONS.outerClassName;
    this.#options.innerClassName =
      options.innerClassName ?? DEFAULT_OPTIONS.innerClassName;
    this.#options.initialClassName =
      options.initialClassName ?? DEFAULT_OPTIONS.initialClassName;
    this.#options.fixedClassName =
      options.fixedClassName ?? DEFAULT_OPTIONS.fixedClassName;
    this.#options.relativeClassName =
      options.relativeClassName ?? DEFAULT_OPTIONS.relativeClassName;

    if (this.#options.enabled) {
      this.#createWrappers();
      this.#initializeState();
    }
  }

  /**
   * Initialize the Adhesive instance.
   */
  init(): this {
    if (!isBrowser() || !this.#options.enabled) return this;

    this.#state.activated = true;
    this.#setupListeners();
    this.#update();
    return this;
  }

  /**
   * Enable sticky positioning.
   */
  enable(): this {
    this.#options.enabled = true;
    if (isBrowser()) {
      if (!this.#outerWrapper && !this.#innerWrapper) {
        // Re-resolve elements if transitioning from SSR to browser
        if (!this.#targetEl.parentNode) {
          this.#targetEl = assertTargetElement(this.#targetElSelector);
          this.#boundingEl = assertBoundingElement(this.#boundingElSelector);
        }

        this.#createWrappers();
        this.#initializeState();
      }
      this.init();
    }
    return this;
  }

  /**
   * Disable sticky positioning.
   */
  disable(): this {
    this.#options.enabled = false;
    this.#state.activated = false;
    this.#cancelRAF();
    this.#setInitial();
    return this;
  }

  /**
   * Update configuration options (partial update).
   */
  updateOptions(newOptions: Partial<Omit<AdhesiveOptions, "targetEl">>): this {
    if (newOptions.enabled === false) return this.disable();
    if (newOptions.enabled === true) this.enable();

    const currentBoundingEl = this.#boundingEl;

    if (newOptions.boundingEl !== undefined)
      this.#boundingEl = assertBoundingElement(newOptions.boundingEl);
    if (newOptions.offset !== undefined)
      this.#options.offset = newOptions.offset;
    if (newOptions.position) this.#options.position = newOptions.position;
    if (newOptions.zIndex !== undefined)
      this.#options.zIndex = newOptions.zIndex;
    if (newOptions.outerClassName !== undefined)
      this.#options.outerClassName = newOptions.outerClassName;
    if (newOptions.innerClassName !== undefined)
      this.#options.innerClassName = newOptions.innerClassName;
    if (newOptions.initialClassName !== undefined)
      this.#options.initialClassName = newOptions.initialClassName;
    if (newOptions.fixedClassName !== undefined)
      this.#options.fixedClassName = newOptions.fixedClassName;
    if (newOptions.relativeClassName !== undefined)
      this.#options.relativeClassName = newOptions.relativeClassName;

    if (currentBoundingEl !== this.#boundingEl) this.#refreshListeners();

    this.#update();
    this.#rerender();
    return this;
  }

  /**
   * Replace configuration options (full update).
   */
  replaceOptions(newOptions: Omit<AdhesiveOptions, "targetEl">): this {
    if (newOptions.enabled === false) return this.disable();
    if (newOptions.enabled === true) this.enable();

    const currentBoundingEl = this.#boundingEl;

    this.#boundingEl = assertBoundingElement(newOptions.boundingEl);
    this.#options.offset = newOptions.offset ?? DEFAULT_OPTIONS.offset;
    this.#options.position = newOptions.position ?? DEFAULT_OPTIONS.position;
    this.#options.zIndex = newOptions.zIndex ?? DEFAULT_OPTIONS.zIndex;
    this.#options.outerClassName =
      newOptions.outerClassName ?? DEFAULT_OPTIONS.outerClassName;
    this.#options.innerClassName =
      newOptions.innerClassName ?? DEFAULT_OPTIONS.innerClassName;
    this.#options.initialClassName =
      newOptions.initialClassName ?? DEFAULT_OPTIONS.initialClassName;
    this.#options.fixedClassName =
      newOptions.fixedClassName ?? DEFAULT_OPTIONS.fixedClassName;
    this.#options.relativeClassName =
      newOptions.relativeClassName ?? DEFAULT_OPTIONS.relativeClassName;

    if (currentBoundingEl !== this.#boundingEl) this.#refreshListeners();

    this.#update();
    this.#rerender();
    return this;
  }

  /**
   * Get current state.
   */
  getState(): AdhesiveState {
    return { ...this.#state };
  }

  /**
   * Refresh positioning calculations.
   */
  refresh(): this {
    if (this.#options.enabled) this.#update();
    return this;
  }

  /**
   * Clean up resources like event listeners and remove sticky positioning.
   */
  cleanup(): void {
    if (!isBrowser()) return;

    this.#cancelRAF();
    this.#cleanupListeners();
    this.#setInitial();
    this.#state.activated = false;

    if (this.#outerWrapper?.parentNode) {
      const parent = this.#outerWrapper.parentNode;
      parent.insertBefore(this.#targetEl, this.#outerWrapper);
      this.#outerWrapper.remove();
    }

    this.#outerWrapper = null;
    this.#innerWrapper = null;
  }

  #createWrappers(): void {
    if (!this.#targetEl.parentNode) {
      throw new AdhesiveError(
        "WRAPPER_CREATION_FAILED",
        "targetEl must have a parent node for wrapper creation",
      );
    }

    this.#outerWrapper = document.createElement("div");
    this.#innerWrapper = document.createElement("div");
    this.#renderInitialClassNames();

    const parent = this.#targetEl.parentNode;
    parent.insertBefore(this.#outerWrapper, this.#targetEl);
    this.#outerWrapper.append(this.#innerWrapper);
    this.#innerWrapper.append(this.#targetEl);
  }

  #initializeState(): void {
    const style = this.#innerWrapper?.style || this.#targetEl.style;
    this.#state.originalPosition = style.position;
    this.#state.originalTop = style.top;
    this.#state.originalZIndex = style.zIndex;
    this.#state.originalTransform = style.transform;
    this.#updateBoundaryState();
  }

  #setupListeners(): void {
    if (!isBrowser()) return;

    window.addEventListener("scroll", this.#onScroll, { passive: true });
    window.addEventListener("resize", this.#onResize, { passive: true });

    if ("ResizeObserver" in window) {
      this.#observer = new ResizeObserver(this.#onElementResize);
      this.#observer.observe(this.#targetEl);
      this.#observer.observe(this.#boundingEl);
      if (this.#outerWrapper) this.#observer.observe(this.#outerWrapper);

      this.#trackedElements.add(this.#targetEl);
      this.#trackedElements.add(this.#boundingEl);
      if (this.#outerWrapper) this.#trackedElements.add(this.#outerWrapper);
    } else {
      console.warn(
        "ResizeObserver is not supported in this browser. Dynamic resizing may not work properly.",
      );
    }
  }

  #cleanupListeners(): void {
    if (!isBrowser()) return;

    window.removeEventListener("scroll", this.#onScroll);
    window.removeEventListener("resize", this.#onResize);
    this.#observer?.disconnect();
    this.#observer = null;
    this.#trackedElements.clear();
  }

  #refreshListeners(): void {
    if (!isBrowser()) return;

    this.#cleanupListeners();
    this.#setupListeners();
  }

  #onScroll = (): void => {
    this.#scheduleUpdate();
  };

  #onResize = (): void => {
    this.#scheduleUpdate();
  };

  #onElementResize = (entries: ResizeObserverEntry[]): void => {
    const trackedEntries = entries.filter((entry) =>
      this.#trackedElements.has(entry.target),
    );

    if (trackedEntries.length > 0) {
      this.#scheduleUpdate();
    }
  };

  #scheduleUpdate(): void {
    if (!this.#options.enabled) return;
    this.#cancelRAF();
    this.#rafId = requestAnimationFrame(() => this.#update());
  }

  #cancelRAF(): void {
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
  }

  #update(): void {
    if (!this.#options.enabled) return;

    this.#updateDimensionState();

    const { bottomBoundary, topBoundary, elementWidth, elementHeight } =
      this.#state;
    const isDisabled =
      bottomBoundary - topBoundary <= elementHeight ||
      (elementWidth === 0 && elementHeight === 0);

    if (isDisabled) {
      if (this.#state.status !== ADHESIVE_STATUS.INITIAL) {
        this.#setInitial();
      }
      return;
    }

    if (this.#options.position === ADHESIVE_POSITION.TOP) {
      this.#updateForTop();
    } else {
      this.#updateForBottom();
    }
  }

  #updateDimensionState(): void {
    if (!this.#outerWrapper || !this.#innerWrapper) return;

    const outerRect = this.#outerWrapper.getBoundingClientRect();
    const innerRect = this.#innerWrapper.getBoundingClientRect();
    const scrollTop = getScrollTop();

    this.#state.elementWidth =
      outerRect.width || this.#outerWrapper.offsetWidth;
    this.#state.elementHeight =
      innerRect.height || this.#innerWrapper.offsetHeight;
    this.#state.elementX = outerRect.left;
    this.#state.elementY = outerRect.top + scrollTop;
    this.#updateBoundaryState();
  }

  #updateBoundaryState(): void {
    this.#state.topBoundary = this.#getTopBoundary();
    this.#state.bottomBoundary = this.#getBottomBoundary();
  }

  #getTopBoundary(): number {
    if (this.#boundingEl === document.body) return 0;

    const rect = this.#boundingEl.getBoundingClientRect();
    return getScrollTop() + rect.top;
  }

  #getBottomBoundary(): number {
    if (this.#boundingEl === document.body) return Number.POSITIVE_INFINITY;

    const rect = this.#boundingEl.getBoundingClientRect();
    return getScrollTop() + rect.bottom;
  }

  #updateForTop(): void {
    const { bottomBoundary, elementHeight, elementY } = this.#state;
    const scrollTop = getScrollTop();
    const stickyTop = scrollTop + this.#options.offset;
    const elementTop = elementY;

    // Check if element should stop at boundary
    if (stickyTop + elementHeight >= bottomBoundary) {
      const relativePos = bottomBoundary - elementHeight - elementTop;
      this.#setRelative(relativePos);
      return;
    }

    // Check if element should stick
    if (stickyTop >= elementTop) {
      this.#setFixed();
      return;
    }

    this.#setInitial();
  }

  #updateForBottom(): void {
    const { bottomBoundary, elementHeight, elementY } = this.#state;
    const scrollTop = getScrollTop();
    const viewportHeight = getViewportHeight();
    const stickyBottom = scrollTop + viewportHeight - this.#options.offset;
    const elementBottom = elementY + elementHeight;

    // Check if element should stop at boundary
    if (stickyBottom >= bottomBoundary) {
      const relativePos = bottomBoundary - elementHeight - elementY;
      this.#setRelative(relativePos);
      return;
    }

    // Check if element should stick
    if (stickyBottom >= elementBottom) {
      this.#setFixed();
      return;
    }

    this.#setInitial();
  }

  #setInitial(): void {
    if (this.#state.status === ADHESIVE_STATUS.INITIAL) return;

    this.#setState({
      status: ADHESIVE_STATUS.INITIAL,
      position: 0,
    });

    this.#renderInitialStyles();
    this.#renderInitialClassNames();
  }

  #renderInitialStyles(): void {
    if (!this.#outerWrapper || !this.#innerWrapper) return;

    const outerStyle = this.#outerWrapper.style;
    outerStyle.height = "";

    const innerStyle = this.#innerWrapper.style;
    innerStyle.position = this.#state.originalPosition;
    innerStyle.top = this.#state.originalTop;
    innerStyle.zIndex = this.#state.originalZIndex;
    innerStyle.transform = this.#state.originalTransform;
    innerStyle.width = "";
  }

  #renderInitialClassNames(): void {
    this.#renderClassNames(this.#options.initialClassName);
  }

  #setFixed(): void {
    this.#renderFixedStyles();

    if (this.#state.status === ADHESIVE_STATUS.FIXED) return;

    this.#setState({
      status: ADHESIVE_STATUS.FIXED,
      position: this.#options.offset,
    });

    this.#renderFixedClassNames();
  }

  #renderFixedStyles(): void {
    if (!this.#outerWrapper || !this.#innerWrapper) return;

    const outerStyle = this.#outerWrapper.style;
    outerStyle.height = `${this.#state.elementHeight}px`;

    const innerStyle = this.#innerWrapper.style;
    innerStyle.position = "fixed";
    innerStyle.zIndex = String(this.#options.zIndex);
    innerStyle.transform = "";
    innerStyle.width = `${this.#state.elementWidth}px`;

    if (this.#options.position === ADHESIVE_POSITION.TOP) {
      innerStyle.top = `${this.#options.offset}px`;
      innerStyle.bottom = "";
    } else {
      innerStyle.bottom = `${this.#options.offset}px`;
      innerStyle.top = "";
    }
  }

  #renderFixedClassNames(): void {
    this.#renderClassNames(this.#options.fixedClassName);
  }

  #setRelative(position: number): void {
    if (this.#state.status === ADHESIVE_STATUS.RELATIVE) return;

    this.#setState({
      status: ADHESIVE_STATUS.RELATIVE,
      position,
    });

    this.#renderRelativeStyles();
    this.#renderRelativeClassNames();
  }

  #renderRelativeStyles(): void {
    if (!this.#outerWrapper || !this.#innerWrapper) return;

    const outerStyle = this.#outerWrapper.style;
    outerStyle.height = "";

    const innerStyle = this.#innerWrapper.style;
    innerStyle.position = "relative";
    innerStyle.zIndex = String(this.#options.zIndex);
    innerStyle.transform = `translate3d(0, ${this.#state.position}px, 0)`;
    innerStyle.top = "";
    innerStyle.bottom = "";
    innerStyle.width = "";
  }

  #renderRelativeClassNames(): void {
    this.#renderClassNames(this.#options.relativeClassName);
  }

  #renderClassNames(statusClassName: string): void {
    if (!this.#outerWrapper || !this.#innerWrapper) return;

    const { outerClassName, innerClassName } = this.#options;
    const outerClasses = [outerClassName, statusClassName];
    const innerClasses = [innerClassName];

    overwriteClassNames(this.#outerWrapper, outerClasses);
    overwriteClassNames(this.#innerWrapper, innerClasses);
    this.#outerWrapper.dataset.adhesiveStatus = this.#state.status;
  }

  #rerender(): void {
    const { status } = this.#state;

    switch (status) {
      case ADHESIVE_STATUS.INITIAL:
        this.#renderInitialStyles();
        this.#renderInitialClassNames();
        break;
      case ADHESIVE_STATUS.FIXED:
        this.#renderFixedStyles();
        this.#renderFixedClassNames();
        break;
      case ADHESIVE_STATUS.RELATIVE:
        this.#renderRelativeStyles();
        this.#renderRelativeClassNames();
        break;
      default:
        expectNever(status);
    }
  }

  #setState(newState: Partial<InternalAdhesiveState>): void {
    Object.assign(this.#state, newState);
  }
}
