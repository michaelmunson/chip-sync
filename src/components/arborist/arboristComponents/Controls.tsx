import AddLocationAltOutlined from "@mui/icons-material/AddLocationAltOutlined";
import FormatListBulletedOutlined from "@mui/icons-material/FormatListBulletedOutlined";
import NotificationsNoneOutlined from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import { Badge } from "@mui/material";
import React from "react";
import "../../../css/controls.css";
import { User } from "../../../types/dataTypes";
import { ModalConfig, ToggleModal } from "../../../types/generalTypes";
import Logo from "../../utils/Logo";

interface DockItemProps {
  icon: React.ReactNode;
  label: string;
  ariaLabel?: string;
  primary?: boolean;
  onClick: () => void;
}

function DockItem({ icon, label, ariaLabel, primary, onClick }: DockItemProps) {
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

export default function Controls({
  userData,
  toggleModal,
}: {
  userData: User;
  toggleModal: ToggleModal;
}) {
  const unread = userData.notifications.filter(
    (notification) => !notification.opened,
  ).length;
  const siteCount = userData.organization.markers.length;
  const open = (type: ModalConfig["type"]) => () => toggleModal(true, { type });

  return (
    <>
      <header className="workspace-header">
        <Logo size="small" />
        <div className="workspace-header-text">
          <strong className="truncate">{userData.organization.name}</strong>
          <span>
            {siteCount} drop {siteCount === 1 ? "site" : "sites"}
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
