/**
 * PORTFOLIO MAP VIEW
 *
 * Renders all (filtered) projects on a Google Map, with markers
 * color-coded by priority:
 *   high   → red    (#c62828)
 *   medium → amber  (#f57c00)
 *   low    → green  (#2e7d32)
 *
 * Clicking a marker opens a compact InfoWindow with the project name,
 * location, budget, stage, and a "View Details" button that fires
 * onOpenProject(row) to open the standard tearsheet.
 *
 * Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY — renders an instructional
 * empty state if the key is absent.
 */

import React, { useCallback, useState } from "react";
import {
  GoogleMap,
  InfoWindowF,
  MarkerF,
  useJsApiLoader,
} from "@react-google-maps/api";
import styled from "styled-components";
import type { ProjectRow } from "@/data/projects";
import type { TabKey } from "@/components/ProjectEditTearsheet";

// ─── Constants ────────────────────────────────────────────────────────────────

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

const MAP_CENTER = { lat: 38.5, lng: -97.0 };
const MAP_ZOOM = 4;

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "640px",
};

/** Minimal map style — subdued to keep markers prominent */
const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
    { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
  ],
};

// ─── Priority colors ──────────────────────────────────────────────────────────

const PRIORITY_FILL: Record<string, string> = {
  high:   "#c62828",
  medium: "#f57c00",
  low:    "#2e7d32",
};

const PRIORITY_LABEL: Record<string, string> = {
  high:   "High",
  medium: "Medium",
  low:    "Low",
};

/** Build an inline SVG data-URI pin icon. */
function makePinSvg(fill: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 26 14 26S28 23.333 28 14C28 6.268 21.732 0 14 0z"
      fill="${fill}" stroke="white" stroke-width="1.5"/>
    <circle cx="14" cy="14" r="6" fill="white"/>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

// ─── Styled components ────────────────────────────────────────────────────────

const Wrapper = styled.div`
  width: 100%;
  height: 640px;
  border: 1px solid var(--color-border-default);
  border-radius: 0;
  overflow: hidden;
  position: relative;
  background: var(--color-surface-secondary);
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-secondary);
  color: var(--color-text-secondary);
  font-size: 14px;
`;

const NoKeyBanner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
  padding: 32px;
  text-align: center;
  color: var(--color-text-secondary);
`;

const NoKeyTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const CodeBlock = styled.code`
  display: block;
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-separator);
  border-radius: 4px;
  padding: 8px 14px;
  font-size: 13px;
  color: var(--color-text-primary);
  white-space: pre;
`;

// ─── Legend ───────────────────────────────────────────────────────────────────

const Legend = styled.div`
  position: absolute;
  bottom: 24px;
  left: 12px;
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-separator);
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  z-index: 1;
  pointer-events: none;
`;

const LegendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-primary);
`;

const LegendDot = styled.span<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

// ─── InfoWindow content ───────────────────────────────────────────────────────

const InfoContent = styled.div`
  font-family: var(--font-family-base, 'Inter', sans-serif);
  min-width: 220px;
  max-width: 280px;
`;

const InfoName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2px;
  line-height: 1.3;
`;

const InfoNumber = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #666;
  margin-bottom: 8px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #444;
  padding: 2px 0;
`;

const InfoLabel = styled.span`
  color: #888;
  margin-right: 8px;
`;

const InfoValue = styled.span`
  font-weight: 500;
`;

const PriorityBadge = styled.span<{ $priority: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  background: ${({ $priority }) =>
    $priority === "high"
      ? "#fce8e6"
      : $priority === "medium"
      ? "#fff3e0"
      : "#e8f5e9"};
  color: ${({ $priority }) =>
    $priority === "high"
      ? "#c62828"
      : $priority === "medium"
      ? "#e65100"
      : "#2e7d32"};
`;

const ViewBtn = styled.button`
  margin-top: 10px;
  width: 100%;
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #ff6600;
  background: #ff6600;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #e55a00; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMoney(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

// ─── Inner map (rendered only after API is loaded) ────────────────────────────

interface MapInnerProps {
  projects: ProjectRow[];
  onOpenProject: (row: ProjectRow, tab?: TabKey) => void;
}

function MapInner({ projects, onOpenProject }: MapInnerProps) {
  const [selected, setSelected] = useState<ProjectRow | null>(null);

  const handleMarkerClick = useCallback((row: ProjectRow) => {
    setSelected(row);
  }, []);

  const handleInfoClose = useCallback(() => {
    setSelected(null);
  }, []);

  const positioned = projects.filter(
    (r) => r.latitude != null && r.longitude != null
  );

  return (
    <Wrapper>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        options={MAP_OPTIONS}
      >
        {positioned.map((row) => (
          <MarkerF
            key={row.id}
            position={{ lat: row.latitude!, lng: row.longitude! }}
            icon={{
              url: makePinSvg(PRIORITY_FILL[row.priority] ?? PRIORITY_FILL.medium),
              scaledSize: new window.google.maps.Size(28, 40),
              anchor: new window.google.maps.Point(14, 40),
            }}
            title={row.name}
            onClick={() => handleMarkerClick(row)}
          />
        ))}

        {selected && selected.latitude != null && selected.longitude != null && (
          <InfoWindowF
            position={{ lat: selected.latitude, lng: selected.longitude }}
            onCloseClick={handleInfoClose}
            options={{ pixelOffset: new window.google.maps.Size(0, -40) }}
          >
            <InfoContent>
              <InfoName>{selected.name}</InfoName>
              <InfoNumber>{selected.number}</InfoNumber>
              <InfoRow>
                <InfoLabel>Location</InfoLabel>
                <InfoValue>{[selected.city, selected.state].filter(Boolean).join(", ")}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Budget</InfoLabel>
                <InfoValue>{fmtMoney(selected.originalBudget)}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Stage</InfoLabel>
                <InfoValue>{selected.stage}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Priority</InfoLabel>
                <PriorityBadge $priority={selected.priority}>
                  {PRIORITY_LABEL[selected.priority]}
                </PriorityBadge>
              </InfoRow>
              <ViewBtn
                onClick={() => {
                  setSelected(null);
                  onOpenProject(selected, "General");
                }}
              >
                View Details
              </ViewBtn>
            </InfoContent>
          </InfoWindowF>
        )}
      </GoogleMap>

      {/* Priority legend */}
      <Legend>
        {(["high", "medium", "low"] as const).map((p) => (
          <LegendRow key={p}>
            <LegendDot $color={PRIORITY_FILL[p]} />
            {PRIORITY_LABEL[p]} Priority
          </LegendRow>
        ))}
      </Legend>
    </Wrapper>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

export interface PortfolioMapViewProps {
  projects: ProjectRow[];
  onOpenProject: (row: ProjectRow, tab?: TabKey) => void;
}

export default function PortfolioMapView({ projects, onOpenProject }: PortfolioMapViewProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: API_KEY,
    id: "portfolio-map",
  });

  if (!API_KEY) {
    return (
      <Wrapper>
        <NoKeyBanner>
          <NoKeyTitle>Google Maps API Key Required</NoKeyTitle>
          <div style={{ fontSize: 13, maxWidth: 420, lineHeight: 1.5 }}>
            Add your key to <strong>.env.local</strong> and restart the dev server:
          </div>
          <CodeBlock>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here</CodeBlock>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
            Get a key at{" "}
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--color-action-primary)" }}
            >
              console.cloud.google.com
            </a>
            {" "}— enable the Maps JavaScript API.
          </div>
        </NoKeyBanner>
      </Wrapper>
    );
  }

  if (loadError) {
    return (
      <Wrapper>
        <LoadingOverlay>
          Failed to load Google Maps — check your API key and network connection.
        </LoadingOverlay>
      </Wrapper>
    );
  }

  if (!isLoaded) {
    return (
      <Wrapper>
        <LoadingOverlay>Loading map…</LoadingOverlay>
      </Wrapper>
    );
  }

  return <MapInner projects={projects} onOpenProject={onOpenProject} />;
}
