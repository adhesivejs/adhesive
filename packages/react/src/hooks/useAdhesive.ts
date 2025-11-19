import {
  Adhesive,
  ADHESIVE_STATUS,
  type AdhesiveOptions,
  type AdhesiveStatus,
} from "@adhesivejs/core";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { unwrapElement } from "../utils/unwrapElement.js";

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

/** Return type for the useAdhesive hook. */
export type UseAdhesiveReturn = {
  /** Current status of the Adhesive instance */
  status: AdhesiveStatus;
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
  target: RefObject<HTMLElement | null>,
  options?: UseAdhesiveOptions,
): UseAdhesiveReturn {
  const adhesive = useRef<Adhesive | null>(null);

  const [status, setStatus] = useState<AdhesiveStatus>(ADHESIVE_STATUS.INITIAL);

  const onStatusChange = (newStatus: AdhesiveStatus) => {
    setStatus(newStatus);
    options?.onStatusChange?.(newStatus);
  };

  const cleanup = () => {
    adhesive.current?.cleanup();
    adhesive.current = null;
    setStatus(ADHESIVE_STATUS.INITIAL);
  };

  const memoizedOptions = useMemo(
    () => options,
    [
      options?.boundingRef,
      options?.boundingEl,
      options?.enabled,
      options?.offset,
      options?.position,
      options?.zIndex,
      options?.outerClassName,
      options?.innerClassName,
      options?.initialClassName,
      options?.fixedClassName,
      options?.relativeClassName,
      options?.onStatusChange,
    ],
  );

  const getValidatedOptions = () => {
    const optionsValue = memoizedOptions;

    const targetEl = unwrapElement(target);
    const boundingEl =
      unwrapElement(optionsValue?.boundingRef) ?? optionsValue?.boundingEl;

    if (!targetEl) {
      throw new Error("@adhesivejs/react: target element is not defined");
    }

    return {
      ...optionsValue,
      targetEl,
      boundingEl,
      onStatusChange,
    } satisfies AdhesiveOptions;
  };

  useEffect(() => {
    if (!unwrapElement(target)) return cleanup();

    adhesive.current ??= Adhesive.create(getValidatedOptions());

    adhesive.current.getState();

    return cleanup;
  }, [unwrapElement(target)]);

  useEffect(() => {
    if (!unwrapElement(target)) return;

    adhesive.current?.replaceOptions(getValidatedOptions());
  }, [memoizedOptions]);

  return { status } as const;
}
