import * as React from "react";
import Link from "next/link";
import { buttonClass, type ButtonSize, type ButtonVariant } from "./button-styles";

type Look = { variant?: ButtonVariant; size?: ButtonSize };

/** A plain button. For form submits use <SubmitButton>, which shows a pending state. */
export function Button({ variant, size, className, type = "button", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & Look) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

/** A link that looks like a button. */
export function ButtonLink({ variant, size, className, ...props }: React.ComponentProps<typeof Link> & Look) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
