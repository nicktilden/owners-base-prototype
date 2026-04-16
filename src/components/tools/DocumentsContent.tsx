import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Button,
  Dropdown,
  Pill,
  Search,
  Select,
  SplitViewCard,
  Tabs,
} from "@procore/core-react";
import {
  FileList as DocumentsIcon,
  Plus,
} from "@procore/core-icons";
import type { ColDef, GridApi, ICellRendererParams } from "ag-grid-community";
import styled from "styled-components";
import { SmartGridWrapper } from "@/components/SmartGrid";
import CostActionsCellRenderer from "@/components/SmartGrid/CostActionsCellRenderer";
import { documents } from "@/data/seed/documents";
import { projects } from "@/data/seed/projects";
import type { Document, DocumentStatus } from "@/types/documents";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { formatDateMMDDYYYY } from "@/utils/date";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

const STATUS_COLORS: Record<DocumentStatus, "green" | "yellow" | "red" | "gray" | "blue"> = {
  draft: "gray",
  in_review: "blue",
  approved: "green",
  rejected: "red",
  superseded: "gray",
};

const STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: "Draft",
  in_review: "In Review",
  approved: "Approved",
  rejected: "Rejected",
  superseded: "Superseded",
};

// ─── Styled components ────────────────────────────────────────────────────────

const ToolbarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 8px;
  gap: 8px;
  background: var(--color-surface-primary);
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const GridArea = styled.div`
  display: flex;
  height: 640px;
  border: 1px solid var(--color-border-default);
  overflow: hidden;
`;

// ─── Cell renderer ────────────────────────────────────────────────────────────

function DocStatusPillRenderer(params: ICellRendererParams) {
  const status = params.value as DocumentStatus | undefined;
  if (!status) return null;
  return <Pill color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Pill>;
}

// ─── Component ────────────────────────────────────────────────────────────────

type TabKey = "all" | "drawings" | "submittals";

interface DocumentsContentProps {
  projectId: string;
}

export default function DocumentsContent({ projectId }: DocumentsContentProps) {
  const isPortfolio = projectId === "";

  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const gridApiRef = useRef<GridApi<Document> | null>(null);

  const project = useMemo(() => projects.find((p) => p.id === projectId), [projectId]);
  const projectLabel = project ? `${project.number} ${project.name}` : projectId;

  const projectMap = useMemo(() => {
    const m = new Map<string, string>();
    projects.forEach((p) => m.set(p.id, `${p.number} ${p.name}`));
    return m;
  }, []);

  const projectsWithDocs = useMemo(() => {
    const ids = new Set(documents.map((d) => d.projectId));
    return projects.filter((p) => ids.has(p.id));
  }, []);

  const rowData = useMemo<Document[]>(() => {
    let base = isPortfolio ? [...documents] : documents.filter((d) => d.projectId === projectId);

    if (activeTab === "drawings") base = base.filter((d) => d.type === "DR");
    if (activeTab === "submittals") base = base.filter((d) => d.type === "DOC");

    if (isPortfolio && selectedProjectIds.length > 0) {
      base = base.filter((d) => selectedProjectIds.includes(d.projectId));
    }

    return base;
  }, [projectId, isPortfolio, activeTab, selectedProjectIds]);

  const columnDefs = useMemo<ColDef<Document>[]>(() => {
    const cols: ColDef<Document>[] = [];

    if (isPortfolio) {
      cols.push({
        colId: "project",
        headerName: "Project",
        minWidth: 180,
        filter: "agSetColumnFilter",
        valueGetter: (params) =>
          params.data ? (projectMap.get(params.data.projectId) ?? params.data.projectId) : "",
        cellStyle: { color: "var(--color-text-link)", cursor: "pointer" },
      });
    }

    cols.push(
      {
        field: "title",
        headerName: "Title",
        minWidth: 220,
        filter: "agTextColumnFilter",
        cellStyle: { fontWeight: 600, color: "var(--color-text-link)", cursor: "pointer" },
      },
      {
        field: "type",
        headerName: "Type",
        width: 100,
        filter: "agSetColumnFilter",
      },
      {
        field: "format",
        headerName: "Format",
        width: 100,
        filter: "agSetColumnFilter",
        valueFormatter: (params) => params.value ? String(params.value).toUpperCase() : "",
      },
      {
        field: "status",
        headerName: "Status",
        filter: "agSetColumnFilter",
        cellRenderer: DocStatusPillRenderer,
      },
      {
        field: "version",
        headerName: "Version",
        width: 100,
        filter: "agNumberColumnFilter",
        valueFormatter: (params) => params.value != null ? `v${params.value}` : "",
      },
      {
        field: "fileSize",
        headerName: "File Size",
        width: 120,
        filter: "agNumberColumnFilter",
        valueFormatter: (params) => params.value != null ? formatFileSize(params.value) : "",
      },
      {
        field: "createdAt",
        headerName: "Created",
        filter: "agDateColumnFilter",
        valueFormatter: (params) => formatDateMMDDYYYY(params.value),
      },
      {
        colId: "actions",
        headerName: "Actions",
        width: 90,
        minWidth: 90,
        maxWidth: 90,
        resizable: false,
        sortable: false,
        filter: false,
        suppressMovable: true,
        suppressHeaderMenuButton: true,
        pinned: "right",
        cellRenderer: CostActionsCellRenderer,
        lockPosition: true,
      }
    );

    return cols;
  }, [isPortfolio, projectMap]);

  const getRowId = useCallback(
    (params: { data: Document }) => params.data.id,
    []
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchText(value);
      gridApiRef.current?.setGridOption("quickFilterText", value);
    },
    []
  );

  const handleSearchClear = useCallback(() => {
    setSearchText("");
    gridApiRef.current?.setGridOption("quickFilterText", "");
  }, []);


  const actions = (
    <>
      <Dropdown label="Export" variant="secondary">
        <Dropdown.Item item="csv">CSV</Dropdown.Item>
        <Dropdown.Item item="excel">Excel</Dropdown.Item>
      </Dropdown>
      <Button variant="primary" icon={<Plus />}>Upload Document</Button>
    </>
  );

  const tabs = (
    <Tabs>
      <Tabs.Tab selected={activeTab === "all"} onPress={() => setActiveTab("all")} role="button">
        <Tabs.Link>All Documents</Tabs.Link>
      </Tabs.Tab>
      <Tabs.Tab selected={activeTab === "drawings"} onPress={() => setActiveTab("drawings")} role="button">
        <Tabs.Link>Drawings</Tabs.Link>
      </Tabs.Tab>
      <Tabs.Tab selected={activeTab === "submittals"} onPress={() => setActiveTab("submittals")} role="button">
        <Tabs.Link>Submittals</Tabs.Link>
      </Tabs.Tab>
    </Tabs>
  );

  return (
    <ToolPageLayout
      title="Documents"
      icon={<DocumentsIcon size="md" />}
      actions={actions}
      tabs={tabs}
    >
      <SplitViewCard>
        <SplitViewCard.Main>
          <SplitViewCard.Section heading="Documents">
            <ToolbarRow>
              <ToolbarLeft>
                <div style={{ maxWidth: 260 }}>
                  <Search
                    placeholder="Search"
                    value={searchText}
                    onChange={handleSearchChange}
                    onClear={handleSearchClear}
                  />
                </div>
                {isPortfolio && (
                  <div style={{ width: 260 }}>
                    <Select
                      placeholder="Filter by project"
                      label={selectedProjectIds.length ? `${selectedProjectIds.length} selected` : undefined}
                      onSelect={(s) => {
                        const id = s.item as string;
                        setSelectedProjectIds((prev) =>
                          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                        );
                      }}
                      onClear={() => setSelectedProjectIds([])}
                      block
                    >
                      {projectsWithDocs.map((p) => (
                        <Select.Option key={p.id} value={p.id} selected={selectedProjectIds.includes(p.id)}>
                          {p.number} {p.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                )}
              </ToolbarLeft>
            </ToolbarRow>

            <GridArea>
              <div style={{ flex: 1, minWidth: 0 }}>
                <SmartGridWrapper<Document>
                  id="documents-grid"
                  localStorageKey="owner-prototype-documents-grid"
                  height="100%"
                  rowData={rowData}
                  columnDefs={columnDefs}
                  getRowId={getRowId}
                  sideBar={false}
                  onGridReady={(event) => {
                    gridApiRef.current = event.api;
                  }}
                  statusBar={{
                    statusPanels: [
                      { statusPanel: "agTotalAndFilteredRowCountComponent", align: "left" },
                      { statusPanel: "agSelectedRowCountComponent", align: "left" },
                    ],
                  }}
                />
              </div>
            </GridArea>
          </SplitViewCard.Section>
        </SplitViewCard.Main>
      </SplitViewCard>
    </ToolPageLayout>
  );
}
