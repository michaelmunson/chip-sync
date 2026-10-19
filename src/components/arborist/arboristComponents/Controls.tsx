import AddLocationAltOutlined from "@mui/icons-material/AddLocationAltOutlined";
import FormatListBulletedOutlined from "@mui/icons-material/FormatListBulletedOutlined";
import NotificationsNoneOutlined from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import ForestOutlined from "@mui/icons-material/ForestOutlined";
import { Badge, Button } from "@mui/material";
import "../../../css/controls.css";
import { User } from "../../../types/dataTypes";
import { ToggleModal } from "../../../types/generalTypes";

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
  return (
    <>
      <header className="workspace-header">
        <div className="workspace-brand">
          <span className="brand-symbol">
            <ForestOutlined />
          </span>
          <div>
            <strong>Chip Sync</strong>
            <span>Field workspace</span>
          </div>
        </div>
        <div className="workspace-organization">
          <strong>{userData.organization.name}</strong>
          <span>
            {userData.firstName} {userData.lastName}
          </span>
        </div>
      </header>
      <aside className="map-overview" aria-label="Workspace overview">
        <span className="eyebrow">YOUR NETWORK</span>
        <h1>Good work starts here.</h1>
        <p>Find your next drop site and keep your crew connected.</p>
        <div className="site-count">
          <strong>{userData.organization.markers.length}</strong>
          <span>saved drop sites</span>
        </div>
        <Button
          variant="outlined"
          onClick={() => toggleModal(true, { type: "marker-list" })}
        >
          Explore drop sites
        </Button>
      </aside>
      <nav className="workspace-navigation" aria-label="Workspace tools">
        <Button
          startIcon={<FormatListBulletedOutlined />}
          onClick={() => toggleModal(true, { type: "marker-list" })}
        >
          Sites
        </Button>
        <Button
          variant="contained"
          startIcon={<AddLocationAltOutlined />}
          onClick={() => toggleModal(true, { type: "add-marker" })}
        >
          Add site
        </Button>
        <Button
          startIcon={
            <Badge badgeContent={unread} color="error">
              <NotificationsNoneOutlined />
            </Badge>
          }
          aria-label={`Notifications, ${unread} unread`}
          onClick={() => toggleModal(true, { type: "notifications" })}
        >
          Activity
        </Button>
        <Button
          startIcon={<SettingsOutlined />}
          onClick={() => toggleModal(true, { type: "settings" })}
        >
          Settings
        </Button>
      </nav>
    </>
  );
}
