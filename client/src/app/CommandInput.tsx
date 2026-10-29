import { useEffect, useRef, useState, type KeyboardEvent } from "react";

type Props = {
  onSubmit: (text: string) => void;
  /** Escape with an empty input (used to cancel the running turn). */
  onEscapeEmpty?: () => void;
  placeholder?: string;
};

/**
 * The keyboard input. It is always focused: on mount, after any blur, and
 * whenever a printable key is pressed anywhere on the page (VISION 3,
 * "keyboard chat, always focused, no click needed").
 */
export function CommandInput({ onSubmit, onEscapeEmpty, placeholder = "Say something…" }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const refocus = () => {
      // Defer so a programmatic blur (e.g. a dialog in a later phase) can
      // finish before we pull focus back.
      window.setTimeout(() => el.focus(), 0);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (document.activeElement === el) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length === 1 || e.key === "Backspace" || e.key === "Enter") el.focus();
    };
    el.addEventListener("blur", refocus);
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("blur", refocus);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      const text = value.trim();
      if (text) {
        onSubmit(text);
        setValue("");
      }
      e.preventDefault();
    }
    if (e.key === "Escape") {
      if (value === "") onEscapeEmpty?.();
      setValue("");
    }
  };

  return (
    <label className="flex items-center gap-3 border-b border-border py-2 font-mono text-base">
      <span aria-hidden className="text-primary">
        ›
      </span>
      <input
        ref={ref}
        aria-label="Message"
        autoFocus
        autoComplete="off"
        spellCheck={false}
        className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
      />
    </label>
  );
}
