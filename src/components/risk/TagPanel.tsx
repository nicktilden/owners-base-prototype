/**
 * TAG PANEL (v7)
 * Risk tagging affordance for source tool detail pages.
 * Two states: untagged ("Tag as risk →" button), tagged (list of tags with edit/close).
 * Supports multiple tags per source item.
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Typography, Pill } from '@procore/core-react';
import { Warning, Check, ArrowRight } from '@procore/core-icons';
import type { RiskTag, RiskTagStatus, SourceType } from '@/types/health';
import { useRiskTags } from '@/context/RiskTagsContext';
import { useData } from '@/context/DataContext';
import TagForm from './TagForm';
import PendingApprovalState from './PendingApprovalState';

// ─── Token maps ───────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<RiskTagStatus, { color: 'red' | 'yellow' | 'green' | 'gray' | 'blue'; label: string }> = {
  open:               { color: 'yellow', label: 'Open' },
  pending_acceptance: { color: 'yellow', label: 'Pending Acceptance' },
  pending_approval:   { color: 'blue',   label: 'Pending Approval' },
  mitigated:          { color: 'green',  label: 'Mitigated' },
  accepted:           { color: 'green',  label: 'Accepted' },
  closed:             { color: 'gray',   label: 'Closed' },
};

// ─── Styled components ────────────────────────────────────────────────────────

const PanelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EmptyState = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px dashed var(--color-border-default);
  border-radius: 6px;
  padding: 8px 12px;
  color: var(--color-text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.12s, color 0.12s;
  &:hover {
    border-color: var(--color-action-primary);
    color: var(--color-action-primary);
  }
  &:focus-visible { outline: 2px solid var(--color-border-focus); outline-offset: 2px; }
`;

const TagRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
`;

const TagDivider = styled.div`
  height: 1px;
  background: var(--color-border-separator);
  margin: 0;
`;

const TagMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

const TagType = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const TagDetail = styled.span`
  font-size: 11px;
  color: var(--color-text-secondary);
`;

const TagActions = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--color-action-primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 0;
  &:hover { text-decoration: underline; }
  &:focus-visible { outline: 2px solid var(--color-border-focus); outline-offset: 2px; }
`;

const AutoBadge = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-action-primary);
  background: color-mix(in srgb, var(--color-action-primary) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-action-primary) 30%, transparent);
  border-radius: 4px;
  padding: 1px 5px;
  line-height: 1.4;
  flex-shrink: 0;
`;

// ─── Component ────────────────────────────────────────────────────────────────

interface TagPanelProps {
  sourceType: SourceType;
  sourceId: string;
  projectId: string;
  prefillImpact?: number;
  prefillProbability?: number;
  readonly?: boolean;
}

export default function TagPanel({
  sourceType,
  sourceId,
  projectId,
  prefillImpact,
  prefillProbability,
  readonly = false,
}: TagPanelProps) {
  const { getRiskTagsForSource, addRiskTag, updateRiskTag, transitionStatus } = useRiskTags();
  const { data } = useData();

  const [showForm, setShowForm] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  const tags = getRiskTagsForSource(sourceId, sourceType);

  function getRiskTypeLabel(riskTypeId: string): string {
    return data.account?.riskTypes.find(rt => rt.id === riskTypeId)?.label ?? riskTypeId;
  }

  function handleSave(tagData: Omit<RiskTag, 'id' | 'createdAt'>) {
    if (editingTagId) {
      updateRiskTag(editingTagId, tagData);
      setEditingTagId(null);
    } else {
      addRiskTag({
        ...tagData,
        id: `tag-${Date.now()}`,
        createdAt: new Date(),
      });
      setShowForm(false);
    }
  }

  function handleClose(tagId: string) {
    transitionStatus(tagId, 'closed');
  }

  if (tags.length === 0 && !showForm) {
    if (readonly) return null;
    return (
      <PanelWrapper>
        <EmptyState
          type="button"
          onClick={() => setShowForm(true)}
          aria-label="Tag this item as a risk"
        >
          <Warning size="sm" />
          Tag as risk
          <ArrowRight size="sm" />
        </EmptyState>
      </PanelWrapper>
    );
  }

  return (
    <PanelWrapper>
      {tags.map((tag, index) => (
        <React.Fragment key={tag.id}>
          {index > 0 && <TagDivider />}
          {editingTagId === tag.id ? (
            <TagForm
              sourceType={sourceType}
              sourceId={sourceId}
              projectId={projectId}
              existingTag={tag}
              onSave={handleSave}
              onCancel={() => setEditingTagId(null)}
            />
          ) : tag.status === 'pending_approval' ? (
            <PendingApprovalState tag={tag} />
          ) : (
            <TagRow>
              <TagMeta>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TagType>{getRiskTypeLabel(tag.riskTypeId)}</TagType>
                  {tag.origin !== 'manual' && <AutoBadge>Auto</AutoBadge>}
                </div>
                <TagDetail>
                  Probability {tag.probability}/5
                  {tag.impact > 0 && ` · $${tag.impact.toLocaleString()} cost`}
                  {tag.scheduleImpact != null && tag.scheduleImpact > 0 && ` · ${tag.scheduleImpact}d schedule`}
                </TagDetail>
              </TagMeta>
              <Pill color={STATUS_STYLES[tag.status].color}>
                {STATUS_STYLES[tag.status].label}
              </Pill>
              {!readonly && tag.status !== 'closed' && (
                <TagActions>
                  <Button
                    variant="tertiary"
                    size="sm"
                    onClick={() => setEditingTagId(tag.id)}
                    aria-label="Edit risk tag"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="tertiary"
                    size="sm"
                    onClick={() => handleClose(tag.id)}
                    aria-label="Close risk tag"
                    icon={<Check />}
                  >
                    Close
                  </Button>
                </TagActions>
              )}
            </TagRow>
          )}
        </React.Fragment>
      ))}

      {showForm && !editingTagId && (
        <TagForm
          sourceType={sourceType}
          sourceId={sourceId}
          projectId={projectId}
          prefillImpact={prefillImpact}
          prefillProbability={prefillProbability}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}

      {!showForm && !editingTagId && !readonly && (
        <AddButton type="button" onClick={() => setShowForm(true)}>
          + Add another risk tag
        </AddButton>
      )}
    </PanelWrapper>
  );
}
