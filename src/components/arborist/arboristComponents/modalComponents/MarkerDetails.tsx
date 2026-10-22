import ApartmentOutlined from "@mui/icons-material/ApartmentOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ForestOutlined from "@mui/icons-material/ForestOutlined";
import ConstructionOutlined from "@mui/icons-material/ConstructionOutlined";
import DirectionsOutlinedIcon from "@mui/icons-material/DirectionsOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import GroupOutlined from "@mui/icons-material/GroupOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import {
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  FormControlLabel,
  IconButton,
  Skeleton,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { Marker, User } from "../../../../types/dataTypes";
import { SetUserData, ToggleModal } from "../../../../types/generalTypes";
import { DB } from "../../../../utils/database";
import { formatPhone } from "../../../../utils/format";
import { JobsAPI } from "../../../../utils/jobs";
import { Geo } from "../../../../utils/location";
import { KIND_LABEL, markerKind } from "../../../../utils/markers";
import { S3 } from "../../../../utils/storage";
import ConfirmDialog from "../../../utils/ConfirmDialog";
import { MaterialPills, MaterialTile } from "../../../utils/Material";
import ModalButtons from "./modalUtils/ModalButtons";
import ModalContent from "./modalUtils/ModalContent";

interface MarkerDetailsProps {
  data: Marker;
  userData: User;
  setUserData: SetUserData;
  toggleModal: ToggleModal;
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="info-row">
      {icon}
      <div className="info-row-body">
        <div className="info-row-label">{label}</div>
        <div className="info-row-value">{children}</div>
      </div>
    </div>
  );
}

/** Loads signed image URLs; `null` while loading. */
function useMarkerImages(marker: Marker) {
  const [images, setImages] = useState<string[] | null>(
    marker.images.length ? null : [],
  );

  useEffect(() => {
    if (!marker.images.length) return setImages([]);
    let cancelled = false;
    setImages(null);
    S3.getImages({ images: marker.images })
      .then((sources: string[]) => !cancelled && setImages(sources))
      .catch(() => !cancelled && setImages([]));
    return () => {
      cancelled = true;
    };
  }, [marker]);

  return images;
}

function KindHero({ kind }: { kind: ReturnType<typeof markerKind> }) {
  const icon =
    kind === "facility" ? (
      <ApartmentOutlined />
    ) : kind === "jobSite" ? (
      <ConstructionOutlined />
    ) : (
      <ForestOutlined />
    );
  return (
    <span className={`tile tile--lg tile--${kind}`} aria-hidden="true">
      {icon}
    </span>
  );
}

export default function MarkerDetails({
  data,
  userData,
  setUserData,
  toggleModal,
}: MarkerDetailsProps) {
  const images = useMarkerImages(data);
  const [zoomed, setZoomed] = useState<string>();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const kind = markerKind(data);
  const directionsUrl = Geo.getAddressURL({
    mapChoice: userData.mapChoice,
    address: data.address,
  });
  const hasContact = Boolean(data.contact?.name || data.contact?.phone);
  const members = useMemo(
    () =>
      (userData.organization.users ?? []).filter(
        (user) => user.role === "admin" || user.role === "member",
      ),
    [userData.organization.users],
  );

  const [assignedIds, setAssignedIds] = useState<string[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(kind !== "dropSite");
  const [savingMembers, setSavingMembers] = useState(false);
  const [memberError, setMemberError] = useState("");

  const removeLocation = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await DB.deleteMarker({ id: data.id });
      setUserData((current) =>
        current
          ? {
              ...current,
              organization: {
                ...current.organization,
                markers: current.organization.markers.filter((m) => m.id !== data.id),
              },
            }
          : current,
      );
      toggleModal(true, { type: "marker-list" });
    } catch {
      setDeleteError("Couldn’t delete this location. Please try again.");
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (kind === "dropSite") return;
    let cancelled = false;
    setLoadingMembers(true);
    JobsAPI.listLocationAssignmentsForMarker(data.id)
      .then((rows) => {
        if (!cancelled) setAssignedIds(rows.map((r) => r.userId));
      })
      .catch(() => {
        if (!cancelled) setMemberError("Couldn’t load assigned members.");
      })
      .finally(() => {
        if (!cancelled) setLoadingMembers(false);
      });
    return () => {
      cancelled = true;
    };
  }, [data.id, kind]);

  const toggleMember = (userId: string) =>
    setAssignedIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    );

  const saveMembers = async () => {
    setSavingMembers(true);
    setMemberError("");
    try {
      await JobsAPI.setLocationMembers({
        organizationId: userData.organization.id,
        markerId: data.id,
        userIds: assignedIds,
      });
    } catch {
      setMemberError("Couldn’t save member assignments.");
    } finally {
      setSavingMembers(false);
    }
  };

  return (
    <>
      <ModalContent>
        <div className="detail-hero">
          {kind === "dropSite" ? (
            <MaterialTile type={data.type} large />
          ) : (
            <KindHero kind={kind} />
          )}
          <div>
            <h3>{data.name}</h3>
            <div className="pill-row">
              <span className="pill">{KIND_LABEL[kind]}</span>
              {kind === "dropSite" && <MaterialPills type={data.type} />}
            </div>
          </div>
        </div>

        <div className="group">
          <InfoRow icon={<PlaceOutlinedIcon />} label="Address">
            <a href={directionsUrl} target="_blank" rel="noreferrer">
              {data.address}
            </a>
          </InfoRow>
          {kind === "jobSite" && (data.startDate || data.endDate) && (
            <InfoRow icon={<ConstructionOutlined />} label="Active dates">
              {data.startDate}
              {data.endDate && data.endDate !== data.startDate ? ` – ${data.endDate}` : ""}
            </InfoRow>
          )}
          {hasContact && (
            <InfoRow icon={<PersonOutlineIcon />} label="Contact">
              {data.contact.name && <div>{data.contact.name}</div>}
              {data.contact.phone && (
                <a href={`tel:${data.contact.phone}`}>
                  {formatPhone(data.contact.phone)}
                </a>
              )}
            </InfoRow>
          )}
          {data.description && (
            <InfoRow icon={<NotesOutlinedIcon />} label="Notes">
              {data.description}
            </InfoRow>
          )}
        </div>

        {kind !== "dropSite" && (
          <div className="group">
            <div className="section-label">
              <GroupOutlined fontSize="small" /> Assigned members
            </div>
            {loadingMembers ? (
              <Skeleton variant="rounded" height={72} />
            ) : (
              <div className="member-assign-list">
                {members.length === 0 ? (
                  <p className="muted">No org members yet.</p>
                ) : (
                  members.map((user) => (
                    <FormControlLabel
                      key={user.id}
                      control={
                        <Checkbox
                          checked={assignedIds.includes(user.id)}
                          onChange={() => toggleMember(user.id)}
                        />
                      }
                      label={`${user.firstName} ${user.lastName}`.trim()}
                    />
                  ))
                )}
                {memberError && <p className="form-error">{memberError}</p>}
                <Button
                  size="small"
                  variant="outlined"
                  disabled={savingMembers || members.length === 0}
                  startIcon={
                    savingMembers ? <CircularProgress size={14} color="inherit" /> : undefined
                  }
                  onClick={saveMembers}
                >
                  {savingMembers ? "Saving…" : "Save members"}
                </Button>
              </div>
            )}
          </div>
        )}

        {(images === null || images.length > 0) && (
          <>
            <div className="section-label">Photos</div>
            <div className="thumb-grid">
              {images === null
                ? data.images.map((_, index) => (
                    <Skeleton
                      key={index}
                      variant="rounded"
                      sx={{ aspectRatio: "1", height: "auto" }}
                    />
                  ))
                : images.map((src, index) => (
                    <button
                      type="button"
                      className="thumb"
                      key={`${src}-${index}`}
                      aria-label={`View photo ${index + 1} of ${data.name}`}
                      onClick={() => setZoomed(src)}
                    >
                      <img src={src} alt="" loading="lazy" />
                    </button>
                  ))}
            </div>
          </>
        )}
      </ModalContent>

      {deleteError && <p className="form-error">{deleteError}</p>}

      <ModalButtons split>
        <Button
          variant="text"
          color="error"
          startIcon={<DeleteOutlineIcon />}
          onClick={() => setConfirmDelete(true)}
        >
          Delete
        </Button>
        <span className="grow" />
        <Button
          variant="outlined"
          startIcon={<EditOutlinedIcon />}
          onClick={() => toggleModal(true, { type: "edit-marker", data: { marker: data } })}
        >
          Edit
        </Button>
        <Button
          variant="contained"
          component="a"
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          startIcon={<DirectionsOutlinedIcon />}
        >
          Directions
        </Button>
      </ModalButtons>

      <Dialog
        className="lightbox"
        open={Boolean(zoomed)}
        onClose={() => setZoomed(undefined)}
        aria-label="Photo"
      >
        <IconButton
          className="lightbox-close"
          aria-label="Close photo"
          onClick={() => setZoomed(undefined)}
        >
          <CloseIcon />
        </IconButton>
        {zoomed && <img src={zoomed} alt={`Photo of ${data.name}`} />}
      </Dialog>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${data.name}?`}
        confirmLabel="Delete"
        tone="error"
        busy={deleting}
        onCancel={() => !deleting && setConfirmDelete(false)}
        onConfirm={removeLocation}
      >
        <p>This removes the location from your map for the whole crew. This can’t be undone.</p>
      </ConfirmDialog>
    </>
  );
}
