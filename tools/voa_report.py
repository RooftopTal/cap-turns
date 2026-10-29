"""What were garbo turns worth? Three views from KoLmafia session logs, per day
and per half (morning/evening garbo run). See docs/voa-experiment.md.

1. garbo's own "Marginal MPA" line, printed at the end of each run.
2. Our own count: meat + items dropped in the last N turn-taking Barf
   Mountain fights of the run (lower bound), and the same window with the
   free fights inside it added (upper bound). Items are valued at the higher
   of mall price (mafia's data/mallprices.txt) and autosell.
3. The day's totals: everything garbo generated across all its runs.

Usage:
  python -I tools/voa_report.py SESSIONS_DIR [--from YYYYMMDD] [--to YYYYMMDD]
      [--last 50] [--items PATH/items.txt] [--prices PATH/mallprices.txt]
      [--player captain_yaksworth]
"""
import argparse
import collections
import glob
import html
import os
import re
import statistics

ADV = re.compile(r"^\[(\d+)\] (.+)$")
RUN = re.compile(r"This run of garbo, across ([\d,]+) turns you generated ([-\d,]+) meat")
MPA = re.compile(r"Marginal MPA: ([-\d,.NaN]+) \[raw\] \+ ([-\d,.NaN]+) \[items\].*= ([-\d,.NaN]+) \[total\]")
MEAT = re.compile(r"You gain ([\d,]+) Meat")
ITEM = re.compile(r"You acquire an item: (.+?)(?: \(([\d,]+)\))?$")
ITEMS = re.compile(r"You acquire (.+) \(([\d,]+)\)$")
# A main garbo run is a few hundred turns; the short pre-ascension (overdrunk)
# runs are under 150.
MORNING_MIN, EVENING_MIN = 450, 250


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


def half(turns):
    return "morning" if turns > MORNING_MIN else "evening" if turns > EVENING_MIN else None


def parse_day(path, value, last):
    """Yield one dict per main garbo run in this log."""
    lines = open(path, encoding="utf-8", errors="replace").read().split("\n")
    blocks, cur, prev_turn, run = [], None, None, None
    totals = {"turns": 0, "meat": 0}
    for line in lines:
        m = ADV.match(line)
        if m:
            t = int(m.group(1))
            paid = prev_turn is not None and t > prev_turn
            cur = {"turn": t, "loc": m.group(2), "paid": paid, "value": 0, "meat": 0}
            prev_turn = t
            blocks.append(cur)
            continue
        m = RUN.search(line)
        if m:
            turns = int(m.group(1).replace(",", ""))
            totals["turns"] += turns
            totals["meat"] += int(m.group(2).replace(",", ""))
            run = {"half": half(turns), "turns": turns, "garbo": None}
            barf = [b for b in blocks if b["loc"] == "Barf Mountain" and b["paid"]]
            if run["half"] and len(barf) >= last:
                first = barf[-last]
                window = blocks[blocks.index(first):]
                span = barf[-1]["turn"] - first["turn"] + 1
                run["lower"] = sum(b["meat"] + b["value"] for b in barf[-last:]) / last
                run["upper"] = sum(b["meat"] + b["value"] for b in window) / span
            blocks, cur = [], None
            continue
        m = MPA.search(line)
        if m and run is not None:
            run["garbo"] = num(m.group(3))
            if run["half"]:
                yield run
            run = None
            continue
        # Commands between fights (buying, crafting, using) aren't drops.
        if line.startswith(("> ", "use ", "Create ", "buy ", "eat ", "drink ", "chew ")):
            cur = None
            continue
        if cur is None:
            continue
        stripped = line.replace("After Battle: ", "")
        m = MEAT.match(stripped)
        if m:
            cur["meat"] += int(m.group(1).replace(",", ""))
        m = ITEM.match(line) or ITEMS.match(line)
        if m:
            cur["value"] += value(m.group(1)) * int((m.group(2) or "1").replace(",", ""))
    yield {"half": "day", **totals}


def med(xs):
    xs = [x for x in xs if x == x]
    return statistics.median(xs) if xs else float("nan")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("sessions")
    ap.add_argument("--from", dest="start", default="00000000")
    ap.add_argument("--to", dest="end", default="99999999")
    ap.add_argument("--last", type=int, default=50)
    ap.add_argument("--player", default="captain_yaksworth")
    ap.add_argument("--items", default="C:/work/kolmafia/src/main/resources/data/items.txt")
    ap.add_argument("--prices", default="C:/work/kolmafia/data/mallprices.txt")
    a = ap.parse_args()
    value = load_values(a.items, a.prices)

    by_half = collections.defaultdict(list)
    print(f"{'day':8} {'half':7} {'garbo':>6} {'lower':>6} {'upper':>6}")
    for path in sorted(glob.glob(os.path.join(a.sessions, f"{a.player}_2*.txt"))):
        day = os.path.basename(path)[-12:-4]
        if not (a.start <= day <= a.end):
            continue
        for r in parse_day(path, value, a.last):
            by_half[r["half"]].append(r)
            if r["half"] == "day":
                print(f"{day:8} {'total':7} {r['meat']:>12,.0f} meat over {r['turns']} garbo turns")
            else:
                print(f"{day:8} {r['half']:7} {r['garbo']:6.0f} {r.get('lower', float('nan')):6.0f} {r.get('upper', float('nan')):6.0f}")

    print("\nmedians")
    for h in ("morning", "evening"):
        rs = by_half[h]
        if rs:
            print(f"  {h:7} n={len(rs):2}  garbo {med(r['garbo'] for r in rs):5.0f}  "
                  f"lower {med(r.get('lower', float('nan')) for r in rs):5.0f}  "
                  f"upper {med(r.get('upper', float('nan')) for r in rs):5.0f}")
    days = by_half["day"]
    if days:
        print(f"  day     n={len(days):2}  garbo generated {med(d['meat'] for d in days):,.0f} meat "
              f"over {med(d['turns'] for d in days):.0f} turns")


if __name__ == "__main__":
    main()
