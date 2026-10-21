import {
  Alert,
  Button,
  CircularProgress,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import React, { useState } from "react";
import { Offer, OfferPricing, ServiceRequest } from "../../types/dataTypes";
import { formatTiming, isDelivery, requestSummary, shortAddress, todayIso } from "../../utils/requestFormat";
import { OfferInput } from "../../utils/serviceRequests";
import ModalButtons from "../arborist/arboristComponents/modalComponents/modalUtils/ModalButtons";
import ModalContent from "../arborist/arboristComponents/modalComponents/modalUtils/ModalContent";
import { ServiceTile } from "./ServiceVisuals";

const PRICING_HINT: Record<OfferPricing, string> = {
  fixed: "The gardener pays this amount for the job.",
  free: "No charge — e.g. you’re dropping chips or logs you need to unload.",
  unknown: "Too complex to price remotely. You’ll confirm a price after a site visit.",
};

interface OfferFormProps {
  request: ServiceRequest;
  /** Editing a pending offer, or prefill from a declined one when resubmitting. */
  initial?: Offer;
  editing: boolean;
  onSubmit: (input: OfferInput) => Promise<void>;
  onCancel: () => void;
}

const parseAmount = (value: string) => {
  const n = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
};

export default function OfferForm({ request, initial, editing, onSubmit, onCancel }: OfferFormProps) {
  const deliveryOnly = request.services.every(isDelivery);
  const wantsChips = request.services.includes("chips");
  const wantsLogs = request.services.includes("logs");

  const [pricing, setPricing] = useState<OfferPricing>(initial?.pricing ?? (deliveryOnly ? "free" : "fixed"));
  const [price, setPrice] = useState(initial?.price != null ? String(initial.price) : "");
  const [chipsYards, setChipsYards] = useState(initial?.chipsYards != null ? String(initial.chipsYards) : "");
  const [logLoads, setLogLoads] = useState(initial?.logLoads != null ? String(initial.logLoads) : "");
  const [availableDate, setAvailableDate] = useState(initial?.availableDate ?? "");
  const [message, setMessage] = useState(initial?.message ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const priceMissing = pricing === "fixed" && parseAmount(price) === null;
  const valid = !priceMissing;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (!valid || saving) return;
    setSaving(true);
    setError("");
    try {
      await onSubmit({
        pricing,
        price: pricing === "fixed" ? parseAmount(price) : null,
        chipsYards: wantsChips ? parseAmount(chipsYards) : null,
        logLoads: wantsLogs ? parseAmount(logLoads) : null,
        availableDate: availableDate || null,
        message,
      });
    } catch (err) {
      console.error(err);
      setError(
        editing
          ? "We couldn’t update this offer. It may have just been answered — close this and check the request."
          : "We couldn’t send your offer. Check your connection and try again.",
      );
      setSaving(false);
    }
  }

  return (
    <form className="dialog-form" onSubmit={handleSubmit} noValidate>
      <ModalContent>
        <div className="form">
          <div className="summary-card">
            <ServiceTile services={request.services} />
            <div className="card-body">
              <span className="card-title">{requestSummary(request)}</span>
              <span className="card-sub">
                {shortAddress(request.address)} · {formatTiming(request)}
              </span>
            </div>
          </div>

          {error && (
            <Alert severity="error" role="alert">
              {error}
            </Alert>
          )}

          <section className="form-section" aria-labelledby="offer-pricing">
            <div className="form-section-head">
              <h3 id="offer-pricing">Price</h3>
            </div>
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={pricing}
              aria-labelledby="offer-pricing"
              onChange={(_, value: OfferPricing | null) => value && setPricing(value)}
            >
              <ToggleButton value="fixed">Set a price</ToggleButton>
              <ToggleButton value="free">Free</ToggleButton>
              <ToggleButton value="unknown">Not sure yet</ToggleButton>
            </ToggleButtonGroup>
            <p className="form-hint">{PRICING_HINT[pricing]}</p>
            {pricing === "fixed" && (
              <TextField
                required
                label="Price"
                value={price}
                error={touched && priceMissing}
                helperText={touched && priceMissing ? "Enter a price, or choose “Not sure yet”." : undefined}
                inputProps={{ inputMode: "decimal" }}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                onChange={(event) => setPrice(event.target.value)}
              />
            )}
          </section>

          {(wantsChips || wantsLogs) && (
            <section className="form-section" aria-labelledby="offer-amounts">
              <div className="form-section-head">
                <h3 id="offer-amounts">Material</h3>
                <span>Optional</span>
              </div>
              <div className="field-row">
                {wantsChips && (
                  <TextField
                    label="Wood chips"
                    value={chipsYards}
                    inputProps={{ inputMode: "decimal" }}
                    InputProps={{ endAdornment: <InputAdornment position="end">yd³</InputAdornment> }}
                    onChange={(event) => setChipsYards(event.target.value)}
                  />
                )}
                {wantsLogs && (
                  <TextField
                    label="Logs"
                    value={logLoads}
                    inputProps={{ inputMode: "decimal" }}
                    InputProps={{ endAdornment: <InputAdornment position="end">loads</InputAdornment> }}
                    onChange={(event) => setLogLoads(event.target.value)}
                  />
                )}
              </div>
            </section>
          )}

          <section className="form-section" aria-labelledby="offer-details">
            <div className="form-section-head">
              <h3 id="offer-details">Details</h3>
              <span>Optional</span>
            </div>
            <TextField
              type="date"
              label="Earliest date you can do it"
              value={availableDate}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: todayIso() }}
              onChange={(event) => setAvailableDate(event.target.value)}
            />
            <TextField
              multiline
              minRows={3}
              maxRows={8}
              label="Message to the gardener"
              placeholder="What’s included, cleanup, questions about access…"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
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
          {saving ? "Sending…" : editing ? "Update offer" : "Send offer"}
        </Button>
      </ModalButtons>
    </form>
  );
}
