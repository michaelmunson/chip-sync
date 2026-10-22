import ApartmentOutlined from "@mui/icons-material/ApartmentOutlined";
import CheckIcon from "@mui/icons-material/Check";
import ConstructionOutlined from "@mui/icons-material/ConstructionOutlined";
import EditLocationAltOutlinedIcon from "@mui/icons-material/EditLocationAltOutlined";
import ForestOutlined from "@mui/icons-material/ForestOutlined";
import { Alert, Button, CircularProgress, MenuItem, TextField } from "@mui/material";
import React, { useState } from "react";
import { Marker, MarkerKind } from "../../../../types/dataTypes";
import { Coordinates } from "../../../../types/generalTypes";
import { addDaysISO, KIND_LABEL, localISODate, markerKind } from "../../../../utils/markers";
import {
  Material,
  MaterialIcon,
  materialsOf,
  typeFromMaterials,
} from "../../../utils/Material";
import PhotoPicker from "../../../utils/PhotoPicker";
import ModalButtons from "./modalUtils/ModalButtons";
import ModalContent from "./modalUtils/ModalContent";

type DatePreset = "today" | "week" | "custom";

export interface MarkerFormValues {
  type: Marker["type"];
  kind: MarkerKind;
  startDate: string | null;
  endDate: string | null;
  name: string;
  address: string;
  description: string;
  contact: { name: string; phone: string };
  latitude: number;
  longitude: number;
  keepImages: string[];
  newPhotos: File[];
}

/** Form state that survives a round trip to the map to move the pin. */
export interface MarkerFormDraft {
  kind: MarkerKind;
  materials: Material[];
  name: string;
  address: string;
  description: string;
  contactName: string;
  contactPhone: string;
  startDate: string;
  endDate: string;
  datePreset: DatePreset;
  keepImages: string[];
  newPhotos: File[];
}

interface MarkerFormProps {
  initial?: Marker;
  position: Coordinates;
  address: string;
  draft?: MarkerFormDraft;
  /** When set, the kind picker is hidden and this kind is locked. */
  lockedKind?: MarkerKind;
  submitLabel: string;
  cancelLabel?: string;
  onSubmit: (values: MarkerFormValues) => Promise<void>;
  onCancel: () => void;
  onChangeLocation: (draft: MarkerFormDraft) => void;
}

const KIND_OPTIONS: Array<{ value: MarkerKind; title: string; hint: string; icon: React.ReactNode }> = [
  {
    value: "dropSite",
    title: "Drop site",
    hint: "Accepts chips or logs",
    icon: <ForestOutlined fontSize="small" />,
  },
  {
    value: "facility",
    title: "Facility",
    hint: "HQ, office, or truck depot",
    icon: <ApartmentOutlined fontSize="small" />,
  },
  {
    value: "jobSite",
    title: "Job site",
    hint: "Temporary work location",
    icon: <ConstructionOutlined fontSize="small" />,
  },
];

const MATERIAL_OPTIONS: Array<{ value: Material; title: string; hint: string }> = [
  { value: "chips", title: "Chips", hint: "Wood chips & mulch" },
  { value: "wood", title: "Wood", hint: "Logs & firewood" },
];

function presetFromDates(start: string | null, end: string | null): DatePreset {
  if (!start || !end) return "today";
  const today = localISODate();
  if (start === today && end === today) return "today";
  if (start === today && end === addDaysISO(today, 6)) return "week";
  return "custom";
}

export default function MarkerForm({
  initial,
  position,
  address: initialAddress,
  draft,
  lockedKind,
  submitLabel,
  cancelLabel = "Cancel",
  onSubmit,
  onCancel,
  onChangeLocation,
}: MarkerFormProps) {
  const initialKind = lockedKind ?? draft?.kind ?? (initial ? markerKind(initial) : "dropSite");
  const [kind, setKind] = useState<MarkerKind>(initialKind);
  const [materials, setMaterials] = useState<Set<Material>>(
    () =>
      new Set(
        draft?.materials ??
          (initial && markerKind(initial) === "dropSite" ? materialsOf(initial.type) : []),
      ),
  );
  const [name, setName] = useState(draft?.name ?? initial?.name ?? "");
  const [address, setAddress] = useState(draft?.address ?? initialAddress);
  const [description, setDescription] = useState(draft?.description ?? initial?.description ?? "");
  const [contactName, setContactName] = useState(draft?.contactName ?? initial?.contact?.name ?? "");
  const [contactPhone, setContactPhone] = useState(
    draft?.contactPhone ?? initial?.contact?.phone ?? "",
  );
  const [startDate, setStartDate] = useState(
    draft?.startDate ?? initial?.startDate ?? localISODate(),
  );
  const [endDate, setEndDate] = useState(draft?.endDate ?? initial?.endDate ?? localISODate());
  const [datePreset, setDatePreset] = useState<DatePreset>(
    draft?.datePreset ??
      presetFromDates(initial?.startDate ?? null, initial?.endDate ?? null),
  );
  const [keepImages, setKeepImages] = useState<string[]>(
    draft?.keepImages ?? initial?.images ?? [],
  );
  const [newPhotos, setNewPhotos] = useState<File[]>(draft?.newPhotos ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleMaterial = (material: Material) =>
    setMaterials((current) => {
      const next = new Set(current);
      if (next.has(material)) next.delete(material);
      else next.add(material);
      return next;
    });

  const applyPreset = (preset: DatePreset) => {
    setDatePreset(preset);
    const today = localISODate();
    if (preset === "today") {
      setStartDate(today);
      setEndDate(today);
    } else if (preset === "week") {
      setStartDate(today);
      setEndDate(addDaysISO(today, 6));
    }
  };

  const materialsOk = kind !== "dropSite" || materials.size > 0;
  const datesOk = kind !== "jobSite" || (Boolean(startDate) && Boolean(endDate) && endDate >= startDate);
  const valid = materialsOk && datesOk && name.trim() !== "" && address.trim() !== "";

  const currentDraft = (): MarkerFormDraft => ({
    kind,
    materials: [...materials],
    name,
    address,
    description,
    contactName,
    contactPhone,
    startDate,
    endDate,
    datePreset,
    keepImages,
    newPhotos,
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    setError("");
    try {
      await onSubmit({
        type: kind === "dropSite" ? typeFromMaterials(materials) : "both",
        kind,
        startDate: kind === "jobSite" ? startDate : null,
        endDate: kind === "jobSite" ? endDate : null,
        name: name.trim(),
        address: address.trim(),
        description: description.trim(),
        contact: { name: contactName.trim(), phone: contactPhone.trim() },
        latitude: position.latitude,
        longitude: position.longitude,
        keepImages,
        newPhotos,
      });
    } catch (err) {
      console.error(err);
      setError(
        newPhotos.length
          ? "We couldn’t save this location. Check your connection, or try again without photos."
          : "We couldn’t save this location. Check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="dialog-form" onSubmit={handleSubmit} noValidate>
      <ModalContent>
        <div className="form">
          {error && (
            <Alert severity="error" role="alert">
              {error}
            </Alert>
          )}

          {!lockedKind && (
            <section className="form-section" aria-labelledby="form-kind">
              <div className="form-section-head">
                <h3 id="form-kind">Location type</h3>
              </div>
              <div className="choice-grid">
                {KIND_OPTIONS.map(({ value, title, hint, icon }) => (
                  <button
                    type="button"
                    key={value}
                    className="choice"
                    aria-pressed={kind === value}
                    onClick={() => setKind(value)}
                  >
                    <span className={`tile tile--${value}`} aria-hidden="true">
                      {icon}
                    </span>
                    <span>
                      <strong>{title}</strong>
                      <small>{hint}</small>
                    </span>
                    <span className="choice-check" aria-hidden="true">
                      <CheckIcon />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {kind === "dropSite" && (
            <section className="form-section" aria-labelledby="form-materials">
              <div className="form-section-head">
                <h3 id="form-materials">Accepted materials</h3>
                <span>Choose at least one</span>
              </div>
              <div className="choice-grid">
                {MATERIAL_OPTIONS.map(({ value, title, hint }) => (
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
                      <small>{hint}</small>
                    </span>
                    <span className="choice-check" aria-hidden="true">
                      <CheckIcon />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {kind === "jobSite" && (
            <section className="form-section" aria-labelledby="form-dates">
              <div className="form-section-head">
                <h3 id="form-dates">Active dates</h3>
                <span>When this site is live</span>
              </div>
              <TextField
                select
                label="Duration"
                value={datePreset}
                onChange={(event) => applyPreset(event.target.value as DatePreset)}
              >
                <MenuItem value="today">Just today</MenuItem>
                <MenuItem value="week">Next seven days</MenuItem>
                <MenuItem value="custom">Custom range</MenuItem>
              </TextField>
              {datePreset === "custom" && (
                <div className="field-row">
                  <TextField
                    type="date"
                    label="Start"
                    value={startDate}
                    InputLabelProps={{ shrink: true }}
                    onChange={(event) => setStartDate(event.target.value)}
                  />
                  <TextField
                    type="date"
                    label="End"
                    value={endDate}
                    InputLabelProps={{ shrink: true }}
                    onChange={(event) => setEndDate(event.target.value)}
                  />
                </div>
              )}
            </section>
          )}

          <section className="form-section" aria-labelledby="form-details">
            <div className="form-section-head">
              <h3 id="form-details">Location</h3>
              <Button
                size="small"
                startIcon={<EditLocationAltOutlinedIcon />}
                onClick={() => onChangeLocation(currentDraft())}
                disabled={saving}
              >
                Move pin
              </Button>
            </div>
            <p className="form-hint">{KIND_LABEL[kind]} at the pin you placed.</p>
            <TextField
              required
              label="Name"
              value={name}
              autoComplete="off"
              onChange={(event) => setName(event.target.value)}
            />
            <TextField
              required
              label="Address"
              value={address}
              autoComplete="street-address"
              helperText="Crews see this address and your pin on the map."
              onChange={(event) => setAddress(event.target.value)}
            />
            <TextField
              multiline
              minRows={2}
              maxRows={5}
              label="Notes (optional)"
              placeholder={
                kind === "dropSite"
                  ? "Gate codes, where to unload, size limits…"
                  : kind === "facility"
                    ? "Office hours, gate code, which trucks park here…"
                    : "Access notes, staging area, client contact…"
              }
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </section>

          <section className="form-section" aria-labelledby="form-photos">
            <div className="form-section-head">
              <h3 id="form-photos">Photos</h3>
              <span>Optional, up to 8</span>
            </div>
            <p className="form-hint">
              Show the entrance, staging area, or where material should go. Helps crews arrive prepared.
            </p>
            <PhotoPicker
              existing={keepImages}
              onExistingChange={setKeepImages}
              files={newPhotos}
              onFilesChange={setNewPhotos}
              disabled={saving}
            />
          </section>

          <section className="form-section" aria-labelledby="form-contact">
            <div className="form-section-head">
              <h3 id="form-contact">On-site contact</h3>
              <span>Optional</span>
            </div>
            <div className="field-row">
              <TextField
                label="Contact name"
                value={contactName}
                autoComplete="off"
                onChange={(event) => setContactName(event.target.value)}
              />
              <TextField
                type="tel"
                label="Phone number"
                value={contactPhone}
                autoComplete="off"
                inputProps={{ inputMode: "tel" }}
                onChange={(event) => setContactPhone(event.target.value)}
              />
            </div>
          </section>
        </div>
      </ModalContent>

      <ModalButtons>
        <Button variant="outlined" onClick={onCancel} disabled={saving}>
          {cancelLabel}
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!valid || saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {saving ? "Saving…" : submitLabel}
        </Button>
      </ModalButtons>
    </form>
  );
}
