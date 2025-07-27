import { Adhesive, type AdhesiveOptions } from "@adhesivejs/core";
import { useEffect, useRef } from "react";
import {
  unrefElement,
  type MaybeElementOrSelectorRef,
} from "../utils/unrefElement.js";

export type UseAdhesiveOptions = Partial<
  Omit<AdhesiveOptions, "targetEl" | "boundingEl">
> & {
  boundingEl?: AdhesiveOptions["boundingEl"] | MaybeElementOrSelectorRef;
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
 *   const targetEl = useRef<HTMLDivElement>(null);
 *   const boundingEl = useRef<HTMLDivElement>(null);
 *
 *   useAdhesive(
 *     targetEl,
 *     { boundingEl, position: 'top' }
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
  target: MaybeElementOrSelectorRef,
  options?: UseAdhesiveOptions,
) {
  function getValidatedOptions() {
    const targetEl = unrefElement(target);
    const boundingEl = unrefElement(options?.boundingEl);

    if (!targetEl) {
      throw new Error("@adhesivejs/react: sticky element is not defined");
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
    if (!adhesive.current) return;

    adhesive.current.updateOptions(getValidatedOptions());
  }, [options]);
}
