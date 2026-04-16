import React, { useCallback, useEffect, useRef } from "react";
import { Button, Modal, Typography, colors } from "@procore/core-react";
import { Warning } from "@procore/core-icons";
import type { ProjectCurve } from "./capitalPlanningData";

/**
 * Shown when the user changes Curve away from Manual for a line item.
 * Figma: https://www.figma.com/design/wbjpyOCTw2MQaOzx4ibk6r/Capital-Planning?node-id=3615-152732
 *
 * Explicit footer (not `Modal.FooterButtons`) so primary / cancel behavior is predictable.
 */
export function CurveChangeFromManualModal({
  open,
  rowId,
  nextCurve,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  rowId: string | null;
  nextCurve: ProjectCurve;
  onCancel: () => void;
  onConfirm: (rowId: string, nextCurve: ProjectCurve) => void;
}) {
  const lastRowIdRef = useRef<string | null>(null);
  const lastNextCurveRef = useRef<ProjectCurve>(nextCurve);

  useEffect(() => {
    if (rowId) {
      lastRowIdRef.current = rowId;
    }
  }, [rowId]);

  useEffect(() => {
    lastNextCurveRef.current = nextCurve;
  }, [nextCurve]);

  const handleUpdateClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const id = rowId ?? lastRowIdRef.current;
      const curve = nextCurve ?? lastNextCurveRef.current;
      if (!id) {
        onCancel();
        return;
      }
      onConfirm(id, curve);
    },
    [nextCurve, onCancel, onConfirm, rowId]
  );

  return (
    <Modal
      open={open}
      onClose={onCancel}
      howToClose={["x", "scrim"]}
      role="dialog"
      aria-labelledby="update-to-calculated-curve-modal-title"
      width="md"
      placement="center"
    >
      <Modal.Header>
        <Warning
          size="lg"
          aria-hidden
          style={{ color: colors.yellow40, flexShrink: 0, marginRight: 8 }}
        />
        <Modal.Heading id="update-to-calculated-curve-modal-title" level={2}>
          Update to Calculated Curve?
        </Modal.Heading>
      </Modal.Header>
      <Modal.Body>
        <Typography intent="body" color="gray45" style={{ lineHeight: 1.5 }}>
          Any manually entered spread values will be permanently lost when changing the curve type from manual to
          calculated. Are you sure you want to continue?
        </Typography>
      </Modal.Body>
      <Modal.Footer>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "flex-end",
            gap: 8,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Button type="button" variant="tertiary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleUpdateClick}
          >
            Update
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
