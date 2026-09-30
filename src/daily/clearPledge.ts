import { cliExecute, haveEffect } from "kolmafia";
import { $effect, set } from "libram";

/** Ported from daily-cap.ash's clear_pledge(). */
export function clearPledge(): void {
  const awkwardPledge = $effect`Citizen of a Zone`;
  if (haveEffect(awkwardPledge) > 0) {
    cliExecute(`shrug ${awkwardPledge.name}`);
    set("_citizenZone", "");
    set("_citizenZoneMods", "");
  }
}
