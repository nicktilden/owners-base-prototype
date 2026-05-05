import React, { useEffect, useState, type ChangeEvent } from "react";
import { Button, Modal, TextArea, TextInput, Typography } from "@procore/core-react";

/**
 * Create / edit snapshot — Capital Planning (Figma node 1893-294458).
 * https://www.figma.com/design/wbjpyOCTw2MQaOzx4ibk6r/Capital-Planning?node-id=1893-294458
 */

function formatSnapshotDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export type CreateSnapshotModalMode = "create" | "edit";

export function CreateSnapshotModal({
  open,
  onClose,
  mode = "create",
  /** Read-only; replace with signed-in user when auth exists. */
  createdByLabel = "Alex Rivera",
  heading,
  submitLabel,
  initialName = "",
  initialDescription = "",
  capturedAt,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  mode?: CreateSnapshotModalMode;
  createdByLabel?: string;
  heading?: string;
  submitLabel?: string;
  initialName?: string;
  initialDescription?: string;
  /** Defaults to “now” when opening create. */
  capturedAt?: Date;
  onSubmit?: (payload: { name: string; description: string }) => void;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [capturedAtLocal, setCapturedAtLocal] = useState(() => capturedAt ?? new Date());

  useEffect(() => {
    if (!open) return;
    setName(mode === "edit" ? initialName : "");
    setDescription(mode === "edit" ? initialDescription : "");
    setCapturedAtLocal(capturedAt ?? new Date());
  }, [open, mode, initialName, initialDescription, capturedAt]);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0;

  const resolvedHeading =
    heading ?? (mode === "edit" ? "Edit Snapshot" : "Create snapshot");
  const resolvedSubmit =
    submitLabel ?? (mode === "edit" ? "Save" : "Create snapshot");

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit?.({ name: trimmedName, description: description.trim() });
    onClose();
  }

  const dateLabel = formatSnapshotDate(capturedAtLocal);

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
        <Modal.Heading level={2}>{resolvedHeading}</Modal.Heading>
      </Modal.Header>
      <Modal.Body>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              paddingBottom: 4,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
              <Typography intent="small" weight="bold" as="span" style={{ display: "block" }}>
                Created by
              </Typography>
              <Typography intent="small" style={{ margin: 0 }}>
                {createdByLabel}
              </Typography>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
              <Typography intent="small" weight="bold" as="span" style={{ display: "block" }}>
                Date
              </Typography>
              <Typography intent="small" style={{ margin: 0 }}>
                {dateLabel}
              </Typography>
            </div>
          </div>

          <div>
            <label
              htmlFor="capital-planning-snapshot-name"
              style={{ display: "block", marginBottom: 6, cursor: "pointer" }}
            >
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
            <label
              htmlFor="capital-planning-snapshot-description"
              style={{ display: "block", marginBottom: 6, cursor: "pointer" }}
            >
              <Typography intent="small" weight="bold">
                Description
              </Typography>
            </label>
            <TextArea
              id="capital-planning-snapshot-description"
              name="snapshotDescription"
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.currentTarget.value)
              }
              placeholder="Enter description"
              rows={4}
              resize="vertical"
              style={{ width: "100%", minHeight: 96 }}
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Modal.FooterButtons>
          <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
            {resolvedSubmit}
          </Button>
        </Modal.FooterButtons>
      </Modal.Footer>
    </Modal>
  );
}
