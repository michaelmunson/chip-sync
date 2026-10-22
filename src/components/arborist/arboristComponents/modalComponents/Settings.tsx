import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckIcon from "@mui/icons-material/Check";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import { Alert, Button, IconButton, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import { signOut } from "aws-amplify/auth";
import React, { useState } from "react";
import { Marker, User } from "../../../../types/dataTypes";
import { ModalConfig, ToggleModal } from "../../../../types/generalTypes";
import { DB } from "../../../../utils/database";
import { initials } from "../../../../utils/format";
import EmptyState from "../../../utils/EmptyState";
import NotificationPreferences from "../../../utils/NotificationPreferences";
import { MaterialPills, MaterialTile } from "../../../utils/Material";
import ModalContent from "./modalUtils/ModalContent";

type Page = "members" | "markers";
type SetUserData = React.Dispatch<React.SetStateAction<User | undefined>>;

interface SettingsProps {
  data?: ModalConfig["data"];
  userData: User;
  theme: "light" | "dark";
  setTheme: React.Dispatch<React.SetStateAction<"light" | "dark">>;
  setUserData: SetUserData;
  toggleModal: ToggleModal;
  onAddLocation: () => void;
}

const fullName = (user: Pick<User, "firstName" | "lastName">) =>
  `${user.firstName} ${user.lastName}`.trim();

/** Immutable update of the organization slice of user data. */
function updateOrg(
  setUserData: SetUserData,
  update: (org: User["organization"]) => User["organization"],
) {
  setUserData((current) =>
    current ? { ...current, organization: update(current.organization) } : current,
  );
}

/* ---------- Main settings page ---------- */

export function Preferences({
  userData,
  theme,
  setTheme,
  setUserData,
}: Pick<SettingsProps, "userData" | "theme" | "setTheme" | "setUserData">) {
  const setMapChoice = (mapChoice: User["mapChoice"]) => {
    DB.updateUser({ id: userData.id, mapChoice });
    setUserData((current) => (current ? { ...current, mapChoice } : current));
  };

  return (
    <>
      <div className="section-label">Preferences</div>
      <div className="group">
        <div className="group-row group-row--stack">
          <div className="group-row-title" id="pref-appearance">
            Appearance
          </div>
          <ToggleButtonGroup
            exclusive
            value={theme}
            aria-labelledby="pref-appearance"
            onChange={(_, value) => value && setTheme(value)}
          >
            <ToggleButton value="light">
              <LightModeOutlinedIcon fontSize="small" /> Light
            </ToggleButton>
            <ToggleButton value="dark">
              <DarkModeOutlinedIcon fontSize="small" /> Dark
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
        <div className="group-row group-row--stack">
          <div className="group-row-body">
            <div className="group-row-title" id="pref-maps">
              Open addresses in
            </div>
            <div className="group-row-sub">
              The app used for directions links
            </div>
          </div>
          <ToggleButtonGroup
            exclusive
            value={userData.mapChoice}
            aria-labelledby="pref-maps"
            onChange={(_, value) => value && setMapChoice(value)}
          >
            <ToggleButton value="apple">Apple Maps</ToggleButton>
            <ToggleButton value="google">Google Maps</ToggleButton>
          </ToggleButtonGroup>
        </div>
      </div>
    </>
  );
}

function AccessCodeRow({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable: the code remains visible for manual copy */
    }
  };

  return (
    <div className="group-row">
      <KeyOutlinedIcon className="group-row-icon" />
      <div className="group-row-body">
        <div className="group-row-sub">Crew access code</div>
        <div className="access-code" aria-label={`Access code ${code.split("").join(" ")}`}>
          {code}
        </div>
      </div>
      <Tooltip title={copied ? "Copied" : "Copy code"} open={copied ? true : undefined}>
        <IconButton aria-label="Copy access code" onClick={copy}>
          {copied ? <CheckIcon /> : <ContentCopyIcon />}
        </IconButton>
      </Tooltip>
    </div>
  );
}

function NavRow({
  icon,
  title,
  detail,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="group-row" onClick={onClick}>
      <span className="group-row-icon">{icon}</span>
      <span className="group-row-body">
        <span className="group-row-title">{title}</span>
        <span className="group-row-sub">{detail}</span>
      </span>
      <ChevronRightIcon className="group-row-icon" />
    </button>
  );
}

/* ---------- Admin sub-pages ---------- */

function PageHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <>
      <Button
        className="page-back"
        size="small"
        color="primary"
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
      >
        Settings
      </Button>
      <h3 className="page-title">{title}</h3>
    </>
  );
}

function ConfirmRow({
  message,
  confirmLabel,
  tone = "error",
  onCancel,
  onConfirm,
}: {
  message: string;
  confirmLabel: string;
  tone?: "error" | "primary";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="inline-confirm" role="alertdialog" aria-label={message}>
      <p>{message}</p>
      <Button size="small" variant="outlined" onClick={onCancel}>
        Cancel
      </Button>
      <Button size="small" variant="contained" color={tone} onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </div>
  );
}

function MembersPage({
  userData,
  setUserData,
  onBack,
}: {
  userData: User;
  setUserData: SetUserData;
  onBack: () => void;
}) {
  const [pending, setPending] = useState<{ id: string; action: "remove" | "promote" }>();
  const [error, setError] = useState("");

  const others = userData.organization.users
    .filter((user) => user.id !== userData.id)
    .sort((a, b) => Number(b.role === "admin") - Number(a.role === "admin"));

  async function confirm(member: User, action: "remove" | "promote") {
    const previous = userData.organization.users;
    setPending(undefined);
    setError("");
    updateOrg(setUserData, (org) => ({
      ...org,
      users:
        action === "remove"
          ? org.users.filter((u) => u.id !== member.id)
          : org.users.map((u) => (u.id === member.id ? { ...u, role: "admin" as const } : u)),
    }));
    try {
      if (action === "remove") await DB.deleteUser({ userId: member.id });
      else await DB.updateUser({ id: member.id, role: "admin" });
    } catch {
      updateOrg(setUserData, (org) => ({ ...org, users: previous }));
      setError(`Couldn’t ${action} ${fullName(member)}. Please try again.`);
    }
  }

  return (
    <>
      <PageHeader title="Members" onBack={onBack} />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {others.length === 0 ? (
        <EmptyState
          icon={<GroupOutlinedIcon />}
          title="No other members yet"
          description={`Share your access code (${userData.organization.accessCode}) so your crew can join.`}
        />
      ) : (
        <ul className="card-list card-list--flat">
          {others.map((member) => {
            const isPending = pending?.id === member.id;
            return (
              <li className="card" key={member.id}>
                <div className="card-main card-main--static">
                  <span className="avatar">{initials(member.firstName, member.lastName)}</span>
                  {isPending ? (
                    <ConfirmRow
                      message={
                        pending.action === "remove"
                          ? `Remove ${fullName(member)}?`
                          : `Make ${fullName(member)} an admin?`
                      }
                      confirmLabel={pending.action === "remove" ? "Remove" : "Promote"}
                      tone={pending.action === "remove" ? "error" : "primary"}
                      onCancel={() => setPending(undefined)}
                      onConfirm={() => confirm(member, pending.action)}
                    />
                  ) : (
                    <>
                      <span className="card-body">
                        <span className="card-title truncate">{fullName(member)}</span>
                        <span className="pill-row">
                          <span
                            className={`pill pill--plain ${member.role === "admin" ? "pill--brand" : ""}`}
                          >
                            {member.role === "admin" ? "Admin" : "Member"}
                          </span>
                        </span>
                      </span>
                      {member.role !== "admin" && (
                        <Tooltip title="Make admin">
                          <IconButton
                            aria-label={`Make ${fullName(member)} an admin`}
                            onClick={() => setPending({ id: member.id, action: "promote" })}
                          >
                            <AdminPanelSettingsOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Remove">
                        <IconButton
                          aria-label={`Remove ${fullName(member)}`}
                          onClick={() => setPending({ id: member.id, action: "remove" })}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function MarkersPage({
  userData,
  setUserData,
  toggleModal,
  onAddLocation,
  onBack,
}: {
  userData: User;
  setUserData: SetUserData;
  toggleModal: ToggleModal;
  onAddLocation: () => void;
  onBack: () => void;
}) {
  const [pendingId, setPendingId] = useState<string>();
  const [error, setError] = useState("");
  const { markers } = userData.organization;

  async function remove(marker: Marker) {
    const previous = markers;
    setPendingId(undefined);
    setError("");
    updateOrg(setUserData, (org) => ({
      ...org,
      markers: org.markers.filter((m) => m.id !== marker.id),
    }));
    try {
      await DB.deleteMarker({ id: marker.id });
    } catch {
      updateOrg(setUserData, (org) => ({ ...org, markers: previous }));
      setError(`Couldn’t remove ${marker.name}. Please try again.`);
    }
  }

  return (
    <>
      <PageHeader title="Manage drop sites" onBack={onBack} />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {markers.length === 0 ? (
        <EmptyState
          icon={<RoomOutlinedIcon />}
          title="No drop sites yet"
          description="Sites your crew saves will show up here."
          action={
            <Button variant="contained" onClick={onAddLocation}>
              Add a drop site
            </Button>
          }
        />
      ) : (
        <ul className="card-list card-list--flat">
          {markers.map((marker) => (
            <li className="card" key={marker.id}>
              <div className="card-main card-main--static">
                <MaterialTile type={marker.type} />
                {pendingId === marker.id ? (
                  <ConfirmRow
                    message={`Remove ${marker.name}?`}
                    confirmLabel="Remove"
                    onCancel={() => setPendingId(undefined)}
                    onConfirm={() => remove(marker)}
                  />
                ) : (
                  <>
                    <span className="card-body">
                      <span className="card-title truncate">{marker.name}</span>
                      <MaterialPills type={marker.type} />
                    </span>
                    <Tooltip title="Edit">
                      <IconButton
                        aria-label={`Edit ${marker.name}`}
                        onClick={() =>
                          toggleModal(true, { type: "edit-marker", data: { marker } })
                        }
                      >
                        <EditOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <IconButton
                        aria-label={`Remove ${marker.name}`}
                        onClick={() => setPendingId(marker.id)}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* ---------- Entry ---------- */

export default function Settings({
  data,
  userData,
  theme,
  setTheme,
  setUserData,
  toggleModal,
  onAddLocation,
}: SettingsProps) {
  const [page, setPage] = useState<Page | undefined>(
    data?.page === "members" || data?.page === "markers" ? data.page : undefined,
  );
  const isAdmin = userData.role === "admin";
  const { users, markers, accessCode, name: orgName } = userData.organization;

  if (isAdmin && page === "members") {
    return (
      <ModalContent>
        <MembersPage
          userData={userData}
          setUserData={setUserData}
          onBack={() => setPage(undefined)}
        />
      </ModalContent>
    );
  }
  if (isAdmin && page === "markers") {
    return (
      <ModalContent>
        <MarkersPage
          userData={userData}
          setUserData={setUserData}
          toggleModal={toggleModal}
          onAddLocation={onAddLocation}
          onBack={() => setPage(undefined)}
        />
      </ModalContent>
    );
  }

  const memberCount = Math.max(users.length - 1, 0);

  return (
    <ModalContent>
      <div className="profile-card">
        <span className="avatar avatar--lg">{initials(userData.firstName, userData.lastName)}</span>
        <div>
          <h3>{fullName(userData)}</h3>
          <p>
            {orgName} · {isAdmin ? "Admin" : "Member"}
          </p>
        </div>
      </div>

      <Preferences
        userData={userData}
        theme={theme}
        setTheme={setTheme}
        setUserData={setUserData}
      />

      <NotificationPreferences userData={userData} setUserData={setUserData} />

      {isAdmin && (
        <>
          <div className="section-label">Organization</div>
          <div className="group">
            <AccessCodeRow code={accessCode} />
            <NavRow
              icon={<PersonAddAltOutlinedIcon />}
              title="Members"
              detail={memberCount === 1 ? "1 other member" : `${memberCount} other members`}
              onClick={() => setPage("members")}
            />
            <NavRow
              icon={<RoomOutlinedIcon />}
              title="Manage drop sites"
              detail={`${markers.length} saved ${markers.length === 1 ? "site" : "sites"}`}
              onClick={() => setPage("markers")}
            />
          </div>
        </>
      )}

      <div className="section-label">Account</div>
      <div className="group">
        <button
          type="button"
          className="group-row group-row--danger"
          onClick={() => signOut()}
        >
          <LogoutIcon className="group-row-icon" />
          <span className="group-row-body">
            <span className="group-row-title">Sign out</span>
          </span>
        </button>
      </div>
    </ModalContent>
  );
}
