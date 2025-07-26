<script lang="ts">
import { computed, useTemplateRef } from "vue";
import {
  useAdhesive,
  type UseAdhesiveElements,
  type UseAdhesiveOptions,
} from "../composables/useAdhesive";

type BaseProps = Omit<
  Partial<UseAdhesiveOptions>,
  "outerClassName" | "innerClassName" | "activeClassName" | "releasedClassName"
>;

export interface AdhesiveContainerProps extends BaseProps {
  outerClass?: UseAdhesiveOptions["outerClassName"];
  innerClass?: UseAdhesiveOptions["innerClassName"];
  activeClass?: UseAdhesiveOptions["activeClassName"];
  releasedClass?: UseAdhesiveOptions["releasedClassName"];
}

/**
 * Automatically applies sticky positioning to its content.
 * Internally uses the `useAdhesive` composable.
 *
 * @example
 * ```vue
 * <AdhesiveContainer position="top">
 *   Content to make sticky
 * </AdhesiveContainer>
 * ```
 */

// eslint-disable-next-line vue/prefer-define-options, import/no-default-export
export default { name: "AdhesiveContainer" };
</script>

<script setup lang="ts">
const {
  boundingEl,
  enabled = true,
  offset,
  position,
  zIndex,
  outerClass,
  innerClass,
  activeClass,
  releasedClass,
} = defineProps<AdhesiveContainerProps>();

const targetEl = useTemplateRef("target");

const elements = {
  target: targetEl,
} satisfies UseAdhesiveElements;

const options = computed<UseAdhesiveOptions>(() => ({
  boundingEl,
  enabled,
  offset,
  position,
  zIndex,
  outerClassName: outerClass,
  innerClassName: innerClass,
  activeClassName: activeClass,
  releasedClassName: releasedClass,
}));

useAdhesive(elements, options);
</script>

<template>
  <div ref="target">
    <slot />
  </div>
</template>
