import {
  toValue,
  type ComponentPublicInstance,
  type MaybeRefOrGetter,
} from "vue";

type VueInstance = ComponentPublicInstance;
type MaybeElement = HTMLElement | VueInstance | undefined | null;
export type MaybeComputedElementRef<T extends MaybeElement = MaybeElement> =
  MaybeRefOrGetter<T>;
type UnRefElementReturn<T extends MaybeElement = MaybeElement> =
  T extends VueInstance ? Exclude<MaybeElement, VueInstance> : T | undefined;

export function unrefElement<T extends MaybeElement>(
  elRef: MaybeComputedElementRef<T>,
): UnRefElementReturn<T> {
  const plain = toValue(elRef);
  return (plain as VueInstance)?.$el ?? plain;
}
