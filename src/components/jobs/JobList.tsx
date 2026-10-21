import AddOutlined from "@mui/icons-material/AddOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import { Alert, Button, Skeleton, Tab, Tabs } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { Job, JobStatus, User } from "../../types/dataTypes";
import { ToggleModal } from "../../types/generalTypes";
import { JobsAPI } from "../../utils/jobs";
import ModalContent from "../arborist/arboristComponents/modalComponents/modalUtils/ModalContent";
import EmptyState from "../utils/EmptyState";

type TabFilter = "active" | "past";

function statusLabel(status: JobStatus) {
  switch (status) {
    case "planned":
      return "Planned";
    case "active":
      return "Active";
    case "done":
      return "Done";
    case "cancelled":
      return "Cancelled";
  }
}

function ListSkeleton() {
  return (
    <ul className="card-list" aria-busy="true" aria-label="Loading jobs">
      {[0, 1, 2].map((i) => (
        <li key={i}>
          <Skeleton variant="rounded" height={76} />
        </li>
      ))}
    </ul>
  );
}

export default function JobList({
  userData,
  toggleModal,
}: {
  userData: User;
  toggleModal: ToggleModal;
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<TabFilter>("active");

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    JobsAPI.listJobs(userData.organization.id)
      .then((rows) => {
        if (!cancelled) setJobs(rows);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn’t load jobs.");
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [userData.organization.id]);

  const active = useMemo(
    () => jobs.filter((j) => j.status === "planned" || j.status === "active"),
    [jobs],
  );
  const past = useMemo(
    () => jobs.filter((j) => j.status === "done" || j.status === "cancelled"),
    [jobs],
  );
  const visible = tab === "active" ? active : past;

  return (
    <>
      <div className="modal-toolbar">
        <Tabs
          className="segmented-tabs"
          value={tab}
          onChange={(_, value: TabFilter) => setTab(value)}
          aria-label="Filter jobs"
        >
          <Tab
            value="active"
            disableRipple
            label={
              <>
                Active<span className="tab-count">{active.length}</span>
              </>
            }
          />
          <Tab
            value="past"
            disableRipple
            label={
              <>
                Past<span className="tab-count">{past.length}</span>
              </>
            }
          />
        </Tabs>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddOutlined />}
          onClick={() => toggleModal(true, { type: "job-form", back: { type: "job-list" } })}
        >
          New job
        </Button>
      </div>
      <ModalContent flush>
        {error && (
          <Alert severity="warning" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
        {!ready ? (
          <ListSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<WorkOutlineOutlined />}
            title={tab === "active" ? "No active jobs" : "No past jobs"}
            description={
              tab === "active"
                ? "Create a job to link facilities, job sites, and crew — routing plans are built automatically."
                : "Completed and cancelled jobs will show up here."
            }
            action={
              tab === "active" ? (
                <Button
                  variant="contained"
                  onClick={() =>
                    toggleModal(true, { type: "job-form", back: { type: "job-list" } })
                  }
                >
                  Create a job
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul className="card-list">
            {visible.map((job) => (
              <li className="card" key={job.id}>
                <button
                  type="button"
                  className="card-main"
                  onClick={() =>
                    toggleModal(true, {
                      type: "job-details",
                      data: { jobId: job.id },
                      back: { type: "job-list" },
                    })
                  }
                >
                  <span className="tile tile--work" aria-hidden="true">
                    <WorkOutlineOutlined fontSize="small" />
                  </span>
                  <span className="card-body">
                    <span className="card-title truncate">{job.name}</span>
                    <span className="card-sub truncate">
                      {job.produces.map((p) => (p === "wood" ? "Logs" : p === "chips" ? "Chips" : "Both")).join(" · ")}
                      {job.notes ? ` · ${job.notes}` : ""}
                    </span>
                    <span className="pill-row">
                      <span className="pill">{statusLabel(job.status)}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </ModalContent>
    </>
  );
}
