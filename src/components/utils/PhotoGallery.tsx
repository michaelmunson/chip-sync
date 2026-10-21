import CloseIcon from "@mui/icons-material/Close";
import { Dialog, IconButton, Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { S3 } from "../../utils/storage";

/** Signed URLs for storage keys; `null` while loading. */
export function useSignedImages(keys: string[]) {
  const joined = keys.join("|");
  const [urls, setUrls] = useState<string[] | null>(keys.length ? null : []);

  useEffect(() => {
    if (!keys.length) return setUrls([]);
    let cancelled = false;
    setUrls(null);
    S3.getImages({ images: keys })
      .then((sources) => !cancelled && setUrls(sources))
      .catch(() => !cancelled && setUrls([]));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined]);

  return urls;
}

export function Lightbox({ src, alt, onClose }: { src?: string; alt: string; onClose: () => void }) {
  return (
    <Dialog className="lightbox" open={Boolean(src)} onClose={onClose} aria-label="Photo">
      <IconButton className="lightbox-close" aria-label="Close photo" onClick={onClose}>
        <CloseIcon />
      </IconButton>
      {src && <img src={src} alt={alt} />}
    </Dialog>
  );
}

/** Thumbnail grid with a tap-to-zoom lightbox. Renders nothing when there are no photos. */
export default function PhotoGallery({ keys, label }: { keys: string[]; label: string }) {
  const urls = useSignedImages(keys);
  const [zoomed, setZoomed] = useState<string>();

  if (urls !== null && urls.length === 0) return null;

  return (
    <>
      <div className="section-label">Photos</div>
      <div className="thumb-grid">
        {urls === null
          ? keys.map((key) => (
              <Skeleton key={key} variant="rounded" sx={{ aspectRatio: "1", height: "auto" }} />
            ))
          : urls.map((src, index) => (
              <button
                type="button"
                className="thumb"
                key={`${src}-${index}`}
                aria-label={`View photo ${index + 1} of ${label}`}
                onClick={() => setZoomed(src)}
              >
                <img src={src} alt="" loading="lazy" />
              </button>
            ))}
      </div>
      <Lightbox src={zoomed} alt={`Photo of ${label}`} onClose={() => setZoomed(undefined)} />
    </>
  );
}
