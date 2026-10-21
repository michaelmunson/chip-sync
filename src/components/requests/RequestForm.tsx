import CheckIcon from "@mui/icons-material/Check";
import EditLocationAltOutlinedIcon from "@mui/icons-material/EditLocationAltOutlined";
import {
  Alert,
  Button,
  CircularProgress,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import React, { useState } from "react";
import { Coordinates } from "../../types/generalTypes";
import { RequestTiming, ServiceRequest, ServiceType, User } from "../../types/dataTypes";
import { SERVICE_LABEL, SERVICE_ORDER, todayIso } from "../../utils/requestFormat";
import { RequestInput } from "../../utils/serviceRequests";
import ModalButtons from "../arborist/arboristComponents/modalComponents/modalUtils/ModalButtons";
import ModalContent from "../arborist/arboristComponents/modalComponents/modalUtils/ModalContent";
import PhotoPicker from "../utils/PhotoPicker";
import { serviceTone, ServiceIcon } from "./ServiceVisuals";

const HINTS: Record<ServiceType, string> = {
  chips: "Free mulch for beds & paths",
  logs: "Firewood rounds & logs",
  removal: "Take down a tree",
  trim: "Pruning & limb removal",
  stump: "Grind out an old stump",
  other: "Describe it in the notes",
};

/** Form state that survives a round trip to the map to move the pin. */
export interface RequestFormDraft {
  services: ServiceType[];
  description: string;
  timing: RequestTiming;
  preferredDate: string;
  phone: string;
  keepImages: string[];
  newPhotos: File[];
}

interface RequestFormProps {
  userData: User;
  initial?: ServiceRequest;
  position: Coordinates;
  address: string;
  draft?: RequestFormDraft;
  onSubmit: (input: RequestInput, photos: { keepImages: string[]; newPhotos: File[] }) => Promise<void>;
  onCancel: () => void;
  onChangeLocation: (draft: RequestFormDraft) => void;
}

export default function RequestForm({
  userData,
  initial,
  position,
  address: initialAddress,
  draft,
  onSubmit,
  onCancel,
  onChangeLocation,
}: RequestFormProps) {
  const [services, setServices] = useState<Set<ServiceType>>(
    new Set(draft?.services ?? initial?.services ?? []),
  );
  const [address, setAddress] = useState(initialAddress);
  const [description, setDescription] = useState(draft?.description ?? initial?.description ?? "");
  const [timing, setTiming] = useState<RequestTiming>(draft?.timing ?? initial?.timing ?? "flexible");
  const [preferredDate, setPreferredDate] = useState(draft?.preferredDate ?? initial?.preferredDate ?? "");
  const [phone, setPhone] = useState(
    draft?.phone ?? initial?.contact?.phone ?? userData.contact?.phone ?? "",
  );
  const [keepImages, setKeepImages] = useState<string[]>(draft?.keepImages ?? initial?.images ?? []);
  const [newPhotos, setNewPhotos] = useState<File[]>(draft?.newPhotos ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const needsNotes = services.has("other") && description.trim() === "";
  const needsDate = timing === "date" && !preferredDate;
  const valid = services.size > 0 && address.trim() !== "" && !needsNotes && !needsDate;

  const toggle = (service: ServiceType) =>
    setServices((current) => {
      const next = new Set(current);
      if (next.has(service)) next.delete(service);
      else next.add(service);
      return next;
    });

  const currentDraft = (): RequestFormDraft => ({
    services: [...services],
    description,
    timing,
    preferredDate,
    phone,
    keepImages,
    newPhotos,
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (!valid || saving) return;
    setSaving(true);
    setError("");
    try {
      await onSubmit(
        {
          services: SERVICE_ORDER.filter((s) => services.has(s)),
          description: description.trim(),
          address: address.trim(),
          latitude: position.latitude,
          longitude: position.longitude,
          timing,
          preferredDate: timing === "date" ? preferredDate : null,
          contact: { name: `${userData.firstName} ${userData.lastName}`.trim(), phone: phone.trim() },
        },
        { keepImages, newPhotos },
      );
    } catch (err) {
      console.error(err);
      setError(
        newPhotos.length
          ? "We couldn’t post your request. Check your connection, or try again without photos."
          : "We couldn’t post your request. Check your connection and try again.",
      );
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

          <section className="form-section" aria-labelledby="req-services">
            <div className="form-section-head">
              <h3 id="req-services">What do you need?</h3>
              <span>Choose all that apply</span>
            </div>
            <div className="choice-grid">
              {SERVICE_ORDER.map((service) => (
                <button
                  type="button"
                  key={service}
                  className="choice"
                  aria-pressed={services.has(service)}
                  onClick={() => toggle(service)}
                >
                  <span className={`tile tile--${serviceTone(service)}`} aria-hidden="true">
                    <ServiceIcon service={service} />
                  </span>
                  <span>
                    <strong>{SERVICE_LABEL[service]}</strong>
                    <small>{HINTS[service]}</small>
                  </span>
                  <span className="choice-check" aria-hidden="true">
                    <CheckIcon />
                  </span>
                </button>
              ))}
            </div>
            {touched && services.size === 0 && (
              <p className="form-error" role="alert">
                Pick at least one service.
              </p>
            )}
          </section>

          <section className="form-section" aria-labelledby="req-location">
            <div className="form-section-head">
              <h3 id="req-location">Location</h3>
              <Button
                size="small"
                startIcon={<EditLocationAltOutlinedIcon />}
                onClick={() => onChangeLocation(currentDraft())}
                disabled={saving}
              >
                Move pin
              </Button>
            </div>
            <TextField
              required
              label="Address"
              value={address}
              autoComplete="street-address"
              error={touched && address.trim() === ""}
              helperText={
                touched && address.trim() === ""
                  ? "Add an address so crews can find you."
                  : "Crews see this address and your pin on the map."
              }
              onChange={(event) => setAddress(event.target.value)}
            />
          </section>

          <section className="form-section" aria-labelledby="req-when">
            <div className="form-section-head">
              <h3 id="req-when">When?</h3>
            </div>
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={timing}
              aria-labelledby="req-when"
              onChange={(_, value: RequestTiming | null) => value && setTiming(value)}
            >
              <ToggleButton value="asap">ASAP</ToggleButton>
              <ToggleButton value="flexible">Flexible</ToggleButton>
              <ToggleButton value="date">Pick a date</ToggleButton>
            </ToggleButtonGroup>
            {timing === "date" && (
              <TextField
                type="date"
                label="Preferred date"
                value={preferredDate}
                error={touched && needsDate}
                helperText={touched && needsDate ? "Choose a date." : "Crews will try to work around it."}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: todayIso() }}
                onChange={(event) => setPreferredDate(event.target.value)}
              />
            )}
          </section>

          <section className="form-section" aria-labelledby="req-photos">
            <div className="form-section-head">
              <h3 id="req-photos">Photos</h3>
              <span>Optional, up to 8</span>
            </div>
            <p className="form-hint">
              Show where material should go or which trees need work. Crews price jobs faster with photos.
            </p>
            <PhotoPicker
              existing={keepImages}
              onExistingChange={setKeepImages}
              files={newPhotos}
              onFilesChange={setNewPhotos}
              disabled={saving}
            />
          </section>

          <section className="form-section" aria-labelledby="req-notes">
            <div className="form-section-head">
              <h3 id="req-notes">Details</h3>
              <span>{services.has("other") ? "Required" : "Optional"}</span>
            </div>
            <TextField
              multiline
              minRows={3}
              maxRows={8}
              label="Notes for crews"
              placeholder="How much material, tree size and height, access, gate codes, where to unload…"
              value={description}
              error={touched && needsNotes}
              helperText={touched && needsNotes ? "Tell crews what you need done." : undefined}
              onChange={(event) => setDescription(event.target.value)}
            />
            <TextField
              type="tel"
              label="Phone (optional)"
              value={phone}
              autoComplete="tel"
              inputProps={{ inputMode: "tel" }}
              helperText="Only shared with the crew you book."
              onChange={(event) => setPhone(event.target.value)}
            />
          </section>
        </div>
      </ModalContent>

      <ModalButtons>
        <Button variant="outlined" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {saving ? (newPhotos.length ? "Uploading…" : "Saving…") : initial ? "Save changes" : "Post request"}
        </Button>
      </ModalButtons>
    </form>
  );
}
