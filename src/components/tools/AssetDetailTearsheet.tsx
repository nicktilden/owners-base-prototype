import React, { useState } from "react";
import { Box, Button, Card, H2, Page, Pill, Tabs, Tearsheet, Typography } from "@procore/core-react";
import { Pencil } from "@procore/core-icons";
import styled, { createGlobalStyle } from "styled-components";
import type { Asset, AssetStatus, AssetCondition } from "@/types/assets";
import { formatDateMMDDYYYY } from "@/utils/date";

const AssetTearsheetWidth = createGlobalStyle`
  [class*="StyledTearsheetBody"] {
    flex: 0 0 50vw !important;
  }
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px 32px;
`;

const FieldCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FieldCellWide = styled(FieldCell)`
  grid-column: 1 / -1;
`;

const AssetImage = styled.img`
  max-width: 200px;
  max-height: 160px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--color-border-separator);
  margin-bottom: 20px;
`;

type PillColor = "green" | "yellow" | "red" | "gray";

const STATUS_COLORS: Record<AssetStatus, PillColor> = {
  active: "green",
  inactive: "gray",
  in_maintenance: "yellow",
  retired: "red",
  disposed: "gray",
};

const STATUS_LABELS: Record<AssetStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  in_maintenance: "In Maintenance",
  retired: "Retired",
  disposed: "Disposed",
};

const CONDITION_COLORS: Record<AssetCondition, PillColor> = {
  excellent: "green",
  good: "green",
  fair: "yellow",
  poor: "red",
  critical: "red",
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
}

const TABS = ["Information", "Related Items", "Attachments", "Change History"] as const;
type TabKey = (typeof TABS)[number];

interface AssetDetailTearsheetProps {
  asset: Asset | null;
  projectName: string;
  open: boolean;
  onClose: () => void;
}

export default function AssetDetailTearsheet({ asset, projectName, open, onClose }: AssetDetailTearsheetProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("Information");

  if (!asset) return null;

  return (
    <>
      <AssetTearsheetWidth />
      <Tearsheet open={open} onClose={onClose} aria-label="Asset details" placement="right">
        <Page style={{ height: "100%", background: "var(--color-surface-primary)", color: "var(--color-text-primary)" }}>
          <Page.Main style={{ height: "100%", overflow: "hidden", background: "var(--color-surface-primary)" }}>
            <Page.Header style={{ background: "var(--color-surface-primary)", borderColor: "var(--color-border-separator)" }}>
              <Page.Title>
                <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Typography intent="h2">{asset.assetCode} - {asset.name}</Typography>
                    <Pill color={STATUS_COLORS[asset.status]}>{STATUS_LABELS[asset.status]}</Pill>
                  </Box>
                  <Button variant="primary" className="b_primary" icon={<Pencil />}>Edit</Button>
                </Box>
              </Page.Title>
              <Page.Tabs>
                <Tabs>
                  {TABS.map((tab) => (
                    <Tabs.Tab
                      key={tab}
                      role="button"
                      selected={activeTab === tab}
                      onPress={() => setActiveTab(tab)}
                    >
                      {tab}
                    </Tabs.Tab>
                  ))}
                </Tabs>
              </Page.Tabs>
            </Page.Header>

            <Page.Body style={{ padding: 24, overflowY: "auto", background: "var(--color-surface-secondary)" }}>
              {activeTab === "Information" && (
                <Card style={{ padding: 24, background: "var(--color-surface-primary)" }}>
                  <H2 style={{ marginBottom: 20 }}>General Information</H2>

                  {asset.imageUrl && (
                    <AssetImage
                      src={asset.imageUrl}
                      alt={asset.name}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}

                  <FieldGrid>
                    <FieldCell>
                      <Typography intent="label" style={{ fontWeight: 600 }}>Project</Typography>
                      <Typography intent="body">{projectName}</Typography>
                    </FieldCell>
                    <FieldCell>
                      <Typography intent="label" style={{ fontWeight: 600 }}>Type</Typography>
                      <Typography intent="body">{capitalize(asset.type)}</Typography>
                    </FieldCell>
                    <FieldCell>
                      <Typography intent="label" style={{ fontWeight: 600 }}>Trade</Typography>
                      <Typography intent="body">{capitalize(asset.trade)}</Typography>
                    </FieldCell>

                    <FieldCell>
                      <Typography intent="label" style={{ fontWeight: 600 }}>Name</Typography>
                      <Typography intent="body">{asset.name}</Typography>
                    </FieldCell>
                    <FieldCell>
                      <Typography intent="label" style={{ fontWeight: 600 }}>ID</Typography>
                      <Typography intent="body">{asset.assetCode}</Typography>
                    </FieldCell>
                    <FieldCell>
                      <Typography intent="label" style={{ fontWeight: 600 }}>Status</Typography>
                      <Typography intent="body">{STATUS_LABELS[asset.status]}</Typography>
                    </FieldCell>

                    {asset.description && (
                      <FieldCellWide>
                        <Typography intent="label" style={{ fontWeight: 600 }}>Description</Typography>
                        <Typography intent="body">{asset.description}</Typography>
                      </FieldCellWide>
                    )}

                    <FieldCell>
                      <Typography intent="label" style={{ fontWeight: 600 }}>Serial Number</Typography>
                      <Typography intent="body">{asset.serialNumber ?? "—"}</Typography>
                    </FieldCell>
                    <FieldCell>
                      <Typography intent="label" style={{ fontWeight: 600 }}>Warranty Expiration Date</Typography>
                      <Typography intent="body">{asset.warrantyExpiry ? formatDateMMDDYYYY(asset.warrantyExpiry) : "—"}</Typography>
                    </FieldCell>
                    <FieldCell>
                      <Typography intent="label" style={{ fontWeight: 600 }}>Condition</Typography>
                      <Typography intent="body">{capitalize(asset.condition)}</Typography>
                    </FieldCell>

                    <FieldCell>
                      <Typography intent="label" style={{ fontWeight: 600 }}>Manufacturer</Typography>
                      <Typography intent="body">{asset.manufacturer ?? "—"}</Typography>
                    </FieldCell>
                    <FieldCell>
                      <Typography intent="label" style={{ fontWeight: 600 }}>Model</Typography>
                      <Typography intent="body">{asset.model ?? "—"}</Typography>
                    </FieldCell>
                    <FieldCell>
                      <Typography intent="label" style={{ fontWeight: 600 }}>Install Date</Typography>
                      <Typography intent="body">{asset.installDate ? formatDateMMDDYYYY(asset.installDate) : "—"}</Typography>
                    </FieldCell>

                    <FieldCell>
                      <Typography intent="label" style={{ fontWeight: 600 }}>Created</Typography>
                      <Typography intent="body">{formatDateMMDDYYYY(asset.createdAt)}</Typography>
                    </FieldCell>
                    <FieldCell>
                      <Typography intent="label" style={{ fontWeight: 600 }}>Last Modified</Typography>
                      <Typography intent="body">{formatDateMMDDYYYY(asset.updatedAt)}</Typography>
                    </FieldCell>
                    <FieldCell>
                      <Typography intent="label" style={{ fontWeight: 600 }}>Created By</Typography>
                      <Typography intent="body">{asset.createdBy}</Typography>
                    </FieldCell>
                  </FieldGrid>
                </Card>
              )}

              {activeTab === "Related Items" && (
                <Card style={{ padding: 24, background: "var(--color-surface-primary)" }}>
                  <Box padding="xl" style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
                    <Typography intent="body">No related items.</Typography>
                  </Box>
                </Card>
              )}

              {activeTab === "Attachments" && (
                <Card style={{ padding: 24, background: "var(--color-surface-primary)" }}>
                  <Box padding="xl" style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
                    <Typography intent="body">No attachments.</Typography>
                  </Box>
                </Card>
              )}

              {activeTab === "Change History" && (
                <Card style={{ padding: 24, background: "var(--color-surface-primary)" }}>
                  <Box padding="xl" style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
                    <Typography intent="body">No change history available.</Typography>
                  </Box>
                </Card>
              )}
            </Page.Body>
          </Page.Main>
        </Page>
      </Tearsheet>
    </>
  );
}
