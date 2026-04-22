/**
 * Reset scroll positions after switching tool or hub tabs so tables start at the top-left.
 * - `main.app-shell-main`: primary page scroll (AppLayout)
 * - `[data-tab-scroll-root]`: explicit wide-table / card scrollports (Capital Planning, etc.)
 * - AG Grid viewports: horizontal/vertical scroll within grids (Tasks, Schedule, Assets, …)
 */
export function resetToolTabScrollLayout(): void {
  const main = document.querySelector("main.app-shell-main");
  if (main instanceof HTMLElement) {
    main.scrollTop = 0;
    main.scrollLeft = 0;
  }

  const scope = main ?? document.body;

  scope.querySelectorAll<HTMLElement>("[data-tab-scroll-root]").forEach((el) => {
    el.scrollTop = 0;
    el.scrollLeft = 0;
  });

  scope
    .querySelectorAll<HTMLElement>(
      ".ag-body-horizontal-scroll-viewport, .ag-center-cols-viewport, .ag-floating-top-viewport, .ag-body-vertical-scroll-viewport"
    )
    .forEach((el) => {
      el.scrollTop = 0;
      el.scrollLeft = 0;
    });
}
