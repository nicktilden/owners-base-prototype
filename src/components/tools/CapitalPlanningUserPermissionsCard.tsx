import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pagination,
  RadioButton,
  Search,
  Table,
  Typography,
} from "@procore/core-react";
import type { ChangeEvent } from "react";
import type { TableColumnSortOrder } from "@procore/core-react";

const PAGE_SIZE = 10;
/** Demo total so pagination matches a realistic admin table (e.g. “41–50 of 1,000”). */
const TOTAL_USERS = 1000;

const MOCK_FIRST_NAMES = [
  "Andrew",
  "Anna",
  "James",
  "Maria",
  "Robert",
  "Susan",
  "David",
  "Linda",
  "Michael",
  "Patricia",
];
const MOCK_LAST_NAMES = [
  "Smith",
  "Neal",
  "Johnson",
  "Garcia",
  "Brown",
  "Davis",
  "Miller",
  "Wilson",
  "Moore",
  "Taylor",
];
const MOCK_COMPANIES = [
  "DC Electric",
  "Mechanical Systems, Inc.",
  "Summit Builders",
  "Pacific HVAC",
  "Urban Concrete Co.",
  "North Ridge Electric",
  "Bay Steel Works",
  "Evergreen Roofing",
  "Atlas Plumbing",
  "Cornerstone Drywall",
];

export type CapitalPlanningPermissionLevel = "none" | "readOnly" | "standard" | "admin";

const PERMISSION_COLUMNS: { value: CapitalPlanningPermissionLevel; label: string }[] = [
  { value: "none", label: "None" },
  { value: "readOnly", label: "Read Only" },
  { value: "standard", label: "Standard" },
  { value: "admin", label: "Admin" },
];

function demoUserRow(globalIndex: number): {
  id: string;
  name: string;
  company: string;
} {
  const seed = globalIndex + 1;
  const fn = MOCK_FIRST_NAMES[globalIndex % MOCK_FIRST_NAMES.length];
  const ln = MOCK_LAST_NAMES[(globalIndex + 3) % MOCK_LAST_NAMES.length];
  const company =
    globalIndex % 7 === 3 ? "—" : MOCK_COMPANIES[(globalIndex + globalIndex * 7) % MOCK_COMPANIES.length];
  return {
    id: `cp-user-${seed}`,
    name: `${fn} ${ln}`,
    company,
  };
}

function defaultPermissionForRow(globalIndex: number): CapitalPlanningPermissionLevel {
  const m = globalIndex % 17;
  if (m === 0) return "admin";
  if (m < 4) return "standard";
  if (m < 9) return "readOnly";
  return "none";
}

/**
 * Capital Planning Settings → Permissions: user × permission radio grid with search and pagination.
 */
export default function CapitalPlanningUserPermissionsCard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortNameAsc, setSortNameAsc] = useState(true);
  /** Default page 5 → rows 41–50 with page size 10 (matches reference layout). */
  const [page, setPage] = useState(5);
  const [permissionOverridesByUserId, setPermissionOverridesByUserId] = useState<
    Record<string, CapitalPlanningPermissionLevel>
  >({});

  const filteredIndices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const indices: number[] = [];
    for (let i = 0; i < TOTAL_USERS; i++) {
      const row = demoUserRow(i);
      if (!q) {
        indices.push(i);
        continue;
      }
      if (
        row.name.toLowerCase().includes(q) ||
        (row.company !== "—" && row.company.toLowerCase().includes(q))
      ) {
        indices.push(i);
      }
    }
    indices.sort((a, b) => {
      const na = demoUserRow(a).name;
      const nb = demoUserRow(b).name;
      const cmp = na.localeCompare(nb, undefined, { sensitivity: "base" });
      return sortNameAsc ? cmp : -cmp;
    });
    return indices;
  }, [searchQuery, sortNameAsc]);

  const totalFiltered = filteredIndices.length;
  const pageCount = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));

  useEffect(() => {
    setPage((p) => Math.min(p, pageCount));
  }, [pageCount]);

  const safePage = Math.min(page, pageCount);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageEndExclusive = Math.min(pageStart + PAGE_SIZE, totalFiltered);
  const visibleIndices = filteredIndices.slice(pageStart, pageEndExclusive);

  const setPermission = useCallback((userId: string, globalIndex: number, level: CapitalPlanningPermissionLevel) => {
    const baseline = defaultPermissionForRow(globalIndex);
    setPermissionOverridesByUserId((prev) => {
      if (level === baseline) {
        if (prev[userId] === undefined) return prev;
        const next = { ...prev };
        delete next[userId];
        return next;
      }
      return { ...prev, [userId]: level };
    });
  }, []);

  const permissionFor = useCallback(
    (userId: string, globalIndex: number): CapitalPlanningPermissionLevel =>
      permissionOverridesByUserId[userId] ?? defaultPermissionForRow(globalIndex),
    [permissionOverridesByUserId]
  );

  const onNameSortOrderChange = useCallback((next: TableColumnSortOrder) => {
    if (next === "asc") setSortNameAsc(true);
    else if (next === "desc") setSortNameAsc(false);
    else setSortNameAsc(true);
  }, []);

  return (
    <div
      className="capital-planning-user-permissions"
      style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: "100%", minWidth: 0 }}
    >
      <div style={{ maxWidth: 480, width: "100%" }}>
        <Search
          placeholder="Search"
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          aria-label="Search users"
        />
      </div>

      <div
        data-tab-scroll-root
        style={{
          width: "100%",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          border: "1px solid var(--color-border-separator)",
          borderRadius: 8,
          background: "var(--color-surface-primary)",
        }}
      >
        <Table.Container>
          <Table className="capital-planning-user-permissions-table">
            <Table.Header>
              <Table.HeaderRow>
                <Table.HeaderCell
                  style={{ minWidth: 160 }}
                  sortOrder={sortNameAsc ? "asc" : "desc"}
                  onSortOrderChange={onNameSortOrderChange}
                >
                  Name
                </Table.HeaderCell>
                <Table.HeaderCell style={{ minWidth: 200 }}>Company</Table.HeaderCell>
                {PERMISSION_COLUMNS.map((col) => (
                  <Table.HeaderCell
                    key={col.value}
                    style={{ textAlign: "center", width: 112, minWidth: 96 }}
                  >
                    {col.label}
                  </Table.HeaderCell>
                ))}
              </Table.HeaderRow>
            </Table.Header>
            <Table.Body>
              {visibleIndices.map((globalIndex) => {
                const row = demoUserRow(globalIndex);
                const selected = permissionFor(row.id, globalIndex);
                return (
                  <Table.BodyRow key={row.id}>
                    <Table.BodyCell style={{ verticalAlign: "middle" }}>
                      <Table.LinkCell
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                        aria-label={`View ${row.name}`}
                      >
                        {row.name}
                      </Table.LinkCell>
                    </Table.BodyCell>
                    <Table.BodyCell style={{ verticalAlign: "middle" }}>
                      <Table.TextCell>{row.company}</Table.TextCell>
                    </Table.BodyCell>
                    {PERMISSION_COLUMNS.map((col) => (
                      <Table.BodyCell
                        key={`${row.id}-${col.value}`}
                        snugfit
                        style={{ textAlign: "center", verticalAlign: "middle" }}
                      >
                        <RadioButton
                          name={`cp-perm-${row.id}`}
                          value={col.value}
                          checked={selected === col.value}
                          onChange={() => setPermission(row.id, globalIndex, col.value)}
                          aria-label={`${col.label} for ${row.name}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            lineHeight: 1,
                          }}
                        />
                      </Table.BodyCell>
                    ))}
                  </Table.BodyRow>
                );
              })}
            </Table.Body>
          </Table>
        </Table.Container>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 0, width: "100%" }}>
        <Pagination
          activePage={safePage}
          items={totalFiltered}
          perPage={PAGE_SIZE}
          onSelectPage={setPage}
        />
      </div>
    </div>
  );
}
