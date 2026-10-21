import { Button, CircularProgress, Dialog } from "@mui/material";
import React from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children?: React.ReactNode;
  confirmLabel: string;
  tone?: "primary" | "error";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  tone = "primary",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog
      className="confirm-dialog"
      open={open}
      onClose={busy ? undefined : onCancel}
      aria-labelledby="confirm-dialog-title"
    >
      <div className="confirm-body">
        <h2 id="confirm-dialog-title">{title}</h2>
        {children}
      </div>
      <div className="confirm-actions">
        <Button variant="outlined" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color={tone}
          onClick={onConfirm}
          disabled={busy}
          startIcon={busy ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
