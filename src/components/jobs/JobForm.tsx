import CheckIcon from "@mui/icons-material/Check";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  TextField,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import { MaterialType, User } from "../../types/dataTypes";
import { ToggleModal } from "../../types/generalTypes";
import { JobsAPI } from "../../utils/jobs";
import { isFacility, isJobSite, markerKind } from "../../utils/markers";
import {
  Material,
  MaterialIcon,
  typeFromMaterials,
} from "../utils/Material";
import ModalButtons from "../arborist/arboristComponents/modalComponents/modalUtils/ModalButtons";
import ModalContent from "../arborist/arboristComponents/modalComponents/modalUtils/ModalContent";

const MATERIAL_OPTIONS: Array<{ value: Material; title: string }> = [
  { value: "chips", title: "Chips" },
  { value: "wood", title: "Logs" },
];

export default function JobForm({
  userData,
  toggleModal,
}: {
  userData: User;
  toggleModal: ToggleModal;
}) {
  const markers = userData.organization.markers.map((m) => ({ ...m, kind: markerKind(m) }));
  const facilities = useMemo(() => markers.filter(isFacility), [markers]);
  const jobSites = useMemo(() => markers.filter(isJobSite), [markers]);
  const members = useMemo(
    () =>
      (userData.organization.users ?? []).filter(
        (user) => user.role === "admin" || user.role === "member",
      ),
    [userData.organization.users],
  );

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [materials, setMaterials] = useState<Set<Material>>(new Set());
  const [facilityIds, setFacilityIds] = useState<string[]>([]);
  const [jobSiteIds, setJobSiteIds] = useState<string[]>([]);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [assigneeSites, setAssigneeSites] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggle = (list: string[], id: string, set: (next: string[]) => void) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const toggleMaterial = (material: Material) =>
    setMaterials((current) => {
      const next = new Set(current);
      if (next.has(material)) next.delete(material);
      else next.add(material);
      return next;
    });

  const valid =
    name.trim() !== "" &&
    materials.size > 0 &&
    jobSiteIds.length > 0 &&
    assigneeIds.length > 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    setError("");
    try {
      const produces: MaterialType[] = [typeFromMaterials(materials)];
      const bundle = await JobsAPI.createJob(userData, {
        name,
        notes,
        produces,
        facilityMarkerIds: facilityIds,
        jobSiteMarkerIds: jobSiteIds,
        assignees: assigneeIds.map((userId) => ({
          userId,
          jobSiteMarkerId: assigneeSites[userId] || jobSiteIds[0] || null,
        })),
      });
      toggleModal(true, {
        type: "job-details",
        data: { jobId: bundle.job.id },
        back: { type: "job-list" },
      });
    } catch {
      setError("We couldn’t create this job. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="dialog-form" onSubmit={handleSubmit} noValidate>
      <ModalContent>
        <div className="form">
          {error && (
            <Alert severity="error" role="alert">
              {error}
            </Alert>
          )}

          <section className="form-section">
            <div className="form-section-head">
              <h3>Job</h3>
            </div>
            <TextField
              required
              label="Job name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="off"
            />
            <TextField
              multiline
              minRows={2}
              maxRows={5}
              label="Notes (what you’ll produce, scope…)"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </section>

          <section className="form-section">
            <div className="form-section-head">
              <h3>Produces</h3>
              <span>Chips, logs, or both</span>
            </div>
            <div className="choice-grid">
              {MATERIAL_OPTIONS.map(({ value, title }) => (
                <button
                  type="button"
                  key={value}
                  className="choice"
                  aria-pressed={materials.has(value)}
                  onClick={() => toggleMaterial(value)}
                >
                  <span className={`tile tile--${value}`} aria-hidden="true">
                    <MaterialIcon type={value} />
                  </span>
                  <span>
                    <strong>{title}</strong>
                  </span>
                  <span className="choice-check" aria-hidden="true">
                    <CheckIcon />
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-head">
              <h3>Facilities</h3>
              <span>Optional start points</span>
            </div>
            {facilities.length === 0 ? (
              <p className="muted">No facilities yet — add one from the map.</p>
            ) : (
              facilities.map((marker) => (
                <FormControlLabel
                  key={marker.id}
                  control={
                    <Checkbox
                      checked={facilityIds.includes(marker.id)}
                      onChange={() => toggle(facilityIds, marker.id, setFacilityIds)}
                    />
                  }
                  label={marker.name}
                />
              ))
            )}
          </section>

          <section className="form-section">
            <div className="form-section-head">
              <h3>Job sites</h3>
              <span>Required</span>
            </div>
            {jobSites.length === 0 ? (
              <p className="muted">Add a job site pin before creating a job.</p>
            ) : (
              jobSites.map((marker) => (
                <FormControlLabel
                  key={marker.id}
                  control={
                    <Checkbox
                      checked={jobSiteIds.includes(marker.id)}
                      onChange={() => toggle(jobSiteIds, marker.id, setJobSiteIds)}
                    />
                  }
                  label={marker.name}
                />
              ))
            )}
          </section>

          <section className="form-section">
            <div className="form-section-head">
              <h3>Assign crew</h3>
              <span>Routing plans are created per person</span>
            </div>
            {members.length === 0 ? (
              <p className="muted">No org members to assign.</p>
            ) : (
              members.map((user) => {
                const checked = assigneeIds.includes(user.id);
                return (
                  <div key={user.id} className="job-assignee-row">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={() => toggle(assigneeIds, user.id, setAssigneeIds)}
                        />
                      }
                      label={`${user.firstName} ${user.lastName}`.trim()}
                    />
                    {checked && jobSiteIds.length > 1 && (
                      <TextField
                        select
                        size="small"
                        label="Job site"
                        value={assigneeSites[user.id] || jobSiteIds[0]}
                        onChange={(event) =>
                          setAssigneeSites((current) => ({
                            ...current,
                            [user.id]: event.target.value,
                          }))
                        }
                      >
                        {jobSiteIds.map((id) => {
                          const site = jobSites.find((m) => m.id === id);
                          return (
                            <MenuItem key={id} value={id}>
                              {site?.name ?? id}
                            </MenuItem>
                          );
                        })}
                      </TextField>
                    )}
                  </div>
                );
              })
            )}
          </section>
        </div>
      </ModalContent>
      <ModalButtons>
        <Button
          variant="outlined"
          onClick={() => toggleModal(true, { type: "job-list" })}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!valid || saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {saving ? "Creating…" : "Create job"}
        </Button>
      </ModalButtons>
    </form>
  );
}
