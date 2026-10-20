import React from "react";
import { Coordinates, ToggleModal } from "../../../../types/generalTypes";
import { Marker, User } from "../../../../types/dataTypes";
import { DB } from "../../../../utils/database";
import MarkerForm from "./MarkerForm";

interface EditMarkerProps {
  data: Marker;
  userData: User;
  toggleModal: ToggleModal;
  setUserData: React.Dispatch<React.SetStateAction<User | undefined>>;
  currentLocation: Coordinates;
}

export default function EditMarker({
  data,
  setUserData,
  toggleModal,
  currentLocation,
}: EditMarkerProps) {
  const showDetails = (marker: Marker) =>
    toggleModal(true, { type: "marker-details", data: marker });

  return (
    <MarkerForm
      initial={data}
      currentLocation={currentLocation}
      submitLabel="Save changes"
      onCancel={() => showDetails(data)}
      onSubmit={async (values) => {
        const marker = await DB.updateMarker({ id: data.id, ...values });
        const newUserData = await DB.getUser();
        if (newUserData) setUserData(newUserData);
        showDetails(marker);
      }}
    />
  );
}
