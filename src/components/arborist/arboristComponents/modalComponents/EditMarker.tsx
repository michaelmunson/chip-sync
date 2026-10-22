import React from "react";
import { Coordinates, ToggleModal } from "../../../../types/generalTypes";
import { Marker, User } from "../../../../types/dataTypes";
import { DB } from "../../../../utils/database";
import MarkerForm, { MarkerFormDraft } from "./MarkerForm";
import { AddLocationOptions } from "./AddMarker";

interface EditMarkerProps {
  data: Marker;
  userData: User;
  toggleModal: ToggleModal;
  setUserData: React.Dispatch<React.SetStateAction<User | undefined>>;
  position?: Coordinates;
  address?: string;
  draft?: MarkerFormDraft;
  onChangeLocation: (opts: AddLocationOptions & { position: Coordinates; address: string }) => void;
}

export default function EditMarker({
  data,
  userData,
  setUserData,
  toggleModal,
  position: positionOverride,
  address: addressOverride,
  draft,
  onChangeLocation,
}: EditMarkerProps) {
  const position: Coordinates = positionOverride ?? {
    latitude: data.latitude,
    longitude: data.longitude,
  };
  const address = addressOverride ?? data.address;

  const showDetails = (marker: Marker) =>
    toggleModal(true, { type: "marker-details", data: marker });

  return (
    <MarkerForm
      initial={data}
      position={position}
      address={address}
      draft={draft}
      submitLabel="Save changes"
      onCancel={() => showDetails(data)}
      onChangeLocation={(formDraft) =>
        onChangeLocation({
          position,
          address,
          draft: formDraft,
          markerId: data.id,
          origin: { position, address },
        })
      }
      onSubmit={async (values) => {
        const marker = await DB.updateMarker({
          id: data.id,
          type: values.type,
          kind: values.kind,
          startDate: values.startDate,
          endDate: values.endDate,
          name: values.name,
          address: values.address,
          description: values.description,
          contact: values.contact,
          latitude: values.latitude,
          longitude: values.longitude,
          keepImages: values.keepImages,
          newPhotos: values.newPhotos,
          organizationId: userData.organization.id,
        });
        const newUserData = await DB.getUser();
        if (newUserData) setUserData(newUserData);
        showDetails(marker);
      }}
    />
  );
}
