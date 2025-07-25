import { Adhesive, type AdhesiveOptions } from "@adhesivejs/core";
import { useEffect, useRef, type RefObject } from "react";

/**
 * Template ref objects for React elements used by the Adhesive hook.
 */
export interface UseAdhesiveTemplateRefs {
  /** React ref to the element that should become sticky */
  target: RefObject<HTMLDivElement | null | undefined>;
  /** Optional React ref to the element that defines sticky boundaries */
  bounding?: RefObject<HTMLDivElement | null | undefined> | null;
}

/**
 * Configuration options for the `useAdhesive` hook.
 * Excludes `targetEl` and `boundingEl` since they're provided via template refs.
 */
export type UseAdhesiveOptions = Partial<
  Omit<AdhesiveOptions, "targetEl" | "boundingEl">
>;

/**
 * React hook for adding sticky positioning behavior to DOM elements.
 *
 * This hook automatically manages the lifecycle of a Adhesive instance,
 * handling initialization, updates, and cleanup. It integrates seamlessly
 * with React's ref system and component lifecycle.
 *
 * @param templateRefs - Object containing React refs for target and optional bounding elements
 * @param options - Configuration options for sticky behavior (excluding element references)
 *
 * @example
 * ```tsx
 * import { useRef } from 'react';
 * import { useAdhesive } from '@adhesivejs/react';
 *
 * function Component() {
 *   const targetEl = useRef<HTMLDivElement>(null);
 *   const boundingEl = useRef<HTMLDivElement>(null);
 *
 *   useAdhesive(
 *     { target: targetEl, bounding: boundingEl },
 *     { position: 'top' }
 *   );
 *
 *   return (
 *     <div ref={boundingEl}>
 *       <div ref={targetEl}>Sticky content</div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdhesive(
  templateRefs: UseAdhesiveTemplateRefs,
  options?: UseAdhesiveOptions,
) {
  const adhesive = useRef<Adhesive | null>(null);

  useEffect(() => {
    const _targetEl = templateRefs.target.current;
    const _boundingEl = templateRefs.bounding?.current;

    if (!_targetEl) {
      throw new Error("@adhesivejs/react: sticky element is not defined");
    }

    const _options = {
      ...options,
      targetEl: _targetEl,
      boundingEl: _boundingEl,
    } satisfies AdhesiveOptions;

    if (adhesive.current) {
      adhesive.current.updateOptions(_options);
      return;
    }

    adhesive.current ??= Adhesive.create(_options);

    return () => {
      adhesive.current?.cleanup();
      adhesive.current = null;
    };
  }, [options]);
}
