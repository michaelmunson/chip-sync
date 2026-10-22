import AddLocationAltOutlined from "@mui/icons-material/AddLocationAltOutlined";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";
import FormatListBulletedOutlined from "@mui/icons-material/FormatListBulletedOutlined";
import NotificationsNoneOutlined from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import { Badge } from "@mui/material";
import React from "react";
import "../../../css/controls.css";
import { User } from "../../../types/dataTypes";
import { ModalConfig, ToggleModal } from "../../../types/generalTypes";
import Logo from "../../utils/Logo";
import { useRequests } from "../../requests/RequestsContext";

interface DockItemProps {
  icon: React.ReactNode;
  label: string;
  ariaLabel?: string;
  primary?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function DockItem({ icon, label, ariaLabel, primary, onClick }: DockItemProps) {
  return (
    <button
      type="button"
      className={`dock-item${primary ? " dock-item--primary" : ""}`}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/** Unread activity, excluding chat messages (those are counted on Messages). */
export const unreadActivity = (user: User) =>
  user.notifications.filter((n) => !n.opened && n.type !== "new-message").length;

export function HeaderActions({
  unread,
  onActivity,
  onSettings,
}: {
  unread: number;
  onActivity: () => void;
  onSettings: () => void;
}) {
  return (
    <div className="workspace-header-actions">
      <button
        type="button"
        className="workspace-header-icon"
        aria-label={unread ? `Activity, ${unread} unread` : "Activity"}
        onClick={onActivity}
      >
        <Badge badgeContent={unread} color="error">
          <NotificationsNoneOutlined />
        </Badge>
      </button>
      <button
        type="button"
        className="workspace-header-icon"
        aria-label="Settings"
        onClick={onSettings}
      >
        <SettingsOutlined />
      </button>
    </div>
  );
}

export default function Controls({
  userData,
  toggleModal,
  onAddLocation,
}: {
  userData: User;
  toggleModal: ToggleModal;
  onAddLocation: () => void;
}) {
  const { requests, unreadByConversation } = useRequests();
  const unread = unreadActivity(userData);
  const unreadChats = Object.keys(unreadByConversation).length;
  const siteCount = userData.organization.markers.length;
  const openRequests = requests.filter((r) => r.status === "open").length;
  const open = (type: ModalConfig["type"]) => () => toggleModal(true, { type });
  const locationLabel = siteCount === 1 ? "location" : "locations";

  return (
    <>
      <header className="workspace-header">
        <Logo size="small" />
        <div className="workspace-header-text">
          <strong className="truncate">{userData.organization.name}</strong>
          <span className="truncate">
            <span>
              {siteCount} {locationLabel}
            </span>
            {openRequests > 0 && (
              <>
                {" · "}
                <span>
                  {openRequests} open {openRequests === 1 ? "request" : "requests"}
                </span>
              </>
            )}
          </span>
        </div>
        <HeaderActions
          unread={unread}
          onActivity={open("notifications")}
          onSettings={open("settings")}
        />
      </header>

      <nav className="workspace-dock" aria-label="Workspace tools">
        <DockItem
          icon={<FormatListBulletedOutlined />}
          label="Sites"
          onClick={open("marker-list")}
        />
        <DockItem
          icon={<WorkOutlineOutlined />}
          label="Jobs"
          onClick={open("job-list")}
        />
        <DockItem
          icon={<AssignmentOutlined />}
          label="Requests"
          onClick={open("request-list")}
        />
        <DockItem
          icon={
            <Badge badgeContent={unreadChats} color="error">
              <ChatBubbleOutline />
            </Badge>
          }
          label="Messages"
          ariaLabel={unreadChats ? `Messages, ${unreadChats} unread` : "Messages"}
          onClick={open("messages")}
        />
        <DockItem
          primary
          icon={<AddLocationAltOutlined />}
          label="Add"
          onClick={onAddLocation}
        />
      </nav>
    </>
  );
}
