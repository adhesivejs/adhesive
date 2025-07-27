export {
  Adhesive,
  ADHESIVE_STATUS,
  AdhesiveError,
  type AdhesiveOptions,
  type AdhesivePosition,
  type AdhesiveState,
  type AdhesiveStatus,
} from "@adhesivejs/core";

export {
  useAdhesive,
  type UseAdhesiveElements,
  type UseAdhesiveOptions,
} from "./composables/useAdhesive.js";

export {
  default as AdhesiveContainer,
  type AdhesiveContainerProps,
} from "./components/AdhesiveContainer.vue";
