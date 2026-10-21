import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { Dialog, IconButton } from "@mui/material";
import React from "react";
import "../../css/modal.css";

interface DialogShellProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onClose: () => void;
  /** Fixed-height sheet (chat), so the body scrolls instead of the dialog growing. */
  tall?: boolean;
  children: React.ReactNode;
}

/** Workspace dialog: header (back / title / close), body, optional footer. Bottom sheet on phones. */
export default function DialogShell({ open, title, subtitle, onBack, onClose, tall, children }: DialogShellProps) {
  return (
    <Dialog
      id="modal"
      aria-labelledby="workspace-dialog-title"
      open={open}
      onClose={onClose}
      PaperProps={{ className: tall ? "dialog--tall" : undefined }}
    >
      <header className={`dialog-header${onBack ? " dialog-header--back" : ""}`}>
        {onBack && (
          <IconButton aria-label="Back" onClick={onBack}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <div className="dialog-heading">
          <h2 id="workspace-dialog-title" className="truncate">
            {title}
          </h2>
          {subtitle && <p className="truncate">{subtitle}</p>}
        </div>
        <IconButton aria-label="Close dialog" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </header>
      {children}
    </Dialog>
  );
}
