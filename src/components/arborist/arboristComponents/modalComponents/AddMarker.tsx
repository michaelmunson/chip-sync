import React from "react";
import { Coordinates, ModalConfig, ToggleModal } from "../../../../types/generalTypes";
import { User } from "../../../../types/dataTypes";
import { DB } from "../../../../utils/database";
import MarkerForm from "./MarkerForm";

interface AddMarkerProps {
  data?: ModalConfig["data"];
  userData: User;
  toggleModal: ToggleModal;
  currentLocation: Coordinates;
}

export default function AddMarker({
  userData,
  toggleModal,
  currentLocation,
}: AddMarkerProps) {
  return (
    <MarkerForm
      currentLocation={currentLocation}
      submitLabel="Save drop site"
      onCancel={() => toggleModal(false)}
      onSubmit={async (values) => {
        await DB.createMarker({ ...values, images: [], userData });
        toggleModal(false);
      }}
    />
  );
}
