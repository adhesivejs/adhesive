import { Adhesive, type AdhesiveOptions } from "@adhesivejs/core";
import type { Attachment } from "svelte/attachments";

export type AdhesiveAttachmentOptions = Partial<
  Omit<AdhesiveOptions, "targetEl">
>;

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
