import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Dialog, DialogTitle, IconButton } from "@mui/material";
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

  const ModalMap = {
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
        goBackLocation={goBackLocation}
        toggleModal={toggleModal}
      />
    ),

    settings: () => (
      <Settings
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
  };

  const titles = {
    "marker-list": "Drop sites",
    "add-marker": "Add a drop site",
    notifications: "Activity",
    "marker-details": "Site details",
    settings: "Workspace settings",
    "edit-marker": "Edit drop site",
  };

  return (
    <Dialog
      id="modal"
      className={`${type}-modal workspace-${theme}`}
      aria-labelledby="workspace-dialog-title"
      open={open}
      onClose={() => toggleModal(false)}
    >
      <DialogTitle id="workspace-dialog-title" className="dialog-heading">
        {titles[type]}
        <IconButton
          aria-label="Close dialog"
          onClick={() => toggleModal(false)}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      {ModalMap[type]()}
    </Dialog>
  );
}
