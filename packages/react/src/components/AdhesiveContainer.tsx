import { useMemo, useRef, type ComponentProps, type ReactNode } from "react";
import { useAdhesive, type UseAdhesiveOptions } from "../hooks/useAdhesive.js";

/**
 * Props for the AdhesiveContainer component.
 *
 * Combines sticky positioning options with standard div element props.
 */
export type AdhesiveContainerProps = Partial<UseAdhesiveOptions> &
  ComponentProps<"div">;

/**
 * React component that automatically applies sticky positioning to its content.
 *
 * Provides a declarative way to create sticky elements in React applications.
 * Internally uses the useAdhesive hook to manage the sticky behavior.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AdhesiveContainer position="top" offset={20}>
 *   <h1>Sticky Header</h1>
 * </AdhesiveContainer>
 * ```
 *
 * @example
 * ```tsx
 * // With custom styling and boundary
 * <AdhesiveContainer
 *   position="bottom"
 *   offset={10}
 *   zIndex={1000}
 *   className="my-sticky-element"
 *   boundingEl=".main-content"
 * >
 *   <nav>Sticky Navigation</nav>
 * </AdhesiveContainer>
 * ```
 */
export function AdhesiveContainer({
  boundingRef,
  boundingEl,
  enabled = true,
  offset,
  position,
  zIndex,
  outerClassName,
  innerClassName,
  fixedClassName,
  relativeClassName,
  children,
  ...rest
}: AdhesiveContainerProps): ReactNode {
  const targetRef = useRef<HTMLDivElement>(null);

  const options = useMemo<UseAdhesiveOptions>(
    () => ({
      boundingRef,
      boundingEl,
      enabled,
      offset,
      position,
      zIndex,
      outerClassName,
      innerClassName,
      fixedClassName,
      relativeClassName,
    }),
    [
      boundingRef,
      boundingEl,
      enabled,
      offset,
      position,
      zIndex,
      outerClassName,
      innerClassName,
      fixedClassName,
      relativeClassName,
    ],
  );

  useAdhesive(targetRef, options);

  return (
    <div ref={targetRef} {...rest}>
      {children}
    </div>
  );
}
