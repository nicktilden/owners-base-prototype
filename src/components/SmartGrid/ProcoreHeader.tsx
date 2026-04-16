import React, { useCallback, useEffect, useRef, useState } from "react";
import type { IHeaderParams, SortDirection } from "ag-grid-community";
import { ArrowUp, ArrowDown, Filter, EllipsisVertical } from "@procore/core-icons";

export default function ProcoreHeader(props: IHeaderParams) {
  const {
    displayName,
    enableSorting,
    enableMenu,
    enableFilterButton,
    progressSort,
    showColumnMenu,
    column,
  } = props;

  const [sortState, setSortState] = useState<SortDirection>(null);
  const [filterActive, setFilterActive] = useState(false);
  const menuBtnRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const onSortChanged = () => setSortState(column.getSort() ?? null);
    const onFilterChanged = () => setFilterActive(column.isFilterActive());
    column.addEventListener("sortChanged", onSortChanged);
    column.addEventListener("filterChanged", onFilterChanged);
    setSortState(column.getSort() ?? null);
    setFilterActive(column.isFilterActive());
    return () => {
      column.removeEventListener("sortChanged", onSortChanged);
      column.removeEventListener("filterChanged", onFilterChanged);
    };
  }, [column]);

  const onSortClick = useCallback(
    (e: React.MouseEvent) => {
      if (enableSorting) progressSort(e.shiftKey);
    },
    [enableSorting, progressSort]
  );

  const onMenuClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (menuBtnRef.current) showColumnMenu(menuBtnRef.current);
    },
    [showColumnMenu]
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        height: "100%",
        gap: 4,
        cursor: enableSorting ? "pointer" : "default",
        userSelect: "none",
      }}
      onClick={onSortClick}
    >
      <span
        style={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontWeight: 600,
          fontSize: 12,
          lineHeight: "16px",
          letterSpacing: "0.25px",
          color: "#464F53",
        }}
      >
        {displayName}
      </span>

      {enableSorting && sortState && (
        <span style={{ display: "flex", alignItems: "center", color: "#2066DF", flexShrink: 0 }}>
          {sortState === "asc" ? (
            <ArrowUp size="sm" />
          ) : (
            <ArrowDown size="sm" />
          )}
        </span>
      )}

      {enableFilterButton && filterActive && (
        <span style={{ display: "flex", alignItems: "center", color: "#2066DF", flexShrink: 0 }}>
          <Filter size="sm" />
        </span>
      )}

      {enableMenu && (
        <span
          ref={menuBtnRef}
          role="button"
          tabIndex={0}
          onClick={onMenuClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onMenuClick(e as unknown as React.MouseEvent);
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            color: "#9DA6AB",
            flexShrink: 0,
            cursor: "pointer",
            borderRadius: 4,
            padding: 2,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#464F53"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#9DA6AB"; }}
        >
          <EllipsisVertical size="sm" />
        </span>
      )}
    </div>
  );
}
