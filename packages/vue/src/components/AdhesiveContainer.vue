<script lang="ts">
import { useTemplateRef } from "vue";
import {
  useAdhesive,
  type UseAdhesiveOptions,
} from "../composables/useAdhesive";

export type AdhesiveContainerProps = Partial<UseAdhesiveOptions>;

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
  outerClassName,
  innerClassName,
  activeClassName,
  releasedClassName,
} = defineProps<AdhesiveContainerProps>();

const targetEl = useTemplateRef("target");

useAdhesive({ target: targetEl }, () => ({
  boundingEl,
  enabled,
  offset,
  position,
  zIndex,
  outerClassName,
  innerClassName,
  activeClassName,
  releasedClassName,
}));
</script>

<template>
  <div ref="target">
    <slot />
  </div>
</template>
