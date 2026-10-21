import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import React from "react";
import {
  Coordinates,
  ModalConfig,
  ToggleModal,
} from "../../../types/generalTypes";
import { Marker, User } from "../../../types/dataTypes";
import MarkerList from "./modalComponents/MarkerList";
import AddMarker from "./modalComponents/AddMarker";
import Notifications from "./modalComponents/Notifications";
import MarkerDetails from "./modalComponents/MarkerDetails";
import Settings from "./modalComponents/Settings";
import EditMarker from "./modalComponents/EditMarker";
import DialogShell from "../../utils/DialogShell";
import EmptyState from "../../utils/EmptyState";
import ModalContent from "./modalComponents/modalUtils/ModalContent";
import { CrewRequestBoard } from "../../requests/RequestList";
import RequestDetails from "../../requests/RequestDetails";
import OfferForm from "../../requests/OfferForm";
import { useRequests } from "../../requests/RequestsContext";
import ConversationList, { counterpartName } from "../../chat/ConversationList";
import ChatThread from "../../chat/ChatThread";
import { RequestsAPI } from "../../../utils/serviceRequests";
import { requestSummary } from "../../../utils/requestFormat";
import JobList from "../../jobs/JobList";
import JobForm from "../../jobs/JobForm";
import JobDetails from "../../jobs/JobDetails";

interface ModalProps {
  open: boolean;
  userData: User;
  theme: "light" | "dark";
  setUserData: React.Dispatch<React.SetStateAction<User | undefined>>;
  setTheme: React.Dispatch<React.SetStateAction<"light" | "dark">>;
  modalConfig: ModalConfig;
  toggleModal: ToggleModal;
  currentLocation: Coordinates;
}

const TITLES: Partial<Record<ModalConfig["type"], string>> = {
  "marker-list": "Locations",
  "add-marker": "Add a location",
  notifications: "Activity",
  "marker-details": "Location details",
  settings: "Settings",
  "edit-marker": "Edit location",
  "request-list": "Gardener requests",
  "request-details": "Request",
  "offer-form": "Your offer",
  messages: "Messages",
  chat: "Chat",
  "job-list": "Jobs",
  "job-form": "New job",
  "job-details": "Job",
};

export default function Modal({
  open,
  userData,
  modalConfig,
  theme,
  toggleModal,
  setUserData,
  setTheme,
  currentLocation,
}: ModalProps) {
  const { type, data, goBackLocation, back: backConfig } = modalConfig;
  const store = useRequests();

  const offerFormBody = () => {
    const request = store.findRequest(data?.requestId);
    const back = () => (backConfig ? toggleModal(true, backConfig) : toggleModal(false));
    if (!request) {
      return (
        <ModalContent>
          <EmptyState
            icon={<SearchOffOutlinedIcon />}
            title="Request unavailable"
            description="This request was closed or removed."
          />
        </ModalContent>
      );
    }
    const existing = data?.offerId ? store.offers.find((o) => o.id === data.offerId) : undefined;
    return (
      <OfferForm
        request={request}
        initial={existing}
        editing={Boolean(data?.editing && existing)}
        onCancel={back}
        onSubmit={async (input) => {
          const offer =
            data?.editing && existing
              ? await RequestsAPI.updateOffer(request, existing, input)
              : await RequestsAPI.createOffer(userData, request, input);
          store.upsertOffers([offer]);
          back();
        }}
      />
    );
  };

  const body = {
    "marker-list": () => (
      <MarkerList
        userData={userData}
        toggleModal={toggleModal}
        currentLocation={currentLocation}
      />
    ),
    "add-marker": () => (
      <AddMarker
        data={data}
        userData={userData}
        setUserData={setUserData}
        toggleModal={toggleModal}
        currentLocation={currentLocation}
      />
    ),
    notifications: () => (
      <Notifications
        data={data}
        userData={userData}
        toggleModal={toggleModal}
        setUserData={setUserData}
      />
    ),
    "marker-details": () => (
      <MarkerDetails
        data={data as Marker}
        userData={userData}
        toggleModal={toggleModal}
      />
    ),
    settings: () => (
      <Settings
        data={data}
        theme={theme}
        userData={userData}
        setTheme={setTheme}
        setUserData={setUserData}
        toggleModal={toggleModal}
      />
    ),
    "edit-marker": () => (
      <EditMarker
        data={data as Marker}
        userData={userData}
        setUserData={setUserData}
        toggleModal={toggleModal}
        currentLocation={currentLocation}
      />
    ),
    "request-list": () => (
      <CrewRequestBoard userData={userData} toggleModal={toggleModal} currentLocation={currentLocation} />
    ),
    "request-details": () => (
      <RequestDetails
        key={data?.requestId}
        requestId={data?.requestId}
        userData={userData}
        toggleModal={toggleModal}
        currentLocation={currentLocation}
        back={backConfig}
      />
    ),
    "offer-form": offerFormBody,
    messages: () => <ConversationList toggleModal={toggleModal} />,
    chat: () => (
      <ChatThread key={data?.conversationId} conversationId={data?.conversationId} userData={userData} toggleModal={toggleModal} />
    ),
    "request-form": () => null,
    "job-list": () => <JobList userData={userData} toggleModal={toggleModal} />,
    "job-form": () => <JobForm userData={userData} toggleModal={toggleModal} />,
    "job-details": () => (
      <JobDetails
        key={data?.jobId}
        jobId={data?.jobId}
        userData={userData}
        toggleModal={toggleModal}
        back={backConfig}
      />
    ),
  }[type];

  /** Where the header back arrow leads, if anywhere. */
  const goBack = (): (() => void) | undefined => {
    if (backConfig) return () => toggleModal(true, backConfig);
    if (type === "marker-details" && goBackLocation) {
      return () => toggleModal(true, { type: goBackLocation });
    }
    if (type === "edit-marker" && data) {
      return () => toggleModal(true, { type: "marker-details", data });
    }
    return undefined;
  };

  let title = TITLES[type] ?? "";
  let subtitle: string | undefined;
  if (type === "chat") {
    const conversation = store.conversations.find((c) => c.id === data?.conversationId);
    if (conversation) {
      title = counterpartName(conversation, "organization");
      subtitle = conversation.summary ?? undefined;
    }
  }
  if (type === "offer-form") {
    const request = store.findRequest(data?.requestId);
    title = data?.editing ? "Edit your offer" : "Make an offer";
    subtitle = request ? requestSummary(request) : undefined;
  }

  return (
    <DialogShell
      open={open}
      title={title}
      subtitle={subtitle}
      onBack={goBack()}
      onClose={() => toggleModal(false)}
      tall={type === "chat"}
    >
      {body()}
    </DialogShell>
  );
}
