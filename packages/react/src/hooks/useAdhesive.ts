import { Adhesive, type AdhesiveOptions } from "@adhesivejs/core";
import { useEffect, useRef, type RefObject } from "react";
import {
  unwrapElement,
  type MaybeRefObjectOrElementOrSelector,
} from "../utils/unwrapElement.js";

/**
 * Configuration options for the useAdhesive hook.
 *
 * Extends the core AdhesiveOptions but omits targetEl since it's provided via the hook parameter.
 * Adds React-specific boundingRef option for convenient ref-based boundary selection.
 */
export type UseAdhesiveOptions = Partial<Omit<AdhesiveOptions, "targetEl">> & {
  /** React ref for the element that defines sticky boundaries */
  boundingRef?: RefObject<HTMLElement | null>;
};

/**
 * React hook for adding sticky positioning behavior to DOM elements.
 *
 * This hook automatically manages the lifecycle of a Adhesive instance,
 * handling initialization, updates, and cleanup. It integrates seamlessly
 * with React's ref system and component lifecycle.
 *
 * @param target - React ref for the element that should become sticky
 * @param options - Configuration options for sticky behavior
 *
 * @example
 * ```tsx
 * import { useRef } from 'react';
 * import { useAdhesive } from '@adhesivejs/react';
 *
 * function Component() {
 *   const targetRef = useRef<HTMLDivElement>(null);
 *   const boundingRef = useRef<HTMLDivElement>(null);
 *
 *   useAdhesive(
 *     targetRef,
 *     { boundingRef, position: 'top' }
 *   );
 *
 *   return (
 *     <div ref={boundingRef}>
 *       <div ref={targetRef}>Sticky content</div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdhesive(
  target: MaybeRefObjectOrElementOrSelector,
  options?: UseAdhesiveOptions,
) {
  function getValidatedOptions() {
    const targetEl = unwrapElement(target);
    const boundingEl =
      unwrapElement(options?.boundingRef) ?? options?.boundingEl;

    if (!targetEl) {
      throw new Error("@adhesivejs/react: target element is not defined");
    }

    return { ...options, targetEl, boundingEl } satisfies AdhesiveOptions;
  }

  const adhesive = useRef<Adhesive | null>(null);

  useEffect(() => {
    adhesive.current ??= Adhesive.create(getValidatedOptions());

    return () => {
      adhesive.current?.cleanup();
      adhesive.current = null;
    };
  }, [target]);

  useEffect(() => {
    adhesive.current?.updateOptions(getValidatedOptions());
  }, [options]);
}
