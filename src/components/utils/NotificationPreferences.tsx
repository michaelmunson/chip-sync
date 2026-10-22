import { Alert, Button, CircularProgress, FormControlLabel, Switch, TextField } from "@mui/material";
import React, { useState } from "react";
import { User } from "../../types/dataTypes";
import { SetUserData } from "../../types/generalTypes";
import { DB } from "../../utils/database";
import {
  audienceForRole,
  isChannelEnabled,
  isValidEmail,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_EVENTS,
  normalizePhone,
  NotificationChannel,
  NotificationEvent,
  NotificationSettings,
  parseNotificationSettings,
  setChannelEnabled,
  settingsEqual,
} from "../../utils/notificationSettings";

const CHANNEL_LABEL: Record<NotificationChannel, string> = { sms: "Text", email: "Email" };

/** Switches off any channel that has no usable address, so saved settings never promise a message we can't send. */
function withoutUnreachableChannels(settings: NotificationSettings): NotificationSettings {
  let next = settings;
  const hasAddress: Record<NotificationChannel, boolean> = {
    sms: normalizePhone(settings.phone) !== null,
    email: isValidEmail(settings.email),
  };
  for (const infos of Object.values(NOTIFICATION_EVENTS)) {
    for (const { event } of infos) {
      for (const channel of NOTIFICATION_CHANNELS) {
        if (!hasAddress[channel] && isChannelEnabled(next, event, channel)) {
          next = setChannelEnabled(next, event, channel, false);
        }
      }
    }
  }
  return next;
}

/** Text / email notification settings, shared by the gardener and crew settings screens. Everything is off by default. */
export default function NotificationPreferences({
  userData,
  setUserData,
}: {
  userData: User;
  setUserData: SetUserData;
}) {
  const saved = parseNotificationSettings(userData.notificationSettings);
  const [draft, setDraft] = useState<NotificationSettings>(saved);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"saved" | "error">();

  const events = NOTIFICATION_EVENTS[audienceForRole(userData.role)];
  const emailInvalid = draft.email.trim() !== "" && !isValidEmail(draft.email);
  const phoneInvalid = draft.phone.trim() !== "" && normalizePhone(draft.phone) === null;
  const canSend: Record<NotificationChannel, boolean> = {
    sms: draft.phone.trim() !== "" && !phoneInvalid,
    email: draft.email.trim() !== "" && !emailInvalid,
  };
  const next = withoutUnreachableChannels({ ...draft, email: draft.email.trim(), phone: draft.phone.trim() });
  const dirty = !settingsEqual(next, saved);
  const valid = !emailInvalid && !phoneInvalid;

  const toggle = (event: NotificationEvent, channel: NotificationChannel, enabled: boolean) => {
    setStatus(undefined);
    setDraft((current) => setChannelEnabled(current, event, channel, enabled));
  };

  async function save(submit: React.FormEvent) {
    submit.preventDefault();
    if (!dirty || !valid || saving) return;
    setSaving(true);
    setStatus(undefined);
    try {
      await DB.updateUser({ id: userData.id, notificationSettings: next });
      setUserData((current) => (current ? { ...current, notificationSettings: next } : current));
      setDraft(next);
      setStatus("saved");
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="section-label">Text &amp; email notifications</div>
      <form className="group group--padded form" onSubmit={save} noValidate>
        {status === "saved" && (
          <Alert severity="success" onClose={() => setStatus(undefined)}>
            Notification settings saved.
          </Alert>
        )}
        {status === "error" && <Alert severity="error">We couldn’t save your notification settings. Please try again.</Alert>}
        <div className="field-row">
          <TextField
            type="tel"
            label="Phone for texts"
            value={draft.phone}
            autoComplete="tel"
            error={phoneInvalid}
            inputProps={{ inputMode: "tel" }}
            helperText={phoneInvalid ? "Enter a 10-digit US number." : "Standard message rates apply"}
            onChange={(e) => {
              setStatus(undefined);
              setDraft({ ...draft, phone: e.target.value });
            }}
          />
          <TextField
            type="email"
            label="Email"
            value={draft.email}
            autoComplete="email"
            error={emailInvalid}
            helperText={emailInvalid ? "Enter a valid email address." : "Where we send email alerts"}
            onChange={(e) => {
              setStatus(undefined);
              setDraft({ ...draft, email: e.target.value });
            }}
          />
        </div>
        <ul className="notif-list">
          {events.map(({ event, label, description }) => (
            <li className="notif-row" key={event}>
              <div className="group-row-body">
                <div className="group-row-title">{label}</div>
                <div className="group-row-sub">{description}</div>
              </div>
              <div className="notif-switches">
                {NOTIFICATION_CHANNELS.map((channel) => (
                  <FormControlLabel
                    key={channel}
                    label={CHANNEL_LABEL[channel]}
                    labelPlacement="top"
                    disabled={!canSend[channel]}
                    control={
                      <Switch
                        size="small"
                        checked={canSend[channel] && isChannelEnabled(draft, event, channel)}
                        onChange={(_, checked) => toggle(event, channel, checked)}
                        inputProps={{ "aria-label": `${label} by ${CHANNEL_LABEL[channel].toLowerCase()}` }}
                      />
                    }
                  />
                ))}
              </div>
            </li>
          ))}
        </ul>
        <div className="form-actions">
          <Button
            type="submit"
            variant="contained"
            disabled={!dirty || !valid || saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {saving ? "Saving…" : "Save notifications"}
          </Button>
        </div>
      </form>
    </>
  );
}
