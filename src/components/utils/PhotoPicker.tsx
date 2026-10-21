import AddAPhotoOutlinedIcon from "@mui/icons-material/AddAPhotoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { Skeleton } from "@mui/material";
import React, { useEffect, useMemo, useRef } from "react";
import { useSignedImages } from "./PhotoGallery";

export const MAX_PHOTOS = 8;

interface PhotoPickerProps {
  /** Already-uploaded storage keys (edit mode). */
  existing: string[];
  onExistingChange: (keys: string[]) => void;
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
}

export default function PhotoPicker({ existing, onExistingChange, files, onFilesChange, disabled }: PhotoPickerProps) {
  const input = useRef<HTMLInputElement>(null);
  const existingUrls = useSignedImages(existing);
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const remaining = MAX_PHOTOS - existing.length - files.length;

  const add = (list: FileList | null) => {
    if (!list) return;
    const images = Array.from(list).filter((file) => file.type.startsWith("image/"));
    onFilesChange([...files, ...images.slice(0, Math.max(remaining, 0))]);
    if (input.current) input.current.value = "";
  };

  return (
    <div className="photo-picker">
      {existing.map((key, index) => (
        <div className="thumb thumb--static" key={key}>
          {existingUrls ? <img src={existingUrls[index]} alt="" /> : <Skeleton variant="rectangular" height="100%" />}
          <button
            type="button"
            className="thumb-remove"
            aria-label={`Remove photo ${index + 1}`}
            disabled={disabled}
            onClick={() => onExistingChange(existing.filter((k) => k !== key))}
          >
            <CloseIcon fontSize="inherit" />
          </button>
        </div>
      ))}
      {previews.map((src, index) => (
        <div className="thumb thumb--static" key={src}>
          <img src={src} alt="" />
          <button
            type="button"
            className="thumb-remove"
            aria-label={`Remove ${files[index].name}`}
            disabled={disabled}
            onClick={() => onFilesChange(files.filter((_, i) => i !== index))}
          >
            <CloseIcon fontSize="inherit" />
          </button>
        </div>
      ))}
      {remaining > 0 && (
        <button
          type="button"
          className="thumb thumb--add"
          disabled={disabled}
          onClick={() => input.current?.click()}
        >
          <AddAPhotoOutlinedIcon />
          <span>Add photos</span>
        </button>
      )}
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => add(event.target.files)}
      />
    </div>
  );
}
