import React, { useMemo, useState } from "react";
import {
  Button,
  Dropdown,
  Pill,
  Select,
  SplitViewCard,
  Table,
  Tabs,
  ToggleButton,
} from "@procore/core-react";
import {
  FileList as DocumentsIcon,
  Filter,
  Plus,
  Search as SearchIcon,
  Clear,
} from "@procore/core-icons";
import { documents } from "@/data/seed/documents";
import { projects } from "@/data/seed/projects";
import type { Document, DocumentStatus } from "@/types/documents";
import styled from "styled-components";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { PINNED_BODY_CELL_STYLE, PINNED_HEADER_CELL_STYLE, StandardRowActions } from "@/components/table/TableActions";

// ─── Styled components ────────────────────────────────────────────────────────

const SearchInputWrap = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #c4cbcf;
  border-radius: 4px;
  padding: 0 8px;
  height: 36px;
  gap: 6px;
  min-width: 220px;
  background: #fff;
  &:focus-within {
    border-color: #1d5cc9;
    box-shadow: 0 0 0 2px rgba(29, 92, 201, 0.2);
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;
  background: transparent;
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0px;
  gap: 8px;
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TableLayout = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 0;
  overflow: hidden;
`;

const TableArea = styled.div`
  flex: 1;
  min-width: 0;
  overflow: auto;
`;

const SidePanel = styled.div`
  width: 280px;
  flex-shrink: 0;
  border: 1px solid #e0e4e7;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e4e7;
`;

const PanelTitle = styled.span`
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: #1a2226;
`;

const PanelHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PanelBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FilterLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #1a2226;
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

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

// ─── Component ────────────────────────────────────────────────────────────────

type TabKey = "all" | "drawings" | "submittals";

interface DocumentsContentProps {
  projectId: string;
}

export default function DocumentsContent({ projectId }: DocumentsContentProps) {
  const isPortfolio = projectId === "";

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  const project = useMemo(() => projects.find((p) => p.id === projectId), [projectId]);
  const projectLabel = project ? `${project.number} ${project.name}` : projectId;

  // Build project lookup map
  const projectMap = useMemo(() => {
    const m = new Map<string, string>();
    projects.forEach((p) => m.set(p.id, `${p.number} ${p.name}`));
    return m;
  }, []);

  // Projects that have documents (for filter options)
  const projectsWithDocs = useMemo(() => {
    const ids = new Set(documents.map((d) => d.projectId));
    return projects.filter((p) => ids.has(p.id));
  }, []);

  const filteredDocs = useMemo<Document[]>(() => {
    let base = isPortfolio ? [...documents] : documents.filter((d) => d.projectId === projectId);

    if (activeTab === "drawings") base = base.filter((d) => d.type === "DR");
    if (activeTab === "submittals") base = base.filter((d) => d.type === "DOC");

    if (isPortfolio && selectedProjectIds.length > 0) {
      base = base.filter((d) => selectedProjectIds.includes(d.projectId));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q) ||
          d.format.toLowerCase().includes(q) ||
          STATUS_LABELS[d.status].toLowerCase().includes(q) ||
          (isPortfolio && (projectMap.get(d.projectId) ?? "").toLowerCase().includes(q))
      );
    }
    return base;
  }, [projectId, isPortfolio, search, activeTab, selectedProjectIds, projectMap]);

  const hasActiveFilters = selectedProjectIds.length > 0;

  const breadcrumbs = [
    { label: "Portfolio", href: "/portfolio" },
    ...(projectId ? [{ label: projectLabel, href: `/project/${projectId}` }] : []),
  ];

  const colSpan = isPortfolio ? 9 : 8;

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
      breadcrumbs={breadcrumbs}
      actions={actions}
      tabs={tabs}
    >
      <SplitViewCard>
        <SplitViewCard.Main>
          <SplitViewCard.Section heading="Documents">
            <Toolbar>
              <ToolbarLeft>
                <SearchInputWrap>
                  <SearchIcon size="sm" style={{ color: "#6a767c", flexShrink: 0 }} />
                  <SearchInput
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </SearchInputWrap>
                {isPortfolio && (
                  <ToggleButton
                    selected={filterOpen}
                    icon={<Filter />}
                    onClick={() => setFilterOpen((v) => !v)}
                  >
                    Filter{hasActiveFilters ? " •" : ""}
                  </ToggleButton>
                )}
              </ToolbarLeft>
            </Toolbar>

            <TableLayout>
              {filterOpen && isPortfolio && (
                <SidePanel style={{ marginRight: 16 }}>
                  <PanelHeader>
                    <PanelTitle>Filters</PanelTitle>
                    <PanelHeaderActions>
                      {hasActiveFilters && (
                        <Button variant="tertiary" size="md" onClick={() => setSelectedProjectIds([])}>
                          Clear All
                        </Button>
                      )}
                      <Button
                        variant="tertiary"
                        icon={<Clear />}
                        onClick={() => setFilterOpen(false)}
                        aria-label="Close filter panel"
                      />
                    </PanelHeaderActions>
                  </PanelHeader>
                  <PanelBody>
                    <FilterSection>
                      <FilterLabel>Project</FilterLabel>
                      <Select
                        placeholder="Select projects"
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
                    </FilterSection>
                  </PanelBody>
                </SidePanel>
              )}

              <TableArea>
                <Table.Container>
                  <Table>
                    <Table.Header>
                      <Table.HeaderRow>
                        {isPortfolio && <Table.HeaderCell>Project</Table.HeaderCell>}
                        <Table.HeaderCell>Title</Table.HeaderCell>
                        <Table.HeaderCell>Type</Table.HeaderCell>
                        <Table.HeaderCell>Format</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Version</Table.HeaderCell>
                        <Table.HeaderCell>File Size</Table.HeaderCell>
                        <Table.HeaderCell>Created</Table.HeaderCell>
                        <Table.HeaderCell style={PINNED_HEADER_CELL_STYLE}>Actions</Table.HeaderCell>
                      </Table.HeaderRow>
                    </Table.Header>
                    <Table.Body>
                      {filteredDocs.length === 0 ? (
                        <Table.BodyRow>
                          <Table.BodyCell colSpan={colSpan}>
                            <Table.TextCell>
                              {search || hasActiveFilters
                                ? "No documents match your search or filters."
                                : "No documents have been added to this project."}
                            </Table.TextCell>
                          </Table.BodyCell>
                        </Table.BodyRow>
                      ) : (
                        filteredDocs.map((doc) => (
                          <Table.BodyRow key={doc.id}>
                            {isPortfolio && (
                              <Table.BodyCell>
                                <Table.TextCell>
                                  <span style={{ color: "#1d5cc9", cursor: "pointer" }}>
                                    {projectMap.get(doc.projectId) ?? doc.projectId}
                                  </span>
                                </Table.TextCell>
                              </Table.BodyCell>
                            )}
                            <Table.BodyCell>
                              <Table.TextCell>
                                <span style={{ fontWeight: 600, color: "#1d5cc9", cursor: "pointer" }}>
                                  {doc.title}
                                </span>
                              </Table.TextCell>
                            </Table.BodyCell>
                            <Table.BodyCell>
                              <Table.TextCell>{doc.type}</Table.TextCell>
                            </Table.BodyCell>
                            <Table.BodyCell>
                              <Table.TextCell>{doc.format.toUpperCase()}</Table.TextCell>
                            </Table.BodyCell>
                            <Table.BodyCell>
                              <Pill color={STATUS_COLORS[doc.status]}>{STATUS_LABELS[doc.status]}</Pill>
                            </Table.BodyCell>
                            <Table.BodyCell>
                              <Table.TextCell>v{doc.version}</Table.TextCell>
                            </Table.BodyCell>
                            <Table.BodyCell>
                              <Table.TextCell>{formatFileSize(doc.fileSize)}</Table.TextCell>
                            </Table.BodyCell>
                            <Table.BodyCell>
                              <Table.TextCell>{formatDate(doc.createdAt)}</Table.TextCell>
                            </Table.BodyCell>
                            <Table.BodyCell style={PINNED_BODY_CELL_STYLE}>
                              <StandardRowActions />
                            </Table.BodyCell>
                          </Table.BodyRow>
                        ))
                      )}
                    </Table.Body>
                  </Table>
                </Table.Container>
              </TableArea>
            </TableLayout>
          </SplitViewCard.Section>
        </SplitViewCard.Main>
      </SplitViewCard>
    </ToolPageLayout>
  );
}
