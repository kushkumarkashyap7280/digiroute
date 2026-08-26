"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}

export default function ImageDropzone({ files, onChange, disabled }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = (newFiles: File[]) => {
    setError("");
    if (disabled) return;

    // Check count limit
    const totalFiles = [...files, ...newFiles];
    if (totalFiles.length > 2) {
      toast.warning("Maximum 2 entrance photos allowed.");
    }
    const limited = newFiles.slice(0, 2 - files.length);

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
      onChange([...files, ...valid].slice(0, 2));
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      {/* Dropzone container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && files.length < 2 && inputRef.current) {
            inputRef.current.click();
          }
        }}
        style={{
          border: isDragOver
            ? "2px dashed var(--orange)"
            : files.length >= 2
            ? "2px dashed var(--border)"
            : "2px dashed rgba(249,115,22,0.4)",
          background: isDragOver
            ? "var(--orange-subtle)"
            : "var(--surface2)",
          borderRadius: "var(--radius-sm)",
          padding: "1.25rem 1rem",
          textAlign: "center",
          cursor: disabled || files.length >= 2 ? "default" : "pointer",
          transition: "all 0.2s ease",
          position: "relative",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple
          disabled={disabled || files.length >= 2}
          style={{ display: "none" }}
          onChange={(e) => {
            const selected = Array.from(e.target.files ?? []);
            processFiles(selected);
            e.target.value = "";
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "var(--orange-subtle)",
              color: "var(--orange)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Upload size={18} />
          </div>

          <p style={{ fontSize: "0.85rem", fontWeight: 700, margin: 0 }}>
            {files.length >= 2
              ? "Maximum 2 photos selected"
              : "Drag & drop entrance photos here, or click to browse"}
          </p>

          <p className="text-muted" style={{ fontSize: "0.74rem", margin: 0 }}>
            Supports PNG, JPG, JPEG, WebP · Max 2MB per photo · Up to 2 files
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
