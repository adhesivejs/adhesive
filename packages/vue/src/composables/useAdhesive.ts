import { Adhesive, type AdhesiveOptions } from "@adhesivejs/core";
import {
  onMounted,
  onUnmounted,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from "vue";
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
 * const targetEl = useTemplateRef('target');
 * const boundingEl = useTemplateRef('bounding');
 *
 * useAdhesive(
 *   targetEl,
 *   () => ({ boundingEl: boundingEl.value, position: 'top' })
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
 * const targetEl = useTemplateRef('target');
 * const enabled = ref(true);
 * const offset = ref(10);
 *
 * // Reactive options
 * useAdhesive(targetEl, () => ({
 *   position: 'top',
 *   enabled: enabled.value,
 *   offset: offset.value,
 * }));
 * </script>
 * ```
 */
export function useAdhesive(
  target: MaybeElementOrSelectorRef,
  options?: MaybeRefOrGetter<UseAdhesiveOptions>,
) {
  function getValidatedOptions() {
    const optionsValue = toValue(options);

    const targetEl = unrefElement(target);
    const boundingEl = unrefElement(optionsValue?.boundingEl);

    if (!targetEl) {
      throw new Error("@adhesivejs/vue: sticky element is not defined");
    }

    return { ...optionsValue, targetEl, boundingEl } satisfies AdhesiveOptions;
  }

  let adhesive: Adhesive | null = null;

  onMounted(() => {
    adhesive ??= Adhesive.create(getValidatedOptions());
  });

  watch(
    () => toValue(options),
    () => {
      if (!adhesive) return;

      adhesive.updateOptions(getValidatedOptions());
    },
  );

  onUnmounted(() => {
    adhesive?.cleanup();
    adhesive = null;
  });
}
