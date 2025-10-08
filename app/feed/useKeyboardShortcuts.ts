import { useEffect, useCallback, useState } from "react";

interface KeyboardShortcutsConfig {
  onCompose?: () => void;
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
  onLike?: () => void;
  onShowHelp?: () => void;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Handle ESC to close help modal
      if (event.key === "Escape") {
        if (showHelp) {
          event.preventDefault();
          setShowHelp(false);
          return;
        }
      }

      // Don't trigger shortcuts when typing in inputs or textareas
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Exception: Allow '?' to show help even in inputs
        if (event.key !== "?") {
          return;
        }
      }

      switch (event.key.toLowerCase()) {
        case "c":
          event.preventDefault();
          config.onCompose?.();
          break;
        case "j":
          event.preventDefault();
          config.onNavigateNext?.();
          break;
        case "k":
          event.preventDefault();
          config.onNavigatePrev?.();
          break;
        case "l":
          event.preventDefault();
          config.onLike?.();
          break;
        case "?":
          event.preventDefault();
          setShowHelp((prev) => !prev);
          config.onShowHelp?.();
          break;
      }
    },
    [config, showHelp]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  return { showHelp, setShowHelp };
}
