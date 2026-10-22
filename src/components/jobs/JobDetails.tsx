import DirectionsOutlined from "@mui/icons-material/DirectionsOutlined";
import FactoryOutlined from "@mui/icons-material/FactoryOutlined";
import MyLocationOutlined from "@mui/icons-material/MyLocationOutlined";
import PersonOutlineOutlined from "@mui/icons-material/PersonOutlineOutlined";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import { Alert, Button, MenuItem, Skeleton, TextField } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { JobStatus, Marker, User } from "../../types/dataTypes";
import { ModalConfig, ToggleModal } from "../../types/generalTypes";
import { JobsAPI, JobBundle, routeStopsForPlan } from "../../utils/jobs";
import { Geo } from "../../utils/location";
import { markerKind } from "../../utils/markers";
import ModalButtons from "../arborist/arboristComponents/modalComponents/modalUtils/ModalButtons";
import ModalContent from "../arborist/arboristComponents/modalComponents/modalUtils/ModalContent";
import EmptyState from "../utils/EmptyState";
import { JobMaterialPill, JobStatusPill } from "./JobStatusPill";

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
              <JobStatusPill status={job.status} />
              {job.produces.map((p) => (
                <JobMaterialPill material={p} key={p} />
              ))}
            </div>
          </div>
        </div>

        {job.notes && (
          <>
            <div className="section-label">Notes</div>
            <div className="group">
              <div className="info-row">
                <div className="info-row-body">
                  <div className="info-row-value pre-wrap">{job.notes}</div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="section-label">Crew</div>
        {assignments.length === 0 ? (
          <div className="group">
            <div className="info-row">
              <div className="info-row-body">
                <div className="info-row-value muted">No one assigned.</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="group">
            {assignments.map((a) => (
              <div className="group-row" key={a.id}>
                <PersonOutlineOutlined className="group-row-icon" />
                <span className="group-row-body">
                  <span className="group-row-title">{memberName(userData, a.userId)}</span>
                  {a.jobSiteMarkerId && (
                    <span className="group-row-sub">
                      {markerName(markers, a.jobSiteMarkerId)}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="section-label">Routes</div>
        {routingPlans.length === 0 ? (
          <div className="group">
            <div className="info-row">
              <div className="info-row-body">
                <div className="info-row-value muted">No routes were generated.</div>
              </div>
            </div>
          </div>
        ) : (
          routingPlans.map((plan) => {
            const stops = routeStopsForPlan(plan, markers);
            const routeHref = Geo.getRouteURL({
              mapChoice: userData.mapChoice,
              stops: stops.map((m) => ({ latitude: m.latitude, longitude: m.longitude })),
            });
            const appName = userData.mapChoice === "google" ? "Google Maps" : "Apple Maps";
            return (
              <div className="group routing-plan" key={plan.id}>
                <div className="routing-plan-title">{memberName(userData, plan.userId)}</div>
                <ol className="routing-stops">
                  <li>
                    <MyLocationOutlined fontSize="small" />
                    <span>Your current location</span>
                  </li>
                  <li>
                    <PlaceOutlined fontSize="small" />
                    <span>
                      {plan.dropSiteMarkerIds[0]
                        ? markerName(markers, plan.dropSiteMarkerIds[0])
                        : "No drop site nearby"}
                      <small>Drop site</small>
                    </span>
                  </li>
                  <li>
                    <FactoryOutlined fontSize="small" />
                    <span>
                      {markerName(markers, plan.facilityMarkerId)}
                      <small>Facility</small>
                    </span>
                  </li>
                </ol>
                {routeHref ? (
                  <Button
                    variant="outlined"
                    startIcon={<DirectionsOutlined />}
                    href={routeHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in {appName}
                  </Button>
                ) : (
                  <p className="muted">No drop site or facility to route to.</p>
                )}
              </div>
            );
          })
        )}

        <div className="section-label">Status</div>
        <TextField
          select
          label="Status"
          value={job.status}
          disabled={updating}
          onChange={(event) => setStatus(event.target.value as JobStatus)}
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
