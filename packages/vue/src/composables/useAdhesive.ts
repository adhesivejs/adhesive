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
  type MaybeComputedElementRef,
} from "../utils/unrefElement.js";

/**
 * Template ref objects for Vue elements used by the Adhesive composable.
 */
export interface UseAdhesiveTemplateRefs {
  /** Vue template ref or element that should become sticky */
  target: MaybeComputedElementRef;
  /** Optional Vue template ref or element that defines sticky boundaries */
  bounding?: MaybeComputedElementRef;
}

/**
 * Configuration options for the `useAdhesive` composable.
 * Excludes `targetEl` and `boundingEl` since they're provided via template refs.
 */
export type UseAdhesiveOptions = Partial<Omit<AdhesiveOptions, "targetEl">>;

/**
 * Vue composable for adding sticky positioning behavior to DOM elements.
 *
 * This composable automatically manages the lifecycle of a Adhesive instance,
 * handling initialization, updates, and cleanup. It integrates seamlessly
 * with Vue's reactivity system and component lifecycle.
 *
 * @param templateRefs - Object containing Vue refs for target and optional bounding elements
 * @param options - Reactive configuration options for sticky behavior (excluding element references)
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
 *   { target: targetEl, bounding: boundingEl },
 *   { position: 'top' }
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
 * useAdhesive({ target: targetEl }, () => ({
 *   position: 'top'
 *   enabled: enabled.value,
 *   offset: offset.value,
 * }));
 * </script>
 * ```
 */
export function useAdhesive(
  templateRefs: UseAdhesiveTemplateRefs,
  options?: MaybeRefOrGetter<UseAdhesiveOptions>,
) {
  function getValidatedOptions() {
    const optionsValue = toValue(options);

    const targetEl = unrefElement(templateRefs.target);
    const boundingEl =
      unrefElement(templateRefs.bounding) ?? optionsValue?.boundingEl;

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

      const { targetEl, boundingEl, ...optionsToUpdate } =
        getValidatedOptions();
      adhesive.updateOptions(optionsToUpdate);
    },
  );

  onUnmounted(() => {
    adhesive?.cleanup();
    adhesive = null;
  });
}
