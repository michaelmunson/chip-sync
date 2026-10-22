import LogoutIcon from "@mui/icons-material/Logout";
import { Alert, Button, CircularProgress, TextField } from "@mui/material";
import { signOut } from "aws-amplify/auth";
import React, { useState } from "react";
import { User } from "../../types/dataTypes";
import { SetUserData } from "../../types/generalTypes";
import { DB } from "../../utils/database";
import { initials } from "../../utils/format";
import { Geo } from "../../utils/location";
import { Preferences } from "../arborist/arboristComponents/modalComponents/Settings";
import ModalContent from "../arborist/arboristComponents/modalComponents/modalUtils/ModalContent";
import NotificationPreferences from "../utils/NotificationPreferences";

export function isKnownZip(zip: string) {
  if (!/^\d{5}$/.test(zip)) return false;
  try {
    Geo.zipcodeToCoordinates(zip);
    return true;
  } catch {
    return false;
  }
}

export default function GardenerSettings({
  userData,
  setUserData,
  theme,
  setTheme,
}: {
  userData: User;
  setUserData: SetUserData;
  theme: "light" | "dark";
  setTheme: React.Dispatch<React.SetStateAction<"light" | "dark">>;
}) {
  const [firstName, setFirstName] = useState(userData.firstName);
  const [lastName, setLastName] = useState(userData.lastName);
  const [phone, setPhone] = useState(userData.contact?.phone ?? "");
  const [zip, setZip] = useState(userData.contact?.zip ?? "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"saved" | "error">();

  const zipInvalid = zip !== "" && !isKnownZip(zip);
  const dirty =
    firstName.trim() !== userData.firstName ||
    lastName.trim() !== userData.lastName ||
    phone.trim() !== (userData.contact?.phone ?? "") ||
    zip !== (userData.contact?.zip ?? "");
  const valid = firstName.trim() !== "" && lastName.trim() !== "" && !zipInvalid;

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!dirty || !valid || saving) return;
    setSaving(true);
    setStatus(undefined);
    const contact = { ...userData.contact, phone: phone.trim(), zip };
    try {
      await DB.updateUser({ id: userData.id, firstName: firstName.trim(), lastName: lastName.trim(), contact });
      setUserData((current) =>
        current ? { ...current, firstName: firstName.trim(), lastName: lastName.trim(), contact } : current,
      );
      setStatus("saved");
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalContent>
      <div className="profile-card">
        <span className="avatar avatar--lg">{initials(userData.firstName, userData.lastName)}</span>
        <div>
          <h3>
            {userData.firstName} {userData.lastName}
          </h3>
          <p>Gardener</p>
        </div>
      </div>

      <div className="section-label">Profile</div>
      <form className="group group--padded form" onSubmit={save} noValidate>
        {status === "saved" && (
          <Alert severity="success" onClose={() => setStatus(undefined)}>
            Profile saved.
          </Alert>
        )}
        {status === "error" && <Alert severity="error">We couldn’t save your profile. Please try again.</Alert>}
        <div className="field-row">
          <TextField label="First name" value={firstName} autoComplete="given-name" onChange={(e) => setFirstName(e.target.value)} />
          <TextField label="Last name" value={lastName} autoComplete="family-name" onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div className="field-row">
          <TextField
            type="tel"
            label="Phone"
            value={phone}
            autoComplete="tel"
            inputProps={{ inputMode: "tel" }}
            helperText="Shared with crews you book"
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            label="Home ZIP"
            value={zip}
            error={zipInvalid}
            helperText={zipInvalid ? "Enter a valid US ZIP code." : "Where your map starts"}
            autoComplete="postal-code"
            inputProps={{ inputMode: "numeric", maxLength: 5 }}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <div className="form-actions">
          <Button
            type="submit"
            variant="contained"
            disabled={!dirty || !valid || saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </form>

      <Preferences userData={userData} theme={theme} setTheme={setTheme} setUserData={setUserData} />

      <NotificationPreferences userData={userData} setUserData={setUserData} />

      <div className="section-label">Account</div>
      <div className="group">
        <button type="button" className="group-row group-row--danger" onClick={() => signOut()}>
          <LogoutIcon className="group-row-icon" />
          <span className="group-row-body">
            <span className="group-row-title">Sign out</span>
          </span>
        </button>
      </div>
    </ModalContent>
  );
}
