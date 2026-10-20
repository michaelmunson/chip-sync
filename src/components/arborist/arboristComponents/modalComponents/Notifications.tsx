import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { Button } from "@mui/material";
import React from "react";
import { Notification, User } from "../../../../types/dataTypes";
import { ModalConfig, ToggleModal } from "../../../../types/generalTypes";
import { DB } from "../../../../utils/database";
import { timeAgo } from "../../../../utils/format";
import EmptyState from "../../../utils/EmptyState";
import ModalButtons from "./modalUtils/ModalButtons";
import ModalContent from "./modalUtils/ModalContent";

type NotificationObject =
  | Notification.JoinReqNotification
  | Notification.MarkerNotification;

interface NotificationsProps {
  data?: ModalConfig["data"];
  userData: User;
  setUserData: React.Dispatch<React.SetStateAction<User | undefined>>;
  toggleModal: ToggleModal;
}

/** What a notification says and where tapping it leads. */
function describe(
  notification: NotificationObject,
  toggleModal: ToggleModal,
): { icon: React.ReactNode; title: React.ReactNode; detail: string; open: () => void } | null {
  switch (notification.type) {
    case "new-org-marker":
      return {
        icon: <PlaceOutlinedIcon />,
        title: "New drop site saved",
        detail: notification.data?.name ?? "",
        open: () =>
          toggleModal(true, {
            type: "marker-details",
            data: notification.data,
            goBackLocation: "notifications",
          }),
      };
    case "join-request": {
      const { firstName, lastName } = notification.data;
      return {
        icon: <PersonAddAltOutlinedIcon />,
        title: (
          <>
            <b>
              {firstName} {lastName}
            </b>{" "}
            joined your organization
          </>
        ),
        detail: "Manage members",
        open: () => toggleModal(true, { type: "settings", data: { page: "members" } }),
      };
    }
    default:
      return null; // e.g. gardener markers: nothing to show to arborists yet
  }
}

export default function Notifications({
  userData,
  setUserData,
  toggleModal,
}: NotificationsProps) {
  const visible = [...userData.notifications]
    .map((notification) => ({
      notification,
      view: describe(notification, toggleModal),
    }))
    .filter(
      (item): item is typeof item & { view: NonNullable<typeof item.view> } =>
        item.view !== null,
    )
    .sort((a, b) => (b.notification.timestamp ?? 0) - (a.notification.timestamp ?? 0));

  function markOpened(notification: NotificationObject) {
    if (notification.opened) return;
    setUserData((current) =>
      current
        ? {
            ...current,
            notifications: current.notifications.map((n) =>
              n.id === notification.id ? { ...n, opened: true } : n,
            ),
          }
        : current,
    );
    DB.updateNotification({ id: notification.id });
  }

  function clearNotifications() {
    userData.notifications.forEach((n) => DB.deleteNotification({ id: n.id }));
    setUserData((current) => (current ? { ...current, notifications: [] } : current));
  }

  if (visible.length === 0) {
    return (
      <ModalContent>
        <EmptyState
          icon={<NotificationsNoneOutlinedIcon />}
          title="You’re all caught up"
          description="New sites and crew updates will appear here."
        />
      </ModalContent>
    );
  }

  return (
    <>
      <ModalContent flush>
        <ul className="card-list">
          {visible.map(({ notification, view }) => (
            <li
              key={notification.id}
              className={`card${notification.opened ? "" : " card--unread"}`}
            >
              <button
                type="button"
                className="card-main"
                onClick={() => {
                  markOpened(notification);
                  view.open();
                }}
              >
                <span className="tile tile--brand" aria-hidden="true">
                  {view.icon}
                </span>
                <span className="card-body">
                  <span className="card-title">{view.title}</span>
                  <span className="card-sub truncate">
                    {view.detail}
                    {view.detail && " · "}
                    {timeAgo(notification.createdAt)}
                  </span>
                </span>
                {!notification.opened && (
                  <span className="unread-dot" role="img" aria-label="Unread" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </ModalContent>
      <ModalButtons>
        <Button color="error" variant="outlined" onClick={clearNotifications}>
          Clear all
        </Button>
      </ModalButtons>
    </>
  );
}
