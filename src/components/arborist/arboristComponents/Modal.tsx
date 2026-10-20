import React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { Dialog, IconButton } from "@mui/material";
import {
  Coordinates,
  ModalConfig,
  ToggleModal,
} from "../../../types/generalTypes";
import { Marker, User } from "../../../types/dataTypes";
import MarkerList from "./modalComponents/MarkerList";
import AddMarker from "./modalComponents/AddMarker";
import Notifications from "./modalComponents/Notifications";
import "../../../css/modal.css";
import MarkerDetails from "./modalComponents/MarkerDetails";
import Settings from "./modalComponents/Settings";
import EditMarker from "./modalComponents/EditMarker";

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

const TITLES: Record<ModalConfig["type"], string> = {
  "marker-list": "Drop sites",
  "add-marker": "Add a drop site",
  notifications: "Activity",
  "marker-details": "Site details",
  settings: "Settings",
  "edit-marker": "Edit drop site",
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
  const { type, data, goBackLocation } = modalConfig;

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
  }[type];

  /** Where the header back arrow leads, if anywhere. */
  const goBack = (): (() => void) | undefined => {
    if (type === "marker-details" && goBackLocation) {
      return () => toggleModal(true, { type: goBackLocation });
    }
    if (type === "edit-marker" && data) {
      return () => toggleModal(true, { type: "marker-details", data });
    }
    return undefined;
  };
  const back = goBack();

  return (
    <Dialog
      id="modal"
      aria-labelledby="workspace-dialog-title"
      open={open}
      onClose={() => toggleModal(false)}
    >
      <header className={`dialog-header${back ? " dialog-header--back" : ""}`}>
        {back && (
          <IconButton aria-label="Back" onClick={back}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <div className="dialog-heading">
          <h2 id="workspace-dialog-title">{TITLES[type]}</h2>
        </div>
        <IconButton aria-label="Close dialog" onClick={() => toggleModal(false)}>
          <CloseIcon />
        </IconButton>
      </header>
      {body()}
    </Dialog>
  );
}
