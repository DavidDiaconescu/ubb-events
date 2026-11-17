"use client";

import { useEffect, useRef, type MouseEvent, type PointerEvent, type ReactNode } from "react";

/** How long the mouse may be outside the open menu (e.g. crossing the gap below the trigger) before it closes. */
const CLOSE_DELAY_MS = 250;

interface DropdownProps {
  /** The content of the always-visible trigger (rendered inside <summary>). */
  trigger: ReactNode;
  triggerClassName?: string;
  panelClassName?: string;
  children: ReactNode;
}

/**
 * A <details> dropdown that closes when the mouse leaves it, on a click outside it, on Escape and
 * after a link or button inside it is chosen. Touch input does not hover, so there it only closes
 * on an outside tap or a choice.
 */
export function Dropdown({ trigger, triggerClassName = "", panelClassName = "", children }: DropdownProps) {
  const ref = useRef<HTMLDetailsElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const details = ref.current;
    if (!details) return;

    function close() {
      window.clearTimeout(closeTimer.current);
      if (details) details.open = false;
    }
    function handlePointerDown(pointerEvent: globalThis.PointerEvent) {
      if (details?.open && !details.contains(pointerEvent.target as Node)) close();
    }
    function handleKeyDown(keyEvent: KeyboardEvent) {
      if (keyEvent.key !== "Escape" || !details?.open) return;
      close();
      details.querySelector("summary")?.focus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(closeTimer.current);
    };
  }, []);

  function handlePointerLeave(pointerEvent: PointerEvent<HTMLDetailsElement>) {
    const details = pointerEvent.currentTarget;
    if (pointerEvent.pointerType !== "mouse" || !details.open) return;
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      details.open = false;
    }, CLOSE_DELAY_MS);
  }

  function handlePanelClick(clickEvent: MouseEvent<HTMLDivElement>) {
    // A chosen item (link or button) closes the menu; the action itself still runs.
    if ((clickEvent.target as HTMLElement).closest("a, button")) {
      window.clearTimeout(closeTimer.current);
      if (ref.current) ref.current.open = false;
    }
  }

  return (
    <details
      ref={ref}
      className="relative"
      onPointerEnter={() => window.clearTimeout(closeTimer.current)}
      onPointerLeave={handlePointerLeave}
    >
      <summary className={`cursor-pointer list-none [&::-webkit-details-marker]:hidden ${triggerClassName}`}>{trigger}</summary>
      <div className={panelClassName} onClick={handlePanelClick}>{children}</div>
    </details>
  );
}
