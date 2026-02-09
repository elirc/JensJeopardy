"use client";

import { useState, useRef } from "react";
import { exportGame, importGame } from "@/app/games/actions";

interface ImportExportButtonsProps {
  gameId: string;
}

export default function ImportExportButtons({
  gameId,
}: ImportExportButtonsProps) {
  const [message, setMessage] = useState("");
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    setExporting(true);
    setMessage("");
    const result = await exportGame(gameId);
    setExporting(false);
    if (result.success) {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jeopardy-game-${gameId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage("Exported!");
      setTimeout(() => setMessage(""), 2000);
    } else {
      setMessage(result.error);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage("");
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const result = await importGame(json);
      if (result.success) {
        window.location.href = `/games/${result.data.gameId}/edit`;
      } else {
        setMessage(result.error);
      }
    } catch {
      setMessage("Invalid JSON file");
    }
    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleExport}
        disabled={exporting}
        className="border border-gray-600 text-gray-300 px-4 py-2 rounded text-sm hover:border-gray-400 hover:text-white transition-colors disabled:opacity-50"
      >
        {exporting ? "Exporting..." : "Export JSON"}
      </button>
      <label className="border border-gray-600 text-gray-300 px-4 py-2 rounded text-sm hover:border-gray-400 hover:text-white transition-colors cursor-pointer">
        {importing ? "Importing..." : "Import JSON"}
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
          disabled={importing}
        />
      </label>
      {message && (
        <span
          className={`text-sm ${message === "Exported!" ? "text-green-400" : "text-red-400"}`}
        >
          {message}
        </span>
      )}
    </div>
  );
}
