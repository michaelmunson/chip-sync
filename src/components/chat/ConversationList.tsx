import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import { Alert, Skeleton } from "@mui/material";
import React from "react";
import { Conversation } from "../../types/dataTypes";
import { ToggleModal } from "../../types/generalTypes";
import { nameInitials, timeAgo } from "../../utils/format";
import ModalContent from "../arborist/arboristComponents/modalComponents/modalUtils/ModalContent";
import EmptyState from "../utils/EmptyState";
import { RequestsRole, useRequests } from "../requests/RequestsContext";

/** The other party's name from the viewer's side. */
export function counterpartName(conversation: Conversation, role: RequestsRole) {
  return role === "gardener" ? conversation.organizationName : conversation.gardenerName;
}

export default function ConversationList({ toggleModal }: { toggleModal: ToggleModal }) {
  const store = useRequests();
  const { conversations, unreadByConversation, role } = store;

  return (
    <ModalContent flush>
      {store.error && (
        <Alert severity="warning" sx={{ m: 2 }}>
          {store.error}
        </Alert>
      )}
      {!store.ready ? (
        <ul className="card-list" aria-busy="true" aria-label="Loading conversations">
          {[0, 1].map((i) => (
            <li key={i}>
              <Skeleton variant="rounded" height={76} />
            </li>
          ))}
        </ul>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={<ForumOutlinedIcon />}
          title="No conversations yet"
          description={
            role === "gardener"
              ? "When you accept a crew’s offer, a chat opens here so you can plan the visit."
              : "When a gardener accepts one of your offers, a chat opens here so you can plan the job."
          }
        />
      ) : (
        <ul className="card-list">
          {conversations.map((conversation) => {
            const unread = unreadByConversation[conversation.id] ?? 0;
            const name = counterpartName(conversation, role);
            const request = store.findRequest(conversation.serviceRequestId);
            const closed = request && (request.status === "completed" || request.status === "cancelled");
            return (
              <li key={conversation.id} className={`card${unread ? " card--unread" : ""}`}>
                <button
                  type="button"
                  className="card-main"
                  onClick={() =>
                    toggleModal(true, {
                      type: "chat",
                      data: { conversationId: conversation.id },
                      back: { type: "messages" },
                    })
                  }
                  aria-label={`${name}${unread ? `, ${unread} unread` : ""}`}
                >
                  <span className="avatar">{nameInitials(name)}</span>
                  <span className="card-body">
                    <span className="convo-top">
                      <span className="card-title truncate">{name}</span>
                      <span className="convo-time">{timeAgo(conversation.lastMessageAt)}</span>
                    </span>
                    <span className="card-sub truncate">
                      {conversation.summary}
                      {closed ? ` · ${request?.status === "completed" ? "Completed" : "Cancelled"}` : ""}
                    </span>
                    <span className={`convo-preview truncate${unread ? " convo-preview--unread" : ""}`}>
                      {conversation.lastMessageSenderSide === (role === "gardener" ? "gardener" : "organization")
                        ? "You: "
                        : ""}
                      {conversation.lastMessagePreview ?? "No messages yet"}
                    </span>
                  </span>
                  {unread > 0 && <span className="count-badge">{unread > 9 ? "9+" : unread}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </ModalContent>
  );
}
