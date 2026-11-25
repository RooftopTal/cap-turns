"""What is an adventure worth at the end of each leg? Late-run meat per
adventure from KoLmafia session logs. See docs/voa-experiment.md.

Each log day has three legs, split on markers cap always prints:
  morning    sober garbo turns, up to the nightcap ("Your ideal diet")
  overdrunk  garbo turns after the nightcap, up to the ascension
  evening    garbo turns after the ascension ("Successfully ascended!")
A leg can be several garbo runs (a restart after an abort); they're joined.

Per leg:
  lower   meat + items from the last N turn-taking Barf Mountain
          adventures, per adventure. This is the measure to judge VoA on.
  upper   the same window plus every free fight and free adventure inside
          it, over the same turns. Some of those are daily allowances that
          don't scale with turns, so this overstates.
  garbo   garbo's own "Marginal MPA" for the leg's longest run. Its items
          follow garbo's prices, which spike (knucklebones on Nov 6).
Items are valued at the higher of mall price (mafia's data/mallprices.txt,
the lowest current listing) and autosell. Any single drop worth at least
--outlier meat (default 100k) is left out and counted, since a rare drop
says nothing about what the next adventure is worth.

Usage:
  python -I tools/voa_report.py SESSIONS_DIR [--from YYYYMMDD] [--to YYYYMMDD]
      [--last 50] [--outlier 100000] [--items PATH/items.txt]
      [--prices PATH/mallprices.txt] [--player captain_yaksworth]
"""
import argparse
import collections
import glob
import html
import os
import re
import statistics

ADV = re.compile(r"^\[(\d+)\] (.+)$")
RUN = re.compile(r"This run of garbo, across ([\d,]+) turns")
MPA = re.compile(r"Marginal MPA: ([-\d,.NaN]+) \[raw\] \+ ([-\d,.NaN]+) \[items\].*= ([-\d,.NaN]+) \[total\]")
MEAT = re.compile(r"You gain ([\d,]+) Meat")
ITEM = re.compile(r"You acquire an item: (.+?)(?: \(([\d,]+)\))?$")
ITEMS = re.compile(r"You acquire (.+) \(([\d,]+)\)$")
FAMILIAR = re.compile(r"^familiar (.+?) \(\d+ lbs?\)$")
LEGS = ("morning", "overdrunk", "evening")
# Familiars whose drops stop at a daily cap. Garbo can run one right up to
# the end of a leg, but one more adventure would go to a different familiar,
# so their turns aren't marginal and are left out of the window.
CAPPED_FAMILIARS = {"Skeleton of Crimbo Past"}
# Lines that start a command rather than continue an adventure; anything
# gained after one (autosell meat, crafted items) isn't a drop.
COMMANDS = ("> ", "use ", "Create ", "buy ", "eat ", "drink ", "chew ", "autosell ", "mallsell",
            "sell ", "closet ", "equip ", "familiar ", "cast ", "acquire ", "pull ", "craft ",
            "cook ", "mix ", "smith ", "hermit ", "trade ", "put ", "take ", "mallsearch")


def num(s):
    return float("nan") if "NaN" in s else float(s.replace(",", ""))


def load_values(items_path, prices_path):
    ids, autosell = {}, {}
    for line in open(items_path, encoding="utf-8"):
        p = line.rstrip("\n").split("\t")
        if len(p) > 6 and p[0].isdigit():
            ids[html.unescape(p[1])] = int(p[0])
            autosell[int(p[0])] = int(p[6] or 0)
    mall = {}
    for line in open(prices_path, encoding="utf-8"):
        p = line.split("\t")
        if len(p) == 3 and p[0].isdigit():
            mall[int(p[0])] = int(p[2])
    return lambda name: max(mall.get(ids.get(html.unescape(name)), 0), autosell.get(ids.get(html.unescape(name)), 0))


def parse_day(path, value, last, outlier):
    """Yield one dict per leg that has enough Barf Mountain turns."""
    lines = open(path, encoding="utf-8", errors="replace").read().split("\n")
    legs = {name: {"blocks": [], "runs": []} for name in LEGS}
    leg, cur, prev, familiar = "morning", None, None, None
    for line in lines:
        m = FAMILIAR.match(line)
        if m:
            familiar = m.group(1)
        m = ADV.match(line)
        if m:
            t = int(m.group(1))
            # An adventure took a turn if the counter moved by the next one.
            if prev is not None:
                prev["paid"] = t > prev["turn"]
            cur = {"turn": t, "loc": m.group(2), "paid": False, "value": 0, "outliers": 0,
                   "capped": familiar in CAPPED_FAMILIARS}
            prev = cur
            legs[leg]["blocks"].append(cur)
            continue
        if line.startswith("> Your ideal diet") and leg == "morning":
            leg = "overdrunk"
        elif line.startswith("> Successfully ascended"):
            leg, prev = "evening", None
        m = RUN.search(line)
        if m:
            legs[leg]["runs"].append({"turns": int(m.group(1).replace(",", "")), "garbo": float("nan")})
        m = MPA.search(line)
        if m and legs[leg]["runs"]:
            legs[leg]["runs"][-1]["garbo"] = num(m.group(3))
        if line.startswith(COMMANDS):
            cur = None
            continue
        if cur is None:
            continue
        gained = 0
        m = MEAT.match(line.replace("After Battle: ", ""))
        if m:
            gained = int(m.group(1).replace(",", ""))
        m = ITEM.match(line) or ITEMS.match(line)
        if m:
            gained = value(m.group(1)) * int((m.group(2) or "1").replace(",", ""))
        if gained >= outlier:
            cur["outliers"] += 1
        else:
            cur["value"] += gained

    for name in LEGS:
        blocks, runs = legs[name]["blocks"], legs[name]["runs"]
        barf = [b for b in blocks if b["loc"] == "Barf Mountain" and b["paid"] and not b["capped"]]
        if not runs or len(barf) < last:
            continue
        first = barf[-last]
        window = [b for b in blocks[blocks.index(first):blocks.index(barf[-1]) + 1] if not b["capped"]]
        span = sum(b["paid"] for b in window)
        yield {
            "leg": name,
            "turns": sum(r["turns"] for r in runs),
            "garbo": max(runs, key=lambda r: r["turns"])["garbo"],
            "lower": sum(b["value"] for b in barf[-last:]) / last,
            "upper": sum(b["value"] for b in window) / span,
            "outliers": sum(b["outliers"] for b in window),
        }


def med(xs):
    xs = [x for x in xs if x == x]
    return statistics.median(xs) if xs else float("nan")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("sessions")
    ap.add_argument("--from", dest="start", default="00000000")
    ap.add_argument("--to", dest="end", default="99999999")
    ap.add_argument("--last", type=int, default=50)
    ap.add_argument("--outlier", type=int, default=100000)
    ap.add_argument("--player", default="captain_yaksworth")
    ap.add_argument("--items", default="C:/work/kolmafia/src/main/resources/data/items.txt")
    ap.add_argument("--prices", default="C:/work/kolmafia/data/mallprices.txt")
    a = ap.parse_args()
    value = load_values(a.items, a.prices)

    by_leg = collections.defaultdict(list)
    print(f"{'day':8} {'leg':9} {'turns':>5} {'lower':>6} {'upper':>6} {'garbo':>6} outliers")
    for path in sorted(glob.glob(os.path.join(a.sessions, f"{a.player}_2*.txt"))):
        day = os.path.basename(path)[-12:-4]
        if not (a.start <= day <= a.end):
            continue
        for r in parse_day(path, value, a.last, a.outlier):
            by_leg[r["leg"]].append(r)
            print(f"{day:8} {r['leg']:9} {r['turns']:5} {r['lower']:6.0f} {r['upper']:6.0f} "
                  f"{r['garbo']:6.0f} {r['outliers'] or ''}")

    print("\nmedians")
    for name in LEGS:
        rs = by_leg[name]
        if rs:
            print(f"  {name:9} n={len(rs):2}  lower {med(r['lower'] for r in rs):5.0f}  "
                  f"upper {med(r['upper'] for r in rs):5.0f}  garbo {med(r['garbo'] for r in rs):5.0f}")


if __name__ == "__main__":
    main()
