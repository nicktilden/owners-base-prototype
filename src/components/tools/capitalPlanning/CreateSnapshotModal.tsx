import React, { useEffect, useState, type ChangeEvent } from "react";
import { Button, Modal, TextArea, TextInput, Typography } from "@procore/core-react";

/**
 * Create snapshot — Capital Planning (Figma node 1893-294458).
 * https://www.figma.com/design/wbjpyOCTw2MQaOzx4ibk6r/Capital-Planning?node-id=1893-294458
 */

const readOnlyValueBoxStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  minHeight: 40,
  padding: "10px 12px",
  borderRadius: 4,
  border: "1px solid #d6dadc",
  background: "#f5f6f7",
  display: "flex",
  alignItems: "center",
};

function formatSnapshotDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CreateSnapshotModal({
  open,
  onClose,
  /** Read-only; replace with signed-in user when auth exists. */
  createdByLabel = "Alex Rivera",
}: {
  open: boolean;
  onClose: () => void;
  createdByLabel?: string;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capturedAt, setCapturedAt] = useState(() => new Date());

  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
    setCapturedAt(new Date());
  }, [open]);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      howToClose={["x", "scrim", "footer-button"]}
      role="dialog"
      width="md"
      placement="center"
    >
      <Modal.Header>
        <Modal.Heading level={2}>Create snapshot</Modal.Heading>
      </Modal.Header>
      <Modal.Body>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label htmlFor="capital-planning-snapshot-name" style={{ display: "block", marginBottom: 6, cursor: "pointer" }}>
              <Typography intent="small" weight="bold" as="span">
                Snapshot name
                <span aria-hidden style={{ color: "#c7482d", marginLeft: 2 }}>
                  *
                </span>
              </Typography>
            </label>
            <TextInput
              id="capital-planning-snapshot-name"
              name="snapshotName"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.currentTarget.value)}
              placeholder="Enter snapshot name"
              aria-required
              required
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label htmlFor="capital-planning-snapshot-description" style={{ display: "block", marginBottom: 6, cursor: "pointer" }}>
              <Typography intent="small" weight="bold">
                Description
              </Typography>
            </label>
            <TextArea
              id="capital-planning-snapshot-description"
              name="snapshotDescription"
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.currentTarget.value)}
              placeholder="Enter description"
              rows={4}
              resize="vertical"
              style={{ width: "100%", minHeight: 96 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <Typography
                id="capital-planning-snapshot-created-by-label"
                intent="small"
                weight="bold"
                color="gray45"
                style={{ display: "block", marginBottom: 6 }}
              >
                Created by
              </Typography>
              <div style={readOnlyValueBoxStyle} aria-labelledby="capital-planning-snapshot-created-by-label">
                <Typography intent="small">{createdByLabel}</Typography>
              </div>
            </div>
            <div>
              <Typography
                id="capital-planning-snapshot-date-label"
                intent="small"
                weight="bold"
                color="gray45"
                style={{ display: "block", marginBottom: 6 }}
              >
                Date
              </Typography>
              <div style={readOnlyValueBoxStyle} aria-labelledby="capital-planning-snapshot-date-label">
                <Typography intent="small">{formatSnapshotDate(capturedAt)}</Typography>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Modal.FooterButtons>
          <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
            Create snapshot
          </Button>
        </Modal.FooterButtons>
      </Modal.Footer>
    </Modal>
  );
}
