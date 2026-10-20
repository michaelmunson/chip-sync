import React from "react";

/** Scrollable body of a dialog. `flush` removes padding for edge-to-edge lists. */
export default function ModalContent({
  children,
  flush = false,
}: {
  children: React.ReactNode;
  flush?: boolean;
}) {
  return (
    <div className={`dialog-content${flush ? " dialog-content--flush" : ""}`}>
      {children}
    </div>
  );
}
