"use client";

import { useState } from "react";
import { useDebug, type DebugLogEntry } from "@/contexts/DebugContext";

function StatusBadge({ status, pending, error }: Pick<DebugLogEntry, "status" | "pending" | "error">) {
  if (pending) {
    return <span className="text-gray-400 text-xs font-mono animate-pulse">...</span>;
  }
  if (error) {
    return <span className="text-red-400 text-xs font-mono">ERR</span>;
  }
  if (!status) return null;

  const color =
    status < 300 ? "text-green-400" : status < 500 ? "text-amber-400" : "text-red-400";

  return <span className={`${color} text-xs font-mono`}>{status}</span>;
}

function MethodBadge({ method }: { method: string }) {
  const color = method === "GET" ? "bg-sky-600" : "bg-amber-600";
  return (
    <span className={`${color} text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded`}>
      {method}
    </span>
  );
}

function EntryRow({ entry }: { entry: DebugLogEntry }) {
  const [expanded, setExpanded] = useState(false);

  const timeStr = new Date(entry.timestamp).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 active:bg-white/10 transition-colors"
      >
        <span className="text-gray-500 text-[10px] font-mono shrink-0">{timeStr}</span>
        <MethodBadge method={entry.method} />
        <span className="text-gray-200 text-xs font-mono truncate flex-1">{entry.path}</span>
        <StatusBadge status={entry.status} pending={entry.pending} error={entry.error} />
        {entry.duration !== null && (
          <span className="text-gray-500 text-[10px] font-mono shrink-0">{entry.duration}ms</span>
        )}
        <span className="text-gray-500 text-xs">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {entry.requestBody && (
            <div>
              <div className="text-gray-500 text-[10px] font-mono uppercase mb-1">Request</div>
              <pre className="text-gray-300 text-[11px] font-mono bg-black/40 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                {entry.requestBody}
              </pre>
            </div>
          )}
          {entry.responseBody && (
            <div>
              <div className="text-gray-500 text-[10px] font-mono uppercase mb-1">Response</div>
              <pre className="text-gray-300 text-[11px] font-mono bg-black/40 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                {entry.responseBody}
              </pre>
            </div>
          )}
          {entry.error && (
            <div>
              <div className="text-red-400 text-[10px] font-mono uppercase mb-1">Error</div>
              <pre className="text-red-300 text-[11px] font-mono bg-black/40 rounded p-2">
                {entry.error}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DebugPanel() {
  const { entries, clear } = useDebug();
  const [open, setOpen] = useState(false);

  // Only render in development
  if (process.env.NODE_ENV !== "development") return null;

  const pendingCount = entries.filter((e) => e.pending).length;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[9999] bg-gray-900/80 backdrop-blur-sm text-white text-xs font-mono px-3 py-2 rounded-full border border-white/20 shadow-lg flex items-center gap-1.5 hover:bg-gray-900/90 active:scale-95 transition-all"
      >
        <span>🔍</span>
        <span>{entries.length}</span>
        {pendingCount > 0 && (
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        )}
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] h-[60vh] flex flex-col bg-gray-950/95 backdrop-blur-md border-t border-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-bold font-mono">API Debug</span>
          <span className="text-gray-500 text-xs font-mono">{entries.length} calls</span>
          {pendingCount > 0 && (
            <span className="text-amber-400 text-xs font-mono animate-pulse">
              {pendingCount} pending
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clear}
            className="text-gray-500 text-xs font-mono hover:text-gray-300 px-2 py-1 rounded active:bg-white/10 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-500 hover:text-gray-300 px-2 py-1 rounded active:bg-white/10 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Entries list */}
      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600 text-sm font-mono">
            No API calls yet
          </div>
        ) : (
          entries.map((entry) => <EntryRow key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  );
}
