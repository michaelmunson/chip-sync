import AddLocationAltOutlined from "@mui/icons-material/AddLocationAltOutlined";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";
import FormatListBulletedOutlined from "@mui/icons-material/FormatListBulletedOutlined";
import NotificationsNoneOutlined from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
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
  onClick: () => void;
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

export default function Controls({
  userData,
  toggleModal,
}: {
  userData: User;
  toggleModal: ToggleModal;
}) {
  const { requests, unreadByConversation } = useRequests();
  const unread = unreadActivity(userData);
  const unreadChats = Object.keys(unreadByConversation).length;
  const siteCount = userData.organization.markers.length;
  const openRequests = requests.filter((r) => r.status === "open").length;
  const open = (type: ModalConfig["type"]) => () => toggleModal(true, { type });

  return (
    <>
      <header className="workspace-header">
        <Logo size="small" />
        <div className="workspace-header-text">
          <strong className="truncate">{userData.organization.name}</strong>
          <span className="truncate">
            <span>
              {siteCount} drop {siteCount === 1 ? "site" : "sites"}
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
      </header>

      <nav className="workspace-dock" aria-label="Workspace tools">
        <DockItem
          icon={<FormatListBulletedOutlined />}
          label="Sites"
          onClick={open("marker-list")}
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
          icon={
            <Badge badgeContent={unread} color="error">
              <NotificationsNoneOutlined />
            </Badge>
          }
          label="Activity"
          ariaLabel={unread ? `Activity, ${unread} unread` : "Activity"}
          onClick={open("notifications")}
        />
        <DockItem
          icon={<SettingsOutlined />}
          label="Settings"
          onClick={open("settings")}
        />
        <DockItem
          primary
          icon={<AddLocationAltOutlined />}
          label="Add site"
          onClick={open("add-marker")}
        />
      </nav>
    </>
  );
}
