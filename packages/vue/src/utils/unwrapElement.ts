import {
  toValue,
  type ComponentPublicInstance,
  type MaybeRefOrGetter,
} from "vue";

type VueInstance = ComponentPublicInstance;

type MaybeElementOrSelector =
  | VueInstance
  | HTMLElement
  | string
  | null
  | undefined;

export type MaybeElementOrSelectorRef<
  T extends MaybeElementOrSelector = MaybeElementOrSelector,
> = MaybeRefOrGetter<T>;

type UnwrapElementReturn = HTMLElement | string | null | undefined;

export function unwrapElement(
  elOrSelectorRef: MaybeElementOrSelectorRef,
): UnwrapElementReturn {
  const elOrSelectorValue = toValue(elOrSelectorRef);
  return (elOrSelectorValue as VueInstance)?.$el ?? elOrSelectorValue;
}
