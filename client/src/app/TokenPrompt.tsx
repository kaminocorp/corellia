import { useEffect, useRef, useState, type KeyboardEvent } from "react";

type Props = {
  /** Called with the token the user typed; the caller stores it and reconnects. */
  onSubmit: (token: string) => void;
};

/**
 * Shown when the backend answers 401/403: the device token can be typed
 * here instead of being pasted into the URL. The field holds focus (the
 * command input yields to `data-keep-focus`) and Enter submits.
 */
export function TokenPrompt({ onSubmit }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  useEffect(() => {
    ref.current?.focus();
  }, []);
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter" && value.trim()) {
      onSubmit(value.trim());
      setValue("");
      e.preventDefault();
    }
  };
  return (
    <div data-keep-focus className="absolute top-24 left-1/2 w-full max-w-md -translate-x-1/2 border border-border bg-card/95 p-4 font-mono text-sm backdrop-blur" role="dialog" aria-label="Device token prompt">
      <div className="mb-2 text-xs tracking-[0.2em] text-muted-foreground uppercase">device token required</div>
      <p className="mb-3 text-muted-foreground">The backend has CORELLIA_DEVICE_TOKEN set. Paste the token and press Enter.</p>
      <label className="flex items-center gap-3 border-b border-border py-2">
        <span aria-hidden className="text-primary">
          ›
        </span>
        <input
          ref={ref}
          type="password"
          aria-label="Device token"
          autoComplete="off"
          spellCheck={false}
          className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
          placeholder="token"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </label>
    </div>
  );
}
