export function updateExistingEditCount(
  anchor: Pick<HTMLAnchorElement, "children">,
  editCount: number,
) {
  const countElements = Array.from(anchor.children).filter((child) =>
    child.classList.contains("wks-editcount"),
  );
  const [countElement, ...duplicates] = countElements;
  if (!countElement) {
    return false;
  }
  countElement.textContent = `(${editCount})`;
  duplicates.forEach((duplicate) => duplicate.remove());
  return true;
}
