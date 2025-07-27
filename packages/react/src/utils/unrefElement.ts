import type { RefObject } from "react";

type MaybeElementRefObject = RefObject<HTMLElement | HTMLDivElement | null>;

export type MaybeElementOrSelectorRef =
  | MaybeElementRefObject
  | HTMLElement
  | string
  | null
  | undefined;

type UnRefElementReturn = HTMLElement | string | null | undefined;

export function unrefElement(
  elOrSelectorRef: MaybeElementOrSelectorRef,
): UnRefElementReturn {
  // Handle React ref objects by accessing their .current property
  // For non-ref values, return them as-is
  if (
    elOrSelectorRef &&
    typeof elOrSelectorRef === "object" &&
    "current" in elOrSelectorRef
  ) {
    return elOrSelectorRef.current;
  }
  return elOrSelectorRef as UnRefElementReturn;
}
