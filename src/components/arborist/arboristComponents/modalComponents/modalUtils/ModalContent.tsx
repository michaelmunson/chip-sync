import React from "react";

export default function ModalContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="dialog-content">{children}</div>;
}
