import { useEffect, useImperativeHandle, useRef, useState, type KeyboardEvent, type Ref } from "react";

export type CommandInputHandle = { clear(): void };

type Props = {
  onSubmit: (text: string) => void;
  /** Reports every value change so global hotkeys know when the input is empty. */
  onValueChange?: (value: string) => void;
  placeholder?: string;
  /** Imperative handle: the digit hotkeys clear a lone digit once it fires. */
  ref?: Ref<CommandInputHandle>;
};

/**
 * The keyboard input. It is always focused: on mount, after any blur, and
 * whenever a printable key is pressed anywhere on the page (VISION 3,
 * "keyboard chat, always focused, no click needed").
 */
export function CommandInput({ onSubmit, onValueChange, placeholder = "Say something…", ref: handle }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValueState] = useState("");
  const setValue = (v: string) => {
    setValueState(v);
    onValueChange?.(v);
  };
  useImperativeHandle(handle, () => ({ clear: () => setValue("") }));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const refocus = (e: FocusEvent) => {
      // A field marked data-keep-focus (the token prompt) may hold focus;
      // otherwise defer so a programmatic blur can finish before we pull
      // focus back.
      const to = e.relatedTarget as Element | null;
      if (to?.closest?.("[data-keep-focus]")) return;
      window.setTimeout(() => {
        if (document.activeElement?.closest?.("[data-keep-focus]")) return;
        el.focus();
      }, 0);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (document.activeElement === el) return;
      if (document.activeElement?.closest?.("[data-keep-focus]")) return;
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
        // Consumed: the global key handler must not also treat this Enter
        // as "confirm the pending proposal" now that the input is empty
        // (review 2026-10-29, item 3). An Enter on an empty input is left
        // alone so it can reach a Confirm card's hotkey.
        e.preventDefault();
      }
    }
    if (e.key === "Escape" && value !== "") {
      setValue("");
      e.stopPropagation();
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
