"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle2, Camera } from "lucide-react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  maxFiles?: number;
}

export default function ImageDropzone({ files, onChange, disabled, maxFiles = 2 }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>("");
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (newFiles: File[]) => {
    setError("");
    if (disabled) return;

    // Check count limit
    const totalFiles = [...files, ...newFiles];
    if (totalFiles.length > maxFiles) {
      toast.warning(`Maximum ${maxFiles} entrance photo${maxFiles > 1 ? "s" : ""} allowed.`);
    }
    const limited = newFiles.slice(0, Math.max(0, maxFiles - files.length));

    // Validate size and format
    const valid: File[] = [];
    for (const f of limited) {
      const isAllowedType = ALLOWED_TYPES.includes(f.type) || /\.(png|jpe?g|webp)$/i.test(f.name);
      if (!isAllowedType) {
        const msg = `"${f.name}" is not a supported format. Please upload PNG, JPG, JPEG, or WebP images only.`;
        setError(msg);
        toast.error(msg);
        continue;
      }

      if (f.size > MAX_FILE_SIZE) {
        const sizeMB = (f.size / (1024 * 1024)).toFixed(2);
        const msg = `"${f.name}" exceeds the 2MB size limit (${sizeMB}MB). Please select an image under 2MB.`;
        setError(msg);
        toast.error(msg);
        continue;
      }

      valid.push(f);
    }

    if (valid.length > 0) {
      onChange([...files, ...valid].slice(0, maxFiles));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
    setError("");
  };

  const isFull = files.length >= maxFiles;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      {/* Hidden file input for Gallery selection */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        multiple
        disabled={disabled || isFull}
        style={{ display: "none" }}
        onChange={(e) => {
          const selected = Array.from(e.target.files ?? []);
          processFiles(selected);
          e.target.value = "";
        }}
      />

      {/* Hidden file input for Direct Camera capture */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        disabled={disabled || isFull}
        style={{ display: "none" }}
        onChange={(e) => {
          const selected = Array.from(e.target.files ?? []);
          processFiles(selected);
          e.target.value = "";
        }}
      />

      {/* Dropzone container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: isDragOver
            ? "2px dashed var(--orange)"
            : isFull
            ? "2px dashed var(--border)"
            : "2px dashed rgba(249,115,22,0.4)",
          background: isDragOver
            ? "var(--orange-subtle)"
            : "var(--surface2)",
          borderRadius: "var(--radius-sm)",
          padding: "1rem",
          textAlign: "center",
          transition: "all 0.2s ease",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}>
          <p style={{ fontSize: "0.84rem", fontWeight: 700, margin: 0 }}>
            {isFull
              ? `Maximum ${maxFiles} photo${maxFiles > 1 ? "s" : ""} selected`
              : "Add Doorstep Entrance Photo"}
          </p>

          {!isFull && (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
              {/* Direct Camera Button */}
              <button
                type="button"
                onClick={() => {
                  if (!disabled && cameraInputRef.current) {
                    cameraInputRef.current.click();
                  }
                }}
                disabled={disabled}
                className="btn btn-primary btn-sm"
                style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem", display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                <Camera size={15} />
                <span>Take Photo (Camera)</span>
              </button>

              {/* Gallery / File Picker Button */}
              <button
                type="button"
                onClick={() => {
                  if (!disabled && galleryInputRef.current) {
                    galleryInputRef.current.click();
                  }
                }}
                disabled={disabled}
                className="btn btn-outline btn-sm"
                style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem", display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                <Upload size={15} />
                <span>Choose from Gallery</span>
              </button>
            </div>
          )}

          <p className="text-muted" style={{ fontSize: "0.72rem", margin: 0 }}>
            {isFull
              ? "Remove a photo below to add or snap a new one."
              : `Or drag & drop files here · PNG, JPG, JPEG, WebP · Max 2MB (Up to ${maxFiles} file${maxFiles > 1 ? "s" : ""})`}
          </p>
        </div>
      </div>

      {/* Validation error message */}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--danger)", fontSize: "0.76rem" }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* File List / Previews */}
      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {files.map((file, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                padding: "0.45rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.8rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", overflow: "hidden" }}>
                <ImageIcon size={15} className="text-orange" style={{ flexShrink: 0 }} />
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontWeight: 600,
                    maxWidth: "180px",
                  }}
                >
                  {file.name}
                </span>
                <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                  ({(file.size / 1024).toFixed(0)} KB)
                </span>
                <CheckCircle2 size={13} style={{ color: "var(--success)", flexShrink: 0 }} />
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                disabled={disabled}
                className="btn btn-ghost btn-icon"
                style={{ padding: "0.25rem", height: "auto" }}
                title="Remove photo"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
