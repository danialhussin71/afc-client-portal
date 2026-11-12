"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { inputClass } from "./Field";

/** Password field with show/hide and a Caps Lock warning. */
export function PasswordInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = React.useState(false);
  const [caps, setCaps] = React.useState(false);

  const checkCaps = (e: React.KeyboardEvent<HTMLInputElement>) => setCaps(e.getModifierState?.("CapsLock") ?? false);

  return (
    <div>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          className={cn(inputClass, "h-11 pr-11 sm:h-10", className)}
          onKeyUp={checkCaps}
          onKeyDown={checkCaps}
          onBlur={() => setCaps(false)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-ink-faint transition-colors hover:text-ink"
        >
          {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </button>
      </div>
      {caps && <p className="mt-1.5 text-[13px] text-warning">Caps Lock is on.</p>}
    </div>
  );
}
