'use strict';

var kolmafia = require('kolmafia');

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _createForOfIteratorHelper(r, e) {
  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) {
      t && (r = t);
      var n = 0,
        F = function () {};
      return {
        s: F,
        n: function () {
          return n >= r.length ? {
            done: true
          } : {
            done: false,
            value: r[n++]
          };
        },
        e: function (r) {
          throw r;
        },
        f: F
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o,
    a = true,
    u = false;
  return {
    s: function () {
      t = t.call(r);
    },
    n: function () {
      var r = t.next();
      return a = r.done, r;
    },
    e: function (r) {
      u = true, o = r;
    },
    f: function () {
      try {
        a || null == t.return || t.return();
      } finally {
        if (u) throw o;
      }
    }
  };
}
function _taggedTemplateLiteral(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, {
    raw: {
      value: Object.freeze(t)
    }
  }));
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

var concatTemplateString = function concatTemplateString(literals) {
  for (var _len = arguments.length, placeholders = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    placeholders[_key - 1] = arguments[_key];
  }
  return literals.raw.reduce((acc, literal, i) => acc + literal + (placeholders[i] ?? ""), "");
};
var handleTypeGetError = (Type, error) => {
  var message = "".concat(error);
  var match = message.match(RegExp("Bad ".concat(Type.name.toLowerCase(), " value: .*")));
  if (match) {
    kolmafia.print("".concat(match[0], "; if you're certain that this ").concat(Type.name, " exists and is spelled correctly, please update KoLMafia"), "red");
  } else {
    kolmafia.print(message);
  }
};
var createSingleConstant = (Type, converter) => {
  var tagFunction = function tagFunction(literals) {
    for (var _len2 = arguments.length, placeholders = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      placeholders[_key2 - 1] = arguments[_key2];
    }
    var input = concatTemplateString.apply(void 0, [literals].concat(placeholders));
    try {
      return Type.get(input);
    } catch (error) {
      handleTypeGetError(Type, error);
    }
    kolmafia.abort();
  };
  tagFunction.cls = Type;
  tagFunction.none = Type.none;
  tagFunction.get = name => {
    var value = converter(name);
    return value === Type.none ? null : value;
  };
  return tagFunction;
};
/**
 * A Bounty specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Bounty, kolmafia.toBounty);
/**
 * A Class specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Class, kolmafia.toClass);
/**
 * A Coinmaster specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Coinmaster, kolmafia.toCoinmaster);
/**
 * An Effect specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Effect, kolmafia.toEffect);
/**
 * An Element specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Element, kolmafia.toElement);
/**
 * A Familiar specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Familiar, kolmafia.toFamiliar);
/**
 * An Item specified by name.
 *
 * @category In-game constant
 */
var $item = createSingleConstant(kolmafia.Item, kolmafia.toItem);
/**
 * A Location specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Location, kolmafia.toLocation);
/**
 * A Modifier specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Modifier, kolmafia.toModifier);
/**
 * A Monster specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Monster, kolmafia.toMonster);
/**
 * A Path specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Path, kolmafia.toPath);
/**
 * A Phylum specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Phylum, kolmafia.toPhylum);
/**
 * A Servant specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Servant, kolmafia.toServant);
/**
 * A Skill specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Skill, kolmafia.toSkill);
/**
 * A Slot specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Slot, kolmafia.toSlot);
/**
 * A Stat specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Stat, kolmafia.toStat);
/**
 * A Thrall specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Thrall, kolmafia.toThrall);

/** From mall_overrides.ash. A fixed ceiling rather than the live mall
 * price, which go_to_fantasyrealm/check_tickets deliberately don't trust. */
var LYLECO_GUIDE_OVERRIDE = 2_000_000;

var _templateObject$1, _templateObject2$1, _templateObject3$1, _templateObject4, _templateObject5, _templateObject6, _templateObject7, _templateObject8, _templateObject9, _templateObject0, _templateObject1, _templateObject10, _templateObject11, _templateObject12, _templateObject13, _templateObject14, _templateObject15, _templateObject16, _templateObject17, _templateObject18, _templateObject19;

/**
 * Everything mall-prices tracks, and the source of truth for the sheet's
 * "Purchasing power (auto)" tab. One entry per real item.
 *
 * - currency: what IotMs get bought with, valued but not a goal.
 * - want: things to buy. Listed in priority order -- the sheet's "next
 *   purchase" is the first one.
 * - sell: held only to sell later.
 * - keep: could sell, probably won't.
 */

var TRACKED = [{
  item: $item(_templateObject$1 || (_templateObject$1 = _taggedTemplateLiteral(["Mr. Accessory"]))),
  kind: "currency"
}, {
  item: $item(_templateObject2$1 || (_templateObject2$1 = _taggedTemplateLiteral(["Uncle Buck"]))),
  kind: "currency"
}, {
  item: $item(_templateObject3$1 || (_templateObject3$1 = _taggedTemplateLiteral(["Comprehensive Cartographic Compendium"]))),
  kind: "want"
}, {
  item: $item(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["kneecapping contract"]))),
  kind: "want"
}, {
  item: $item(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["Old Country cookbook"]))),
  kind: "want"
}, {
  item: $item(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["Pok\xE9fam Guide to Capturing All of Them"]))),
  kind: "want"
}, {
  item: $item(_templateObject7 || (_templateObject7 = _taggedTemplateLiteral(["box o' ghosts"]))),
  kind: "want"
}, {
  item: $item(_templateObject8 || (_templateObject8 = _taggedTemplateLiteral(["meteorite fragment"]))),
  kind: "want"
}, {
  item: $item(_templateObject9 || (_templateObject9 = _taggedTemplateLiteral(["Order of the Green Thumb Order Form"]))),
  kind: "want"
}, {
  item: $item(_templateObject0 || (_templateObject0 = _taggedTemplateLiteral(["Booke of Vampyric Knowledge"]))),
  kind: "want"
}, {
  item: $item(_templateObject1 || (_templateObject1 = _taggedTemplateLiteral(["boxed Heartstone"]))),
  kind: "sell"
}, {
  item: $item(_templateObject10 || (_templateObject10 = _taggedTemplateLiteral(["boxed bat wings"]))),
  kind: "sell"
}, {
  item: $item(_templateObject11 || (_templateObject11 = _taggedTemplateLiteral(["assemble-it-yourself Leprecondo"]))),
  kind: "sell"
}, {
  item: $item(_templateObject12 || (_templateObject12 = _taggedTemplateLiteral(["lab-grown blood cubic zirconia"]))),
  kind: "sell"
}, {
  item: $item(_templateObject13 || (_templateObject13 = _taggedTemplateLiteral(["shrink-wrapped Cup of 13s"]))),
  kind: "sell"
}, {
  item: $item(_templateObject14 || (_templateObject14 = _taggedTemplateLiteral(["scabbarded Sword of S Words"]))),
  kind: "sell"
}, {
  item: $item(_templateObject15 || (_templateObject15 = _taggedTemplateLiteral(["Meat shield toddler"]))),
  kind: "sell"
}, {
  item: $item(_templateObject16 || (_templateObject16 = _taggedTemplateLiteral(["black rosebud"]))),
  kind: "sell"
}, {
  item: $item(_templateObject17 || (_templateObject17 = _taggedTemplateLiteral(["ice sickle"]))),
  kind: "keep"
}, {
  item: $item(_templateObject18 || (_templateObject18 = _taggedTemplateLiteral(["haiku katana"]))),
  kind: "keep"
}, {
  item: $item(_templateObject19 || (_templateObject19 = _taggedTemplateLiteral(["Too Cold to Hold: How to Be Cool - A Memoir"]))),
  kind: "keep"
}];

var _templateObject, _templateObject2, _templateObject3;

/**
 * Ported from mall/check_mall_prices.ash. Purely informational -- prints
 * today's prices for things worth tracking, never buys or sells anything.
 */

/** One tracked item's numbers, for the sheet. */

/** Wanted items cycle through these, in list order. */
var RAINBOW = ["red", "orange", "DAA520", "green", "blue", "purple", "4B0082"];

// ASH did int/int division here, which truncates; JS needs it spelled out.
function formatPrice(price) {
  if (price > 1_000_000) return "".concat(Math.trunc(price / 1_000_000), "M");
  if (price > 1000) return "".concat(Math.trunc(price / 1000), "k");
  return "".concat(price, " meat");
}
function printLine(text, colour) {
  // No colour means mafia's default, which follows the light/dark theme.
  if (colour) kolmafia.print(text, colour);else kolmafia.print(text);
}
function printPrice(it, colour) {
  printLine("".concat(it.name, " price: ").concat(formatPrice(kolmafia.mallPrice(it))), colour);
}

/** Anywhere a sellable copy could be sitting, including already listed in
 * the mall store (shopAmount loads the store listing on first use). Not the
 * display case. */
function owned(it) {
  return kolmafia.itemAmount(it) + kolmafia.closetAmount(it) + kolmafia.storageAmount(it) + kolmafia.equippedAmount(it) + kolmafia.shopAmount(it);
}
var SECTIONS = [{
  kind: "currency",
  title: "CURRENCY"
}, {
  kind: "want",
  title: "WANTED"
}, {
  kind: "sell",
  title: "FOR SALE"
}, {
  kind: "keep",
  title: "MIGHT SELL"
}];
function checkTracked() {
  var rows = [];
  var _iterator = _createForOfIteratorHelper(SECTIONS),
    _step;
  try {
    var _loop = function _loop() {
      var _step$value = _step.value,
        kind = _step$value.kind,
        title = _step$value.title;
      kolmafia.print(" ");
      kolmafia.print("=== ".concat(title, " ==="));
      TRACKED.filter(t => t.kind === kind).forEach((_ref, i) => {
        var item = _ref.item;
        var row = {
          name: item.name,
          kind,
          have: owned(item),
          price: kolmafia.mallPrice(item)
        };
        rows.push(row);
        var have = kind !== "want" && row.have > 0 ? " (have ".concat(row.have, ")") : "";
        var colour = kind === "want" ? RAINBOW[i % RAINBOW.length] : kind === "keep" ? "gray" : undefined;
        printLine("".concat(item.name, " price: ").concat(formatPrice(row.price)).concat(have), colour);
      });
    };
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      _loop();
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return rows;
}

/** Prices that only matter if they cross a line -- red means go change something. */
function checkReminders() {
  var garbagePrice = kolmafia.mallPrice($item(_templateObject || (_templateObject = _taggedTemplateLiteral(["bag of park garbage"]))));
  kolmafia.print("Garbage price: ".concat(garbagePrice, " meat"), garbagePrice > 200 ? "red" : "gray");
  var guide = $item(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["LyleCo Contractor's Manual"])));
  var guideTolerance = 500_000;
  printPrice(guide, kolmafia.mallPrice(guide) > LYLECO_GUIDE_OVERRIDE + guideTolerance ? "red" : "gray");

  // Not currently calibrating fantasyrealm tix, may change in future
  printPrice($item(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["FantasyRealm guest pass"]))), "gray");
}
function checkKnuckleboneStore() {
  var shopText = kolmafia.visitUrl("main.php?pwd&talktosocp=1", false, true);
  var special = shopText.match(/value="Daily Special: ([^<]+)"/);
  if (special) {
    kolmafia.print("Skeleton special: ".concat(special[1]), "green");
    printPrice(kolmafia.toItem(special[1]), "green");
  } else {
    kolmafia.print("Couldn't find skellie special!", "red");
  }
}
function checkMallPrices() {
  var rows = checkTracked();
  kolmafia.print(" ");
  kolmafia.print("=== REMINDERS ===");
  checkReminders();
  kolmafia.print("===");
  checkKnuckleboneStore();
  kolmafia.print("===");
  // Rhino's toLocaleString can't be trusted to add separators, so do it by hand.
  kolmafia.print("Meat: ".concat(kolmafia.myMeat().toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")));
  return rows;
}

/**
 * Sends today's meat and tracked prices to the "Limited resources" sheet, via
 * the Apps Script web app in sheets/Code.gs: meat goes on the wealth tab,
 * prices rewrite the "Purchasing power (auto)" tab.
 *
 * The web-app URL lives in a preference, not here: anyone holding it can write
 * to the sheet, and this repo is public. Unset means skip quietly.
 *
 * The flag starts with an underscore, so mafia clears it at rollover -- that's
 * what makes this once a day. The script also refuses a second wealth row for
 * the same date, in case the flag is lost before mafia saves preferences.
 */
var URL_SETTING = "cap_sheetUrl";
var UPDATED_FLAG = "_capSheetUpdated";
function updateSheet(rows) {
  var url = kolmafia.getProperty(URL_SETTING);
  if (!url) return;
  if (kolmafia.getProperty(UPDATED_FLAG) === "true") {
    kolmafia.print("Sheet already updated today.", "gray");
    return;
  }

  // Encoded by hand and sent as-is (third arg), so item names can't break
  // the form fields. visitUrl sends a full https:// URL to that site rather
  // than to KoL, and follows Apps Script's 302 to fetch the reply text.
  var items = encodeURIComponent(JSON.stringify(rows));
  var reply = kolmafia.visitUrl("".concat(url, "?meat=").concat(kolmafia.myMeat(), "&items=").concat(items), true, true).trim();
  if (reply === "added" || reply === "exists") {
    kolmafia.setProperty(UPDATED_FLAG, "true");
    kolmafia.print(reply === "added" ? "Sheet updated." : "Sheet updated (wealth already in for today).", "gray");
  } else {
    kolmafia.print("Couldn't update sheet: ".concat(reply.slice(0, 200) || "no reply"), "red");
  }
}

/** `mall-prices` in the gCLI: just the price report, without a whole cap day.
 * Not named check_mall_prices -- mafia resolves scripts by filename across the
 * whole scripts tree, and the ASH original still lives in scripts/cap/mall/. */
function main() {
  updateSheet(checkMallPrices());
}

exports.main = main;
