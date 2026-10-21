import DirectionsOutlined from "@mui/icons-material/DirectionsOutlined";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import { Alert, Button, MenuItem, Skeleton, TextField } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { JobStatus, Marker, User } from "../../types/dataTypes";
import { ModalConfig, ToggleModal } from "../../types/generalTypes";
import { JobsAPI, JobBundle } from "../../utils/jobs";
import { Geo } from "../../utils/location";
import { markerKind } from "../../utils/markers";
import ModalButtons from "../arborist/arboristComponents/modalComponents/modalUtils/ModalButtons";
import ModalContent from "../arborist/arboristComponents/modalComponents/modalUtils/ModalContent";
import EmptyState from "../utils/EmptyState";

function memberName(userData: User, userId: string) {
  const user = userData.organization.users.find((u) => u.id === userId);
  return user ? `${user.firstName} ${user.lastName}`.trim() : "Crew member";
}

function markerName(markers: Marker[], id: string | null | undefined) {
  if (!id) return "—";
  return markers.find((m) => m.id === id)?.name ?? "Unknown location";
}

export default function JobDetails({
  jobId,
  userData,
  toggleModal,
  back,
}: {
  jobId: string;
  userData: User;
  toggleModal: ToggleModal;
  back?: ModalConfig;
}) {
  const [bundle, setBundle] = useState<JobBundle | null>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [updating, setUpdating] = useState(false);

  const markers = useMemo(
    () => userData.organization.markers.map((m) => ({ ...m, kind: markerKind(m) })),
    [userData.organization.markers],
  );

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    JobsAPI.getJobBundle(jobId)
      .then((data) => {
        if (!cancelled) setBundle(data);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn’t load this job.");
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const openMaps = (markerId: string | null | undefined) => {
    const marker = markers.find((m) => m.id === markerId);
    if (!marker) return;
    window.open(
      Geo.getAddressURL({ mapChoice: userData.mapChoice, address: marker.address }),
      "_blank",
      "noopener,noreferrer",
    );
  };

  const setStatus = async (status: JobStatus) => {
    if (!bundle) return;
    setUpdating(true);
    try {
      const job = await JobsAPI.updateJobStatus(bundle.job.id, status);
      setBundle({ ...bundle, job });
    } catch {
      setError("Couldn’t update job status.");
    } finally {
      setUpdating(false);
    }
  };

  if (!ready) {
    return (
      <ModalContent>
        <Skeleton variant="rounded" height={120} />
        <Skeleton variant="rounded" height={180} sx={{ mt: 2 }} />
      </ModalContent>
    );
  }

  if (!bundle) {
    return (
      <ModalContent>
        <EmptyState
          icon={<WorkOutlineOutlined />}
          title="Job unavailable"
          description={error || "This job was removed."}
          action={
            <Button
              variant="outlined"
              onClick={() => toggleModal(true, back ?? { type: "job-list" })}
            >
              Back to jobs
            </Button>
          }
        />
      </ModalContent>
    );
  }

  const { job, assignments, routingPlans } = bundle;

  return (
    <>
      <ModalContent>
        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <div className="detail-hero">
          <span className="tile tile--lg tile--work" aria-hidden="true">
            <WorkOutlineOutlined />
          </span>
          <div>
            <h3>{job.name}</h3>
            <div className="pill-row">
              <span className="pill">{job.status}</span>
              {job.produces.map((p) => (
                <span className="pill" key={p}>
                  {p === "wood" ? "Logs" : p === "chips" ? "Chips" : "Both"}
                </span>
              ))}
            </div>
          </div>
        </div>

        {job.notes && (
          <div className="group">
            <div className="section-label">Notes</div>
            <p>{job.notes}</p>
          </div>
        )}

        <div className="group">
          <div className="section-label">Crew</div>
          {assignments.length === 0 ? (
            <p className="muted">No one assigned.</p>
          ) : (
            <ul className="plain-list">
              {assignments.map((a) => (
                <li key={a.id}>
                  <strong>{memberName(userData, a.userId)}</strong>
                  {a.jobSiteMarkerId && (
                    <span className="muted">
                      {" "}
                      · {markerName(markers, a.jobSiteMarkerId)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="group">
          <div className="section-label">Routing plans</div>
          {routingPlans.length === 0 ? (
            <p className="muted">No routing plans were generated.</p>
          ) : (
            routingPlans.map((plan) => (
              <div className="routing-plan" key={plan.id}>
                <strong>{memberName(userData, plan.userId)}</strong>
                <ol className="routing-stops">
                  <li>
                    <PlaceOutlined fontSize="small" />
                    <span>
                      Facility: {markerName(markers, plan.facilityMarkerId)}
                    </span>
                    {plan.facilityMarkerId && (
                      <Button
                        size="small"
                        startIcon={<DirectionsOutlined />}
                        onClick={() => openMaps(plan.facilityMarkerId)}
                      >
                        Map
                      </Button>
                    )}
                  </li>
                  <li>
                    <PlaceOutlined fontSize="small" />
                    <span>
                      Job site: {markerName(markers, plan.jobSiteMarkerId)}
                    </span>
                    {plan.jobSiteMarkerId && (
                      <Button
                        size="small"
                        startIcon={<DirectionsOutlined />}
                        onClick={() => openMaps(plan.jobSiteMarkerId)}
                      >
                        Map
                      </Button>
                    )}
                  </li>
                  <li>
                    <PlaceOutlined fontSize="small" />
                    <span>
                      Drop sites:{" "}
                      {plan.dropSiteMarkerIds.length
                        ? plan.dropSiteMarkerIds
                            .map((id) => markerName(markers, id))
                            .join(", ")
                        : "None nearby"}
                    </span>
                  </li>
                </ol>
                {plan.dropSiteMarkerIds[0] && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DirectionsOutlined />}
                    onClick={() => openMaps(plan.dropSiteMarkerIds[0])}
                  >
                    Nearest drop
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        <TextField
          select
          label="Status"
          value={job.status}
          disabled={updating}
          onChange={(event) => setStatus(event.target.value as JobStatus)}
          sx={{ mt: 1 }}
        >
          <MenuItem value="planned">Planned</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="done">Done</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </TextField>
      </ModalContent>
      <ModalButtons>
        <Button
          variant="outlined"
          onClick={() => toggleModal(true, back ?? { type: "job-list" })}
        >
          Back
        </Button>
      </ModalButtons>
    </>
  );
}
