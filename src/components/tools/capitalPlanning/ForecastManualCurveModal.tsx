import React, { useCallback, useEffect, useRef } from "react";
import { Button, Modal, Typography, colors } from "@procore/core-react";
import { Warning } from "@procore/core-icons";

/**
 * Shown when the user attempts to inline-edit a forecast cell while the project curve is not Manual.
 * Figma: https://www.figma.com/design/wbjpyOCTw2MQaOzx4ibk6r/Capital-Planning?node-id=3615-182695
 */
export function ForecastManualCurveModal({
  open,
  rowId,
  onClose,
  onConfirm,
}: {
  open: boolean;
  rowId: string | null;
  onClose: () => void;
  /** Apply Manual curve for this row and close. */
  onConfirm: (rowId: string) => void;
}) {
  const lastRowIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (rowId) {
      lastRowIdRef.current = rowId;
    }
  }, [rowId]);

  const handleUpdate = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const id = rowId ?? lastRowIdRef.current;
      if (!id) {
        onClose();
        return;
      }
      onConfirm(id);
    },
    [onClose, onConfirm, rowId]
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      howToClose={["x", "scrim"]}
      role="dialog"
      aria-labelledby="forecast-manual-curve-modal-title"
      width="md"
      placement="center"
    >
      <Modal.Header>
        <Warning
          size="lg"
          aria-hidden
          style={{ color: colors.yellow40, flexShrink: 0, marginRight: 8 }}
        />
        <Modal.Heading id="forecast-manual-curve-modal-title" level={2}>
          Update to Manual Curve?
        </Modal.Heading>
      </Modal.Header>
      <Modal.Body>
        <Typography intent="body" color="gray45" style={{ lineHeight: 1.5 }}>
          {"By editing this period, the line item's curve will be changed to 'Manual'."}
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
          <Button type="button" variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleUpdate}
          >
            Update
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
