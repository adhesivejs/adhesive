import { Adhesive, type AdhesiveOptions } from "@adhesivejs/core";
import {
  onMounted,
  onUnmounted,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from "vue";
import {
  unwrapElement,
  type MaybeTemplateRef,
  type MaybeVueInstanceOrElementOrSelector,
  type VueInstanceOrElement,
} from "../utils/unwrapElement.js";

/**
 * Configuration options for the useAdhesive composable.
 *
 * Extends the core AdhesiveOptions but omits targetEl since it's provided via the composable parameter.
 * Adds Vue-specific boundingRef option for convenient ref-based boundary selection.
 */
export type UseAdhesiveOptions = Partial<Omit<AdhesiveOptions, "targetEl">> & {
  /** Vue template ref for the element that defines sticky boundaries */
  boundingRef?: MaybeTemplateRef<VueInstanceOrElement>;
};

/**
 * Vue composable for adding sticky positioning behavior to DOM elements.
 *
 * This composable automatically manages the lifecycle of a Adhesive instance,
 * handling initialization, updates, and cleanup. It integrates seamlessly
 * with Vue's reactivity system and component lifecycle.
 *
 * @param target - Vue template ref for the element that should become sticky
 * @param options - Reactive configuration options for sticky behavior
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useTemplateRef } from 'vue';
 * import { useAdhesive } from '@adhesivejs/vue';
 *
 * const targetRef = useTemplateRef('target');
 * const boundingRef = useTemplateRef('bounding');
 *
 * useAdhesive(
 *   targetRef,
 *   () => ({ boundingRef: boundingRef.value, position: 'top' })
 * );
 * </script>
 *
 * <template>
 *   <div ref="bounding" style="height: 200vh">
 *     <div ref="target">Sticky content</div>
 *   </div>
 * </template>
 * ```
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { useAdhesive } from '@adhesivejs/vue';
 *
 * const targetRef = useTemplateRef('target');
 * const enabled = ref(true);
 * const offset = ref(10);
 *
 * // Reactive options
 * useAdhesive(targetRef, () => ({
 *   position: 'top',
 *   enabled: enabled.value,
 *   offset: offset.value,
 * }));
 * </script>
 * ```
 */
export function useAdhesive(
  target: MaybeRefOrGetter<MaybeVueInstanceOrElementOrSelector>,
  options?: MaybeRefOrGetter<UseAdhesiveOptions>,
) {
  function getValidatedOptions() {
    const optionsValue = toValue(options);

    const targetEl = unwrapElement(target);
    const boundingEl =
      unwrapElement(optionsValue?.boundingRef) ?? optionsValue?.boundingEl;

    if (!targetEl) {
      throw new Error("@adhesivejs/vue: target element is not defined");
    }

    return { ...optionsValue, targetEl, boundingEl } satisfies AdhesiveOptions;
  }

  let adhesive: Adhesive | null = null;

  onMounted(() => {
    adhesive ??= Adhesive.create(getValidatedOptions());
  });

  onUnmounted(() => {
    adhesive?.cleanup();
    adhesive = null;
  });

  watch(
    () => toValue(options),
    () => adhesive?.replaceOptions(getValidatedOptions()),
  );
}
