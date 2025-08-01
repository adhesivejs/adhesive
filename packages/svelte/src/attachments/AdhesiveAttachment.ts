import { Adhesive, type AdhesiveOptions } from "@adhesivejs/core";
import type { Attachment } from "svelte/attachments";

/**
 * Type definition for adhesive attachment options.
 */
export type AdhesiveAttachmentOptions = Partial<
  Omit<AdhesiveOptions, "targetEl">
>;

/**
 * Svelte attachment for making elements sticky with advanced positioning options.
 *
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { adhesive } from '@adhesivejs/svelte';
 * </script>
 *
 * <div {@attach adhesive({ position: "top" })}>Content to make sticky</div>
 * ```
 */
export function adhesive(
  options?: AdhesiveAttachmentOptions,
): Attachment<HTMLElement> {
  return (node) => {
    const targetEl = node;

    if (!targetEl) {
      throw new Error("@adhesivejs/svelte: target element is not defined");
    }

    const adhesive = Adhesive.create({ ...options, targetEl });

    return () => adhesive.cleanup();
  };
}
