"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

export type UploadedFile = { url: string; filename: string; size: number; mimeType: string };

export function FileUpload({
  files,
  onChange,
}: {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError(null);

    try {
      const uploaded: UploadedFile[] = [];
      for (const file of Array.from(fileList)) {
        const blob = await upload(`concerns/${Date.now()}-${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        uploaded.push({
          url: blob.url,
          filename: file.name,
          size: file.size,
          mimeType: file.type,
        });
      }
      onChange([...files, ...uploaded]);
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeFile(url: string) {
    onChange(files.filter((f) => f.url !== url));
  }

  return (
    <div>
      <label
        htmlFor="file-upload"
        className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-brand-200 bg-brand-50/40 px-4 py-6 text-center transition-colors hover:bg-brand-50"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-500">
          <path d="M12 16V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" />
        </svg>
        <span className="text-sm font-medium text-brand-700">
          {uploading ? "Uploading…" : "Click to attach files or screenshots"}
        </span>
        <span className="text-xs text-brand-400">PNG, JPG, PDF up to 10MB each</span>
        <input
          id="file-upload"
          type="file"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f) => (
            <li
              key={f.url}
              className="flex items-center justify-between rounded-lg border border-brand-100 bg-white px-3 py-2 text-sm"
            >
              <a href={f.url} target="_blank" rel="noreferrer" className="truncate text-brand-700 hover:underline">
                {f.filename}
              </a>
              <button
                type="button"
                onClick={() => removeFile(f.url)}
                className="ml-2 text-xs font-medium text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
