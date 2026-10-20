import React from "react";

/** Sticky action footer of a dialog. */
export default function ModalButtons({
  children,
  split = false,
}: {
  children: React.ReactNode;
  split?: boolean;
}) {
  return (
    <div className={`dialog-footer${split ? " dialog-footer--split" : ""}`}>
      {children}
    </div>
  );
}
