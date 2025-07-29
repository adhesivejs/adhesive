type ElementSelector = HTMLElement | string;

export const ADHESIVE_POSITION = {
  TOP: "top",
  BOTTOM: "bottom",
} as const;

export type AdhesivePosition =
  (typeof ADHESIVE_POSITION)[keyof typeof ADHESIVE_POSITION];

export const ADHESIVE_STATUS = {
  INITIAL: "initial",
  FIXED: "fixed",
  RELATIVE: "relative",
} as const;

export type AdhesiveStatus =
  (typeof ADHESIVE_STATUS)[keyof typeof ADHESIVE_STATUS];

export interface AdhesiveOptions {
  readonly targetEl: ElementSelector;
  readonly boundingEl?: ElementSelector | null;
  readonly enabled?: boolean;
  readonly offset?: number;
  readonly position?: AdhesivePosition;
  readonly zIndex?: number;
  readonly outerClassName?: string;
  readonly innerClassName?: string;
  readonly activeClassName?: string;
  readonly releasedClassName?: string;
}

interface InternalAdhesiveOptions {
  enabled: boolean;
  offset: number;
  position: AdhesivePosition;
  zIndex: number;
  outerClassName: string;
  innerClassName: string;
  activeClassName: string;
  releasedClassName: string;
}

export interface AdhesiveState {
  readonly status: AdhesiveStatus;
  readonly activated: boolean;
  readonly position: number;
  readonly originalPosition: string;
  readonly originalTop: string;
  readonly originalZIndex: string;
  readonly originalTransform: string;
  readonly elementWidth: number;
  readonly elementHeight: number;
  readonly elementX: number;
  readonly elementY: number;
  readonly topBoundary: number;
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
  offset: 0 as number,
  position: ADHESIVE_POSITION.TOP as AdhesivePosition,
  zIndex: 1 as number,
  outerClassName: "adhesive__outer",
  innerClassName: "adhesive__inner",
  activeClassName: "adhesive--active",
  releasedClassName: "adhesive--released",
} satisfies Omit<AdhesiveOptions, "targetEl" | "boundingEl">;

const isBrowser = () =>
  typeof window !== "undefined" && typeof document !== "undefined";

const resolveElement = (element: ElementSelector): HTMLElement | null => {
  if (!isBrowser()) return null;
  return typeof element === "string"
    ? document.querySelector(element)
    : element;
};

const getScrollTop = () =>
  isBrowser()
    ? (window.scrollY ?? document.documentElement?.scrollTop ?? 0)
    : 0;

const getViewportHeight = () =>
  isBrowser()
    ? (window.innerHeight ?? document.documentElement?.clientHeight ?? 0)
    : 0;

/**
 * Adhesive - A lightweight sticky positioning solution
 */
export class Adhesive {
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
    activeClassName: DEFAULT_OPTIONS.activeClassName,
    releasedClassName: DEFAULT_OPTIONS.releasedClassName,
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

    if (!isBrowser()) {
      this.#targetEl = this.#boundingEl = Object.create(null);
      return;
    }

    const targetEl = resolveElement(options.targetEl);
    const boundingEl = options.boundingEl
      ? resolveElement(options.boundingEl)
      : document.body;

    if (!targetEl) {
      throw new AdhesiveError("TARGET_EL_NOT_FOUND", "targetEl not found");
    }
    if (!boundingEl) {
      throw new AdhesiveError("BOUNDING_EL_NOT_FOUND", "boundingEl not found");
    }

    this.#targetEl = targetEl;
    this.#boundingEl = boundingEl;
    this.#options.enabled = options.enabled ?? DEFAULT_OPTIONS.enabled;
    this.#options.offset = options.offset ?? DEFAULT_OPTIONS.offset;
    this.#options.position = options.position ?? DEFAULT_OPTIONS.position;
    this.#options.zIndex = options.zIndex ?? DEFAULT_OPTIONS.zIndex;
    this.#options.outerClassName =
      options.outerClassName ?? DEFAULT_OPTIONS.outerClassName;
    this.#options.innerClassName =
      options.innerClassName ?? DEFAULT_OPTIONS.innerClassName;
    this.#options.activeClassName =
      options.activeClassName ?? DEFAULT_OPTIONS.activeClassName;
    this.#options.releasedClassName =
      options.releasedClassName ?? DEFAULT_OPTIONS.releasedClassName;

    if (this.#options.enabled) {
      this.#createWrappers();
      this.#initializeState();
    }
  }

  init(): this {
    if (!isBrowser() || !this.#options.enabled) return this;

    this.#state.activated = true;
    this.#setupListeners();
    this.#update();
    return this;
  }

  enable(): this {
    this.#options.enabled = true;
    if (isBrowser()) {
      if (!this.#outerWrapper && !this.#innerWrapper) {
        // Re-resolve elements if transitioning from SSR to browser
        if (!this.#targetEl.parentNode) {
          const targetEl = resolveElement(this.#targetElSelector);
          const boundingEl = this.#boundingElSelector
            ? resolveElement(this.#boundingElSelector)
            : document.body;

          if (!targetEl) {
            throw new AdhesiveError(
              "TARGET_EL_NOT_FOUND",
              "targetEl not found",
            );
          }
          if (!boundingEl) {
            throw new AdhesiveError(
              "BOUNDING_EL_NOT_FOUND",
              "boundingEl not found",
            );
          }

          this.#targetEl = targetEl;
          this.#boundingEl = boundingEl;
        }

        this.#createWrappers();
        this.#initializeState();
      }
      this.init();
    }
    return this;
  }

  disable(): this {
    this.#options.enabled = false;
    this.#state.activated = false;
    this.#cancelRAF();
    this.#setInitial();
    return this;
  }

  updateOptions(
    newOptions: Partial<Omit<AdhesiveOptions, "targetEl" | "boundingEl">>,
  ): this {
    if (newOptions.enabled === false) return this.disable();
    if (newOptions.enabled === true) this.enable();

    if (newOptions.offset !== undefined)
      this.#options.offset = newOptions.offset;
    if (newOptions.position) this.#options.position = newOptions.position;
    if (newOptions.zIndex !== undefined)
      this.#options.zIndex = newOptions.zIndex;
    if (newOptions.outerClassName)
      this.#options.outerClassName = newOptions.outerClassName;
    if (newOptions.innerClassName)
      this.#options.innerClassName = newOptions.innerClassName;
    if (newOptions.activeClassName)
      this.#options.activeClassName = newOptions.activeClassName;
    if (newOptions.releasedClassName)
      this.#options.releasedClassName = newOptions.releasedClassName;

    this.#update();
    return this;
  }

  getState(): AdhesiveState {
    return { ...this.#state };
  }

  refresh(): this {
    if (this.#options.enabled) this.#update();
    return this;
  }

  cleanup(): void {
    if (!isBrowser()) return;

    this.#cancelRAF();
    window.removeEventListener("scroll", this.#onScroll);
    window.removeEventListener("resize", this.#onResize);
    this.#observer?.disconnect();
    this.#observer = null;
    this.#trackedElements.clear();
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
    this.#outerWrapper.className = this.#options.outerClassName;

    this.#innerWrapper = document.createElement("div");
    this.#innerWrapper.className = this.#options.innerClassName;

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
    this.#updateBoundaries();
  }

  #setupListeners(): void {
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

    this.#updateDimensions();

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

  #updateDimensions(): void {
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
    this.#updateBoundaries();
  }

  #updateBoundaries(): void {
    this.#state.topBoundary = this.#getTopBoundary();
    this.#state.bottomBoundary = this.#getBottomBoundary();
  }

  #getTopBoundary(): number {
    if (!isBrowser() || this.#boundingEl === document.body) return 0;
    const rect = this.#boundingEl.getBoundingClientRect();
    return getScrollTop() + rect.top;
  }

  #getBottomBoundary(): number {
    if (!isBrowser() || this.#boundingEl === document.body) {
      return Number.POSITIVE_INFINITY;
    }
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

    if (!this.#innerWrapper || !this.#outerWrapper) return;

    const innerStyle = this.#innerWrapper.style;
    innerStyle.position = this.#state.originalPosition;
    innerStyle.top = this.#state.originalTop;
    innerStyle.zIndex = this.#state.originalZIndex;
    innerStyle.transform = this.#state.originalTransform;
    innerStyle.width = "";

    const outerStyle = this.#outerWrapper.style;
    outerStyle.height = "";
    this.#outerWrapper.classList.remove(
      this.#options.activeClassName,
      this.#options.releasedClassName,
    );

    this.#setState({
      status: ADHESIVE_STATUS.INITIAL,
      position: 0,
    });
  }

  #setFixed(): void {
    const wasAlreadyFixed = this.#state.status === ADHESIVE_STATUS.FIXED;

    if (!this.#innerWrapper || !this.#outerWrapper) return;

    const innerStyle = this.#innerWrapper.style;
    innerStyle.position = "fixed";
    innerStyle.transform = "";
    innerStyle.zIndex = String(this.#options.zIndex);
    innerStyle.width = `${this.#state.elementWidth}px`;

    if (this.#options.position === ADHESIVE_POSITION.TOP) {
      innerStyle.top = `${this.#options.offset}px`;
      innerStyle.bottom = "";
    } else {
      innerStyle.bottom = `${this.#options.offset}px`;
      innerStyle.top = "";
    }

    const outerStyle = this.#outerWrapper.style;
    outerStyle.height = `${this.#state.elementHeight}px`;
    this.#outerWrapper.classList.add(this.#options.activeClassName);

    if (!wasAlreadyFixed) {
      this.#setState({
        status: ADHESIVE_STATUS.FIXED,
        position: this.#options.offset,
      });
    }
  }

  #setRelative(position: number): void {
    if (
      this.#state.status === ADHESIVE_STATUS.RELATIVE &&
      this.#state.position === position
    )
      return;

    if (!this.#innerWrapper || !this.#outerWrapper) return;

    const innerStyle = this.#innerWrapper.style;
    innerStyle.position = "relative";
    innerStyle.transform = `translate3d(0, ${position}px, 0)`;
    innerStyle.top = "";
    innerStyle.bottom = "";
    innerStyle.width = "";

    const outerStyle = this.#outerWrapper.style;
    outerStyle.height = "";
    this.#outerWrapper.classList.remove(this.#options.activeClassName);
    this.#outerWrapper.classList.add(this.#options.releasedClassName);

    this.#setState({
      status: ADHESIVE_STATUS.RELATIVE,
      position,
    });
  }

  #setState(newState: Partial<InternalAdhesiveState>): void {
    Object.assign(this.#state, newState);
  }
}
