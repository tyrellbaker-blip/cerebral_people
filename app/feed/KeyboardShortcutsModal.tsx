"use client";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "C", description: "Comment on focused post" },
    { key: "J", description: "Navigate to next post" },
    { key: "K", description: "Navigate to previous post" },
    { key: "L", description: "Like the focused post (Support 💚)" },
    { key: "?", description: "Show/hide this help dialog" },
    { key: "Esc", description: "Close dialogs" },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-ink-900">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-ink-500 hover:text-ink-900 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-ink-500 mb-6">
          Use these keyboard shortcuts to navigate faster
        </p>

        <div className="space-y-3">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between py-2 border-b border-neutral-200 last:border-0"
            >
              <span className="text-sm text-ink-700">
                {shortcut.description}
              </span>
              <kbd className="px-3 py-1.5 rounded-lg bg-neutral-100 border border-neutral-300 font-mono font-semibold text-ink-900 text-sm min-w-[3rem] text-center">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-200">
          <p className="text-xs text-ink-500">
            Press <kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 font-mono">Esc</kbd> or click outside to close
          </p>
        </div>
      </div>
    </div>
  );
}
