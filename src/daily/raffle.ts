import { cliExecute, print, visitUrl } from "kolmafia";
import { openBeach } from "./openBeach";

/**
 * Raffle tickets to buy at end of day: the "special" count when today's second
 * prize is one worth chasing, "basic" otherwise. Both 1 for now -- ticket
 * buyers are spending thousands, so extra tickets aren't worth it. Raise
 * RAFFLE_TICKETS_SPECIAL (it was 11) if that changes.
 */
export const RAFFLE_TICKETS_BASIC = 1;
export const RAFFLE_TICKETS_SPECIAL = 1;

function raffleTicketsToBuy(): number {
  const page = visitUrl("raffle.php");

  // The page also lists yesterday's winners below, whose prize names would
  // otherwise false-positive today's check -- restrict to the section that
  // actually names today's prizes.
  const start = page.indexOf("Today's Raffle Prize:");
  const end = page.indexOf("Winners of Yesterday's Raffle:");
  if (start === -1 || end === -1 || end <= start) {
    print(`couldn't find today's raffle prize on the page, buying ${RAFFLE_TICKETS_BASIC} ticket(s)`);
    return RAFFLE_TICKETS_BASIC;
  }
  const todaySection = page.slice(start, end);

  if (todaySection.includes("kneecapping contract") || todaySection.includes("Old Country cookbook")) {
    print(`raffle second prize is worth it, buying ${RAFFLE_TICKETS_SPECIAL} ticket(s)`);
    return RAFFLE_TICKETS_SPECIAL;
  }
  print(`raffle second prize isn't worth it, buying ${RAFFLE_TICKETS_BASIC} ticket(s)`);
  return RAFFLE_TICKETS_BASIC;
}

/** Ported from join_raffle() in general/end_of_day.ash. */
export function joinRaffle(): void {
  openBeach();
  cliExecute(`raffle ${raffleTicketsToBuy()}`);
}
