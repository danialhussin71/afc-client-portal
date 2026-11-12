"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Modal built on the native <dialog>: focus trap, Escape to close and the
 * backdrop come for free.
 *
 *   <Dialog trigger={<Button>Add action</Button>} title="Add an action">
 *     {(close) => <MyForm onDone={close} />}
 *   </Dialog>
 */
export function Dialog({
  trigger,
  title,
  description,
  size = "md",
  children,
}: {
  trigger: React.ReactElement;
  title: React.ReactNode;
  description?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
}) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const [open, setOpen] = React.useState(false);
  const titleId = React.useId();
  const close = React.useCallback(() => ref.current?.close(), []);

  const show = () => {
    setOpen(true);
    ref.current?.showModal();
  };

  return (
    <>
      <span className="contents" onClick={show}>
        {trigger}
      </span>
      <dialog
        ref={ref}
        data-ui="dialog"
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === ref.current && close()}
        aria-labelledby={titleId}
      >
        <div
          className={cn(
            "w-[calc(100vw-2rem)] rounded-2xl border border-line bg-surface shadow-lg",
            size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-lg"
          )}
        >
          <div className="flex items-start gap-4 px-6 pb-2 pt-5">
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="text-lg font-semibold tracking-tight text-ink">
                {title}
              </h2>
              {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="-mr-2 -mt-1 grid size-9 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-raised hover:text-ink"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="px-6 pb-6 pt-3">{open && (typeof children === "function" ? children(close) : children)}</div>
        </div>
      </dialog>
    </>
  );
}
