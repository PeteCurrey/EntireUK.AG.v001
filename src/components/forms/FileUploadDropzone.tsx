"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Check, AlertCircle, Loader2, File } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export interface UploadedFileInfo {
  name: string;
  size: number;
  type: string;
}

interface FileUploadDropzoneProps {
  onFilesChanged: (files: UploadedFileInfo[]) => void;
  maxFiles?: number;
  maxSizeMb?: number;
}

export function FileUploadDropzone({
  onFilesChanged,
  maxFiles = 5,
  maxSizeMb = 15,
}: FileUploadDropzoneProps) {
  const [files, setFiles] = useState<UploadedFileInfo[]>([]);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "failed" | "unsupported" | "too_large"
  >("idle");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const handleProcessFiles = (fileList: FileList) => {
    setStatus("uploading");
    trackEvent({
      name: "file_upload_started",
      properties: { file_type: fileList[0]?.type || "unknown", file_size_category: "standard" },
    });

    // Simulate realistic upload latency
    setTimeout(() => {
      const newFiles: UploadedFileInfo[] = [...files];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];

        // Check size
        if (file.size > maxSizeMb * 1024 * 1024) {
          setStatus("too_large");
          trackEvent({ name: "file_upload_failed", properties: { reason: "too_large" } });
          return;
        }

        // Check type
        if (!allowedTypes.includes(file.type) && !file.name.endsWith(".pdf")) {
          setStatus("unsupported");
          trackEvent({ name: "file_upload_failed", properties: { reason: "unsupported_type" } });
          return;
        }

        if (newFiles.length < maxFiles) {
          newFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
          });
        }
      }

      setFiles(newFiles);
      onFilesChanged(newFiles);
      setStatus("idle");
      trackEvent({
        name: "file_upload_completed",
        properties: { file_type: "batch" },
      });
    }, 600);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesChanged(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium uppercase tracking-wider text-brand-graphite">
          Supporting Documents (Optional)
        </label>
        <span className="text-[11px] font-light text-brand-silver">
          PDF, Word, JPEG, PNG (Max {maxSizeMb}MB)
        </span>
      </div>

      {/* Drop area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 sm:p-8 rounded-sm border-2 border-dashed text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-brand-electric bg-brand-surface"
            : "border-brand-edge hover:border-brand-electric/50 bg-brand-surface/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleProcessFiles(e.target.files);
            }
          }}
        />

        <div className="w-10 h-10 rounded-sm bg-white border border-brand-edge flex items-center justify-center mx-auto mb-3 text-brand-silver">
          {status === "uploading" ? (
            <Loader2 className="w-5 h-5 animate-spin text-brand-electric" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
        </div>

        {status === "uploading" && (
          <p className="text-sm font-medium text-brand-electric">
            Uploading documents…
          </p>
        )}

        {status === "idle" && (
          <>
            <p className="text-sm font-light text-brand-graphite">
              <span className="font-medium text-brand-electric">Click to upload</span> or drag and drop files here
            </p>
            <p className="text-xs text-brand-silver mt-1">
              Title plans, OS extracts, planning documents, photographs or surveys
            </p>
          </>
        )}

        {status === "unsupported" && (
          <div className="flex items-center justify-center gap-2 text-xs text-rose-600 font-medium mt-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>This file type isn&apos;t supported. Please upload PDF, Word, or images.</span>
          </div>
        )}

        {status === "too_large" && (
          <div className="flex items-center justify-center gap-2 text-xs text-rose-600 font-medium mt-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>This file is too large. Please upload a file under {maxSizeMb}MB.</span>
          </div>
        )}

        {status === "failed" && (
          <div className="flex items-center justify-center gap-2 text-xs text-rose-600 font-medium mt-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Upload failed. Please try again.</span>
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-mono uppercase tracking-wider text-brand-silver">
            Attached Documents ({files.length})
          </p>
          <div className="space-y-1.5">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-sm bg-white border border-brand-edge text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <File className="w-3.5 h-3.5 text-brand-silver shrink-0" />
                  <span className="font-medium text-brand-graphite truncate">
                    {file.name}
                  </span>
                  <span className="text-brand-silver font-light shrink-0">
                    ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(idx);
                  }}
                  aria-label={`Remove ${file.name}`}
                  className="p-1 text-brand-silver hover:text-rose-600 rounded-sm hover:bg-rose-50 transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
