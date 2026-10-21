import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
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

type NotificationObject = Notification.Any;

const firstName = (name?: string) => name?.trim().split(/\s+/)[0] || "The gardener";

const REQUEST_COPY: Record<
  Notification.RequestNotification["type"],
  (data: Notification.RequestNotification["data"]) => React.ReactNode
> = {
  "new-service-request": () => (
    <>
      <b>New gardener request</b> near your crew
    </>
  ),
  "new-offer": (d) => (
    <>
      <b>{d.organizationName}</b> sent you an offer
    </>
  ),
  "offer-updated": (d) => (
    <>
      <b>{d.organizationName}</b> updated their offer
    </>
  ),
  "offer-withdrawn": (d) => (
    <>
      <b>{d.organizationName}</b> withdrew their offer
    </>
  ),
  "offer-accepted": (d) => (
    <>
      <b>{firstName(d.requesterName)}</b> accepted your offer
    </>
  ),
  "offer-declined": (d) => (
    <>
      <b>{firstName(d.requesterName)}</b> declined your offer
    </>
  ),
  "offer-closed": () => <>Another crew was booked for a request you offered on</>,
  "request-cancelled": (d) => (
    <>
      <b>{firstName(d.requesterName)}</b> cancelled their request
    </>
  ),
  "request-completed": (d) => (
    <>
      <b>{firstName(d.requesterName)}</b> marked a job complete
    </>
  ),
};

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
    case "offer-accepted":
    case "new-service-request":
    case "new-offer":
    case "offer-updated":
    case "offer-withdrawn":
    case "offer-declined":
    case "offer-closed":
    case "request-cancelled":
    case "request-completed": {
      const { data } = notification;
      if (!data?.serviceRequestId) return null;
      const back = { type: "notifications" as const };
      return {
        icon:
          notification.type === "offer-accepted" ? (
            <HandshakeOutlinedIcon />
          ) : notification.type === "new-service-request" ? (
            <AssignmentOutlinedIcon />
          ) : (
            <LocalOfferOutlinedIcon />
          ),
        title: REQUEST_COPY[notification.type](data),
        detail: data.summary ?? "",
        open: () =>
          notification.type === "offer-accepted" && data.conversationId
            ? toggleModal(true, { type: "chat", data: { conversationId: data.conversationId }, back })
            : toggleModal(true, { type: "request-details", data: { requestId: data.serviceRequestId }, back }),
      };
    }
    default:
      return null; // chat messages are surfaced in Messages, not here
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
    .sort((a, b) => (b.notification.createdAt ?? "").localeCompare(a.notification.createdAt ?? ""));

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
    const cleared = new Set(visible.map(({ notification }) => notification.id));
    cleared.forEach((id) => DB.deleteNotification({ id }));
    setUserData((current) =>
      current ? { ...current, notifications: current.notifications.filter((n) => !cleared.has(n.id)) } : current,
    );
  }

  if (visible.length === 0) {
    return (
      <ModalContent>
        <EmptyState
          icon={<NotificationsNoneOutlinedIcon />}
          title="You’re all caught up"
          description={
            userData.role === "gardner"
              ? "Offers and updates on your requests will appear here."
              : "New sites, gardener requests, and crew updates will appear here."
          }
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
