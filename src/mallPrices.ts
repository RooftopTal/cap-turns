import { checkMallPrices } from "./mall/checkMallPrices";

/** `mall-prices` in the gCLI: just the price report, without a whole cap day.
 * Not named check_mall_prices -- mafia resolves scripts by filename across the
 * whole scripts tree, and the ASH original still lives in scripts/cap/mall/. */
export function main(): void {
  checkMallPrices();
}
