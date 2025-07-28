import type { RefObject } from "react";

export type MaybeRefObjectOrElementOrSelector =
  | RefObject<HTMLElement | null>
  | HTMLElement
  | string
  | null
  | undefined;

type UnwrapElementReturn = HTMLElement | string | null | undefined;

export function unwrapElement(
  value: MaybeRefObjectOrElementOrSelector,
): UnwrapElementReturn {
  if (isRefObject(value)) return value.current;
  return value;
}

function isRefObject(value: unknown): value is RefObject<HTMLElement | null> {
  return !!value && typeof value === "object" && "current" in value;
}
