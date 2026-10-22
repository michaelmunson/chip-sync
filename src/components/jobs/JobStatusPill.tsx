import React from "react";
import { JobStatus, MaterialType } from "../../types/dataTypes";

export const JOB_STATUS: Record<JobStatus, { label: string; tone: string }> = {
  planned: { label: "Planned", tone: "work" },
  active: { label: "Active", tone: "chips" },
  done: { label: "Done", tone: "plain" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

export function JobStatusPill({ status }: { status: JobStatus }) {
  const { label, tone } = JOB_STATUS[status];
  return <span className={`pill pill--${tone}`}>{label}</span>;
}

const MATERIAL: Record<MaterialType, { label: string; tone: string }> = {
  wood: { label: "Logs", tone: "wood" },
  chips: { label: "Chips", tone: "chips" },
  both: { label: "Logs & chips", tone: "brand" },
};

export function JobMaterialPill({ material }: { material: MaterialType }) {
  const { label, tone } = MATERIAL[material];
  return <span className={`pill pill--${tone}`}>{label}</span>;
}
