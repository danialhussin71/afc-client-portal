"use client";

import { useFormStatus } from "react-dom";
import { buttonClass, type Variant } from "./button-styles";


export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

/**
 * Submit button for forms that use Server Actions.
 * Disables itself and shows `pendingText` while the action runs, so people
 * can't double-submit.
 */
export function SubmitButton({
  children,
  pendingText = "Working…",
  variant = "primary",
  className,
}: {
  children: React.ReactNode;
  pendingText?: string;
  variant?: Variant;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={buttonClass(variant, className)}>
      {pending && (
        <span
          aria-hidden
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      )}
      {pending ? pendingText : children}
    </button>
  );
}
