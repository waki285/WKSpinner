import { describe, expect, it, vi } from "vitest";

import { updateExistingEditCount } from "../src/edit-count";

function child(hasEditCountClass: boolean) {
  return {
    classList: {
      contains: (className: string) =>
        hasEditCountClass && className === "wks-editcount",
    },
    textContent: "",
    remove: vi.fn(),
  };
}

describe("edit count rendering", () => {
  it("updates a count regardless of its child position", () => {
    const other = child(false);
    const count = child(true);
    const anchor = {
      children: [count, other],
    } as unknown as Pick<HTMLAnchorElement, "children">;

    expect(updateExistingEditCount(anchor, 8)).toBe(true);
    expect(count.textContent).toBe("(8)");
  });

  it("removes counts left by repeated hook execution", () => {
    const count = child(true);
    const duplicate = child(true);
    const anchor = {
      children: [count, duplicate],
    } as unknown as Pick<HTMLAnchorElement, "children">;

    expect(updateExistingEditCount(anchor, 12)).toBe(true);
    expect(count.textContent).toBe("(12)");
    expect(duplicate.remove).toHaveBeenCalledOnce();
  });

  it("reports when a count has not been added yet", () => {
    const anchor = {
      children: [child(false)],
    } as unknown as Pick<HTMLAnchorElement, "children">;

    expect(updateExistingEditCount(anchor, 8)).toBe(false);
  });
});
