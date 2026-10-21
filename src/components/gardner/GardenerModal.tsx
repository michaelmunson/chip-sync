import React from "react";
import { User } from "../../types/dataTypes";
import { Coordinates, ModalConfig, SetUserData, ToggleModal } from "../../types/generalTypes";
import { RequestsAPI } from "../../utils/serviceRequests";
import { requestSummary } from "../../utils/requestFormat";
import Notifications from "../arborist/arboristComponents/modalComponents/Notifications";
import ChatThread from "../chat/ChatThread";
import ConversationList, { counterpartName } from "../chat/ConversationList";
import RequestDetails from "../requests/RequestDetails";
import RequestForm, { RequestFormDraft } from "../requests/RequestForm";
import { GardenerRequestList } from "../requests/RequestList";
import { useRequests } from "../requests/RequestsContext";
import DialogShell from "../utils/DialogShell";
import GardenerSettings from "./GardenerSettings";

export interface RequestFormData {
  requestId?: string;
  position?: Coordinates;
  address?: string;
  draft?: RequestFormDraft;
}

interface GardenerModalProps {
  open: boolean;
  config: ModalConfig;
  toggleModal: ToggleModal;
  userData: User;
  setUserData: SetUserData;
  theme: "light" | "dark";
  setTheme: React.Dispatch<React.SetStateAction<"light" | "dark">>;
  onNewRequest: () => void;
  onMovePin: (form: Required<Pick<RequestFormData, "position" | "address" | "draft">> & { requestId?: string }) => void;
}

const TITLES: Partial<Record<ModalConfig["type"], string>> = {
  "request-list": "My requests",
  "request-details": "Request",
  messages: "Messages",
  chat: "Chat",
  notifications: "Activity",
  settings: "Settings",
};

export default function GardenerModal({
  open,
  config,
  toggleModal,
  userData,
  setUserData,
  theme,
  setTheme,
  onNewRequest,
  onMovePin,
}: GardenerModalProps) {
  const store = useRequests();
  const { type, data, back } = config;

  const requestForm = () => {
    const form = (data ?? {}) as RequestFormData;
    const existing = form.requestId ? store.findRequest(form.requestId) : undefined;
    const position =
      form.position ?? (existing ? { latitude: existing.latitude, longitude: existing.longitude } : undefined);
    if (!position) return null;
    const address = form.address ?? existing?.address ?? "";
    const showDetails = (requestId: string) =>
      toggleModal(true, { type: "request-details", data: { requestId }, back: { type: "request-list" } });

    return (
      <RequestForm
        key={`${form.requestId ?? "new"}-${position.latitude}-${position.longitude}`}
        userData={userData}
        initial={existing}
        position={position}
        address={address}
        draft={form.draft}
        onCancel={() => (existing ? showDetails(existing.id) : toggleModal(false))}
        onChangeLocation={(draft) => onMovePin({ requestId: existing?.id, position, address, draft })}
        onSubmit={async (input, photos) => {
          const saved = existing
            ? await RequestsAPI.update(existing, input, photos)
            : await RequestsAPI.create(userData, input, photos.newPhotos);
          store.upsertRequest(saved);
          showDetails(saved.id);
        }}
      />
    );
  };

  const body: Partial<Record<ModalConfig["type"], () => React.ReactNode>> = {
    "request-list": () => <GardenerRequestList toggleModal={toggleModal} onNewRequest={onNewRequest} />,
    "request-details": () => (
      <RequestDetails
        key={data?.requestId}
        requestId={data?.requestId}
        userData={userData}
        toggleModal={toggleModal}
        back={back}
      />
    ),
    "request-form": requestForm,
    messages: () => <ConversationList toggleModal={toggleModal} />,
    chat: () => (
      <ChatThread key={data?.conversationId} conversationId={data?.conversationId} userData={userData} toggleModal={toggleModal} />
    ),
    notifications: () => (
      <Notifications data={data} userData={userData} setUserData={setUserData} toggleModal={toggleModal} />
    ),
    settings: () => <GardenerSettings userData={userData} setUserData={setUserData} theme={theme} setTheme={setTheme} />,
  };

  let title = TITLES[type] ?? "";
  let subtitle: string | undefined;
  if (type === "request-form") {
    const existing = data?.requestId ? store.findRequest(data.requestId) : undefined;
    title = existing ? "Edit request" : "Request a service";
    subtitle = existing ? requestSummary(existing) : "Nearby crews will send you offers";
  }
  if (type === "chat") {
    const conversation = store.conversations.find((c) => c.id === data?.conversationId);
    if (conversation) {
      title = counterpartName(conversation, "gardener");
      subtitle = conversation.summary ?? undefined;
    }
  }

  return (
    <DialogShell
      open={open}
      title={title}
      subtitle={subtitle}
      onBack={back ? () => toggleModal(true, back) : undefined}
      onClose={() => toggleModal(false)}
      tall={type === "chat"}
    >
      {body[type]?.() ?? null}
    </DialogShell>
  );
}
