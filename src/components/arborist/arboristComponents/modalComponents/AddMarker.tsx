import React from "react";
import { Coordinates, ModalConfig, SetUserData, ToggleModal } from "../../../../types/generalTypes";
import { User } from "../../../../types/dataTypes";
import { DB } from "../../../../utils/database";
import MarkerForm from "./MarkerForm";

interface AddMarkerProps {
  data?: ModalConfig["data"];
  userData: User;
  setUserData: SetUserData;
  toggleModal: ToggleModal;
  currentLocation: Coordinates;
}

export default function AddMarker({
  userData,
  setUserData,
  toggleModal,
  currentLocation,
}: AddMarkerProps) {
  return (
    <MarkerForm
      currentLocation={currentLocation}
      submitLabel="Save location"
      onCancel={() => toggleModal(false)}
      onSubmit={async (values) => {
        await DB.createMarker({ ...values, images: [], userData });
        const next = await DB.getUser();
        if (next) setUserData(next);
        toggleModal(false);
      }}
    />
  );
}
