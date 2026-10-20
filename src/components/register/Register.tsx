import React, { useState } from "react";
import CheckIcon from "@mui/icons-material/Check";
import ForestOutlinedIcon from "@mui/icons-material/ForestOutlined";
import YardOutlinedIcon from "@mui/icons-material/YardOutlined";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { SetUserData } from "../../types/generalTypes";
import { DB } from "../../utils/database";
import { Geo } from "../../utils/location";
import Logo from "../utils/Logo";

type RegType = "gardner" | "arborist";
type Mode = "join" | "create";

const STEPS = ["Account", "Details", "Confirm"];

function isKnownZip(zip: string) {
  if (!/^\d{5}$/.test(zip)) return false;
  try {
    Geo.zipcodeToCoordinates(zip);
    return true;
  } catch {
    return false;
  }
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="stepper" aria-label="Setup progress">
      {STEPS.map((label, index) => (
        <li
          key={label}
          data-state={index < step ? "done" : index === step ? "current" : "todo"}
          aria-current={index === step ? "step" : undefined}
        >
          {label}
        </li>
      ))}
    </ol>
  );
}

export default function Register({ setUserData }: { setUserData: SetUserData }) {
  const [step, setStep] = useState(0);
  const [regType, setRegType] = useState<RegType>();
  const [mode, setMode] = useState<Mode>("join");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [orgName, setOrgName] = useState("");
  const [zip, setZip] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [badCode, setBadCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const zipInvalid = zip.length === 5 && !isKnownZip(zip);
  const detailsValid =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    (mode === "join" ? accessCode.trim() !== "" : orgName.trim() !== "" && isKnownZip(zip));

  async function createAccount() {
    setLoading(true);
    setError("");
    setBadCode(false);
    try {
      const names = { firstName: firstName.trim(), lastName: lastName.trim() };
      if (mode === "create") {
        const org = await DB.createOrganization({
          name: orgName.trim(),
          location: zip,
          tier: JSON.stringify({ plan: "", type: "monthly", timestamp: Date.now() }),
        });
        setUserData(await DB.createAdmin({ ...names, organizationId: org.id }));
      } else {
        const user = await DB.createMember({ ...names, accessCode });
        if (user) {
          setUserData(user);
        } else {
          setBadCode(true);
          setAgreed(false);
          setStep(1);
        }
      }
    } catch {
      setError("We couldn’t create your account. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const accountStep = (
    <div className="onboarding-step">
      <h1>Set up your workspace</h1>
      <p>Pick the account that fits how you work.</p>
      <div className="onboarding-choice-grid">
        <button
          type="button"
          className="choice"
          aria-pressed={regType === "arborist"}
          onClick={() => {
            setRegType("arborist");
            setStep(1);
          }}
        >
          <span className="tile tile--brand" aria-hidden="true">
            <ForestOutlinedIcon />
          </span>
          <span>
            <strong>Arborist</strong>
            <small>Share drop sites with your crew</small>
          </span>
          <span className="choice-check" aria-hidden="true">
            <CheckIcon />
          </span>
        </button>
        <button type="button" className="choice" disabled aria-disabled="true">
          <span className="tile" aria-hidden="true">
            <YardOutlinedIcon />
          </span>
          <span>
            <strong>Gardener</strong>
            <small>Coming soon</small>
          </span>
        </button>
      </div>
    </div>
  );

  const detailsStep = (
    <form
      className="onboarding-step"
      onSubmit={(event) => {
        event.preventDefault();
        if (detailsValid) setStep(2);
      }}
      noValidate
    >
      <h1>Tell us about you</h1>
      <p>Your name and the crew you’re working with.</p>
      <div className="onboarding-fields">
        <div className="field-row">
          <TextField
            label="First name"
            value={firstName}
            autoComplete="given-name"
            onChange={(event) => setFirstName(event.target.value)}
          />
          <TextField
            label="Last name"
            value={lastName}
            autoComplete="family-name"
            onChange={(event) => setLastName(event.target.value)}
          />
        </div>

        <ToggleButtonGroup
          exclusive
          value={mode}
          aria-label="Join or create a crew"
          onChange={(_, value: Mode | null) => {
            if (!value) return;
            setMode(value);
            setBadCode(false);
          }}
        >
          <ToggleButton value="join">Join a crew</ToggleButton>
          <ToggleButton value="create">Create a crew</ToggleButton>
        </ToggleButtonGroup>

        {mode === "join" ? (
          <TextField
            className="access-code-field"
            label="Access code"
            value={accessCode}
            error={badCode}
            helperText={
              badCode
                ? "That access code wasn’t recognized. Check it and try again."
                : "Ask your admin. The code is in their Settings."
            }
            autoComplete="off"
            inputProps={{ maxLength: 10 }}
            onChange={(event) => {
              setBadCode(false);
              setAccessCode(event.target.value.toUpperCase());
            }}
          />
        ) : (
          <>
            <TextField
              label="Organization name"
              value={orgName}
              autoComplete="organization"
              onChange={(event) => setOrgName(event.target.value)}
            />
            <TextField
              label="ZIP code"
              value={zip}
              error={zipInvalid}
              helperText={
                zipInvalid
                  ? "Enter a valid US ZIP code."
                  : "Sets where your map starts."
              }
              autoComplete="postal-code"
              inputProps={{ inputMode: "numeric", maxLength: 5 }}
              onChange={(event) => setZip(event.target.value.replace(/\D/g, ""))}
            />
          </>
        )}
      </div>
      <div className="onboarding-actions">
        <Button variant="outlined" onClick={() => setStep(0)}>
          Back
        </Button>
        <Button type="submit" variant="contained" disabled={!detailsValid}>
          Continue
        </Button>
      </div>
    </form>
  );

  const confirmStep = (
    <div className="onboarding-step">
      <h1>Almost there</h1>
      <p>Review your details and agree to the terms to finish.</p>
      <ul className="summary-list">
        <li>
          <span>Name</span>
          <strong>
            {firstName.trim()} {lastName.trim()}
          </strong>
        </li>
        <li>
          <span>{mode === "join" ? "Joining with code" : "New organization"}</span>
          <strong>{mode === "join" ? accessCode : `${orgName.trim()} · ${zip}`}</strong>
        </li>
      </ul>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <label className="onboarding-agree">
        <Checkbox checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
        <span>
          I agree to the{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://www.getchipsync.com/terms-and-conditions"
          >
            Terms and Conditions
          </a>
        </span>
      </label>
      <div className="onboarding-actions">
        <Button variant="outlined" onClick={() => setStep(1)} disabled={loading}>
          Back
        </Button>
        <Button
          variant="contained"
          disabled={!agreed || loading}
          onClick={createAccount}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="onboarding page-backdrop">
      <div className="onboarding-card">
        <div className="onboarding-brand">
          <Logo size="small" />
          <strong>Chip Sync</strong>
        </div>
        <Stepper step={step} />
        {[accountStep, detailsStep, confirmStep][step]}
      </div>
    </div>
  );
}
