"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { buttonClass, type ButtonVariant } from "./button-styles";

export function CopyButton({ value, label = "Copy", variant = "secondary" }: { value: string; label?: string; variant?: ButtonVariant }) {
  const [done, setDone] = React.useState(false);
  return (
    <button
      type="button"
      className={buttonClass(variant, "sm")}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      }}
    >
      {done ? <Check aria-hidden /> : <Copy aria-hidden />}
      <span aria-live="polite">{done ? "Copied" : label}</span>
    </button>
  );
}
