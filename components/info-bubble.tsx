"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Délai d'appui long (ms) avant d'ouvrir la bulle sur un appareil tactile. */
export const LONG_PRESS_DELAY = 500;

/**
 * Vrai sur les appareils sans survol (tactiles), où l'appui long remplace le
 * survol. On teste la capacité d'entrée plutôt que la largeur d'écran : un
 * téléphone reste tactile en paysage, et un poste avec souris garde le survol.
 */
function useNoHover() {
  const [noHover, setNoHover] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: none)");
    const onChange = () => setNoHover(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return noHover;
}

/**
 * Bulle d'information attachée à un déclencheur. Sur un appareil qui survole
 * (souris, trackpad), elle s'ouvre au survol ; sur un appareil tactile, elle
 * s'ouvre par appui long (`LONG_PRESS_DELAY`) et se referme en touchant
 * ailleurs. Le contenu affiché est le même dans les deux cas.
 */
export function InfoBubble({ content, children }: { content: ReactNode; children: ReactNode }) {
  const noHover = useNoHover();
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancelPress() {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }

  useEffect(() => {
    return () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  if (!noHover) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor
        className="w-fit select-none"
        onContextMenu={(event) => event.preventDefault()}
        onPointerDown={() => {
          cancelPress();
          timer.current = setTimeout(() => {
            timer.current = null;
            setOpen(true);
            navigator.vibrate?.(15);
          }, LONG_PRESS_DELAY);
        }}
        onPointerUp={cancelPress}
        onPointerCancel={cancelPress}
      >
        {children}
      </PopoverAnchor>
      <PopoverContent>{content}</PopoverContent>
    </Popover>
  );
}
