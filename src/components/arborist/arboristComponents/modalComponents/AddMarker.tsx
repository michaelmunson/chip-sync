import React from "react";
import { MarkerKind } from "../../../../types/dataTypes";
import { Coordinates, ModalConfig, SetUserData, ToggleModal } from "../../../../types/generalTypes";
import { User } from "../../../../types/dataTypes";
import { DB } from "../../../../utils/database";
import MarkerForm, { MarkerFormDraft } from "./MarkerForm";

export interface JobFormDraft {
  name: string;
  notes: string;
  materials: string[];
  facilityIds: string[];
  jobSiteIds: string[];
  assigneeIds: string[];
  assigneeSites: Record<string, string>;
}

export interface AddLocationOptions {
  lockedKind?: MarkerKind;
  /** Preserve in-progress job form when adding a site from New job. */
  jobDraft?: JobFormDraft;
  /** After create, select the new marker on the job form under this field. */
  selectAs?: "facility" | "jobSite";
  /** Editing an existing marker's pin. */
  markerId?: string;
  draft?: MarkerFormDraft;
  origin?: { position: Coordinates; address: string };
}

interface AddMarkerProps {
  data?: ModalConfig["data"];
  userData: User;
  setUserData: SetUserData;
  toggleModal: ToggleModal;
  onChangeLocation: (opts: AddLocationOptions & { position: Coordinates; address: string }) => void;
}

export default function AddMarker({
  data,
  userData,
  setUserData,
  toggleModal,
  onChangeLocation,
}: AddMarkerProps) {
  const position = data?.position as Coordinates | undefined;
  const address = (data?.address as string) ?? "";
  const draft = data?.draft as MarkerFormDraft | undefined;
  const lockedKind = data?.lockedKind as MarkerKind | undefined;
  const jobDraft = data?.jobDraft as JobFormDraft | undefined;
  const selectAs = data?.selectAs as "facility" | "jobSite" | undefined;

  if (!position) {
    return null;
  }

  const returnToJob = (markerId?: string) => {
    if (!jobDraft) {
      toggleModal(false);
      return;
    }
    const next: JobFormDraft = {
      ...jobDraft,
      facilityIds:
        selectAs === "facility" && markerId
          ? [...jobDraft.facilityIds, markerId]
          : jobDraft.facilityIds,
      jobSiteIds:
        selectAs === "jobSite" && markerId
          ? [...jobDraft.jobSiteIds, markerId]
          : jobDraft.jobSiteIds,
    };
    toggleModal(true, {
      type: "job-form",
      data: { draft: next },
      back: { type: "job-list" },
    });
  };

  return (
    <MarkerForm
      position={position}
      address={address}
      draft={draft}
      lockedKind={lockedKind}
      submitLabel="Save location"
      onCancel={() => returnToJob()}
      onChangeLocation={(formDraft) =>
        onChangeLocation({
          position,
          address,
          draft: formDraft,
          lockedKind,
          jobDraft,
          selectAs,
          origin: { position, address },
        })
      }
      onSubmit={async (values) => {
        const created = await DB.createMarker({
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
          images: values.newPhotos,
          userData,
        });
        const next = await DB.getUser();
        if (next) setUserData(next);
        if (jobDraft) returnToJob(created.id);
        else toggleModal(false);
      }}
    />
  );
}
