import CloseIcon from "@mui/icons-material/Close";
import DirectionsOutlinedIcon from "@mui/icons-material/DirectionsOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { Button, Dialog, IconButton, Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Marker, User } from "../../../../types/dataTypes";
import { ToggleModal } from "../../../../types/generalTypes";
import { formatPhone } from "../../../../utils/format";
import { Geo } from "../../../../utils/location";
import { S3 } from "../../../../utils/storage";
import { MaterialPills, MaterialTile } from "../../../utils/Material";
import ModalButtons from "./modalUtils/ModalButtons";
import ModalContent from "./modalUtils/ModalContent";

interface MarkerDetailsProps {
  data: Marker;
  userData: User;
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

export default function MarkerDetails({
  data,
  userData,
  toggleModal,
}: MarkerDetailsProps) {
  const images = useMarkerImages(data);
  const [zoomed, setZoomed] = useState<string>();
  const directionsUrl = Geo.getAddressURL({
    mapChoice: userData.mapChoice,
    address: data.address,
  });
  const hasContact = Boolean(data.contact?.name || data.contact?.phone);

  return (
    <>
      <ModalContent>
        <div className="detail-hero">
          <MaterialTile type={data.type} large />
          <div>
            <h3>{data.name}</h3>
            <MaterialPills type={data.type} />
          </div>
        </div>

        <div className="group">
          <InfoRow icon={<PlaceOutlinedIcon />} label="Address">
            <a href={directionsUrl} target="_blank" rel="noreferrer">
              {data.address}
            </a>
          </InfoRow>
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

      <ModalButtons>
        <Button
          variant="outlined"
          startIcon={<EditOutlinedIcon />}
          onClick={() => toggleModal(true, { type: "edit-marker", data })}
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
    </>
  );
}
