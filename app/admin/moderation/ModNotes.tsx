"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addModNote } from "./actions";

interface ModNote {
  id: string;
  note: string;
  adminUsername: string;
  adminName: string | null;
  createdAt: Date;
}

interface ModNotesProps {
  contentId: string;
  contentType: "POST" | "COMMENT";
  notes: ModNote[];
}

export default function ModNotes({
  contentId,
  contentType,
  notes,
}: ModNotesProps) {
  const [showForm, setShowForm] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      alert("Please enter a note");
      return;
    }

    startTransition(async () => {
      await addModNote(contentId, contentType, noteText);
      setNoteText("");
      setShowForm(false);
      router.refresh();
    });
  };

  return (
    <div className="mt-3">
      {/* Notes Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-ink-700">
          Mod Notes ({notes.length})
        </h4>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-brand-600 hover:text-brand-700"
          >
            + Add Note
          </button>
        )}
      </div>

      {/* Add Note Form */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Enter internal mod note..."
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 mb-2"
            rows={3}
            disabled={isPending}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddNote}
              disabled={isPending}
              className="px-3 py-1.5 text-xs bg-brand-600 text-white rounded hover:bg-brand-700 disabled:opacity-50"
            >
              {isPending ? "Adding..." : "Add Note"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setNoteText("");
              }}
              disabled={isPending}
              className="px-3 py-1.5 text-xs border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length > 0 ? (
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-neutral-50 border border-neutral-200 rounded-lg p-3"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="text-xs font-medium text-ink-700">
                  {note.adminName || note.adminUsername}
                </div>
                <div className="text-xs text-ink-500">
                  {new Date(note.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="text-sm text-ink-900 whitespace-pre-wrap">
                {note.note}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-ink-500 italic">No mod notes yet</p>
      )}
    </div>
  );
}
