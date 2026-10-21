import AddLocationAltOutlined from "@mui/icons-material/AddLocationAltOutlined";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import DirectionsOutlined from "@mui/icons-material/DirectionsOutlined";
import FormatListBulletedOutlined from "@mui/icons-material/FormatListBulletedOutlined";
import NotificationsNoneOutlined from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import { Badge, Menu, MenuItem } from "@mui/material";
import React, { useMemo, useState } from "react";
import "../../../css/controls.css";
import { Marker, User } from "../../../types/dataTypes";
import { Coordinates, ModalConfig, ToggleModal } from "../../../types/generalTypes";
import { formatDistance } from "../../../utils/format";
import { Geo } from "../../../utils/location";
import { isDropSite, matchesMaterialFilter } from "../../../utils/markers";
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

type RouteFilter = "chips" | "wood" | "both";

const ROUTE_FILTERS: Array<{ value: RouteFilter; label: string }> = [
  { value: "chips", label: "Chips" },
  { value: "wood", label: "Logs" },
  { value: "both", label: "Both" },
];

/** Drop sites that can take the selected material(s). */
function matchesRouteFilter(marker: Marker, filter: RouteFilter) {
  return isDropSite(marker) && matchesMaterialFilter(marker.type, filter);
}

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
  currentLocation,
}: {
  userData: User;
  toggleModal: ToggleModal;
  currentLocation: Coordinates;
}) {
  const { requests, unreadByConversation } = useRequests();
  const unread = unreadActivity(userData);
  const unreadChats = Object.keys(unreadByConversation).length;
  const siteCount = userData.organization.markers.length;
  const openRequests = requests.filter((r) => r.status === "open").length;
  const open = (type: ModalConfig["type"]) => () => toggleModal(true, { type });
  const locationLabel = siteCount === 1 ? "location" : "locations";

  const [routeAnchor, setRouteAnchor] = useState<HTMLElement | null>(null);
  const [routeFilter, setRouteFilter] = useState<RouteFilter | null>(null);

  const closestSites = useMemo(() => {
    if (!routeFilter) return [];
    return userData.organization.markers
      .filter((marker) => matchesRouteFilter(marker, routeFilter))
      .map((marker) => ({
        ...marker,
        distance: Geo.distance(marker, currentLocation),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
  }, [userData.organization.markers, currentLocation, routeFilter]);

  const closeRouteMenu = () => {
    setRouteAnchor(null);
    setRouteFilter(null);
  };

  const openMaps = (marker: Marker) => {
    const url = Geo.getAddressURL({
      mapChoice: userData.mapChoice,
      address: marker.address,
    });
    window.open(url, "_blank", "noopener,noreferrer");
    closeRouteMenu();
  };

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
          icon={<DirectionsOutlined />}
          label="Route"
          ariaLabel="Route"
          onClick={(event) => {
            setRouteAnchor(event.currentTarget);
            setRouteFilter(null);
          }}
        />
        <DockItem
          primary
          icon={<AddLocationAltOutlined />}
          label="Add"
          onClick={open("add-marker")}
        />
      </nav>

      <Menu
        anchorEl={routeAnchor}
        open={Boolean(routeAnchor)}
        onClose={closeRouteMenu}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        PaperProps={{ className: "route-menu" }}
      >
        {routeFilter === null ? (
          ROUTE_FILTERS.map(({ value, label }) => (
            <MenuItem key={value} onClick={() => setRouteFilter(value)}>
              {label}
            </MenuItem>
          ))
        ) : (
          <>
            <MenuItem className="route-menu-back" onClick={() => setRouteFilter(null)}>
              <ChevronLeft fontSize="small" />
              {ROUTE_FILTERS.find((f) => f.value === routeFilter)?.label}
            </MenuItem>
            {closestSites.length === 0 ? (
              <MenuItem disabled>No nearby sites</MenuItem>
            ) : (
              closestSites.map((marker) => (
                <MenuItem key={marker.id} onClick={() => openMaps(marker)}>
                  <span className="route-menu-site">
                    <span className="truncate">{marker.name}</span>
                    <span className="route-menu-distance">{formatDistance(marker.distance)}</span>
                  </span>
                </MenuItem>
              ))
            )}
          </>
        )}
      </Menu>
    </>
  );
}
