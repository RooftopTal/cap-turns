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

/**
 * Splits a string by commas while also respecting escaping commas with a backslash
 *
 * @param str String to split
 * @returns List of tokens
 */
function splitByCommasWithEscapes(str) {
  var returnValue = [];
  var ignoreNext = false;
  var currentString = "";
  var _iterator2 = _createForOfIteratorHelper(str.split("")),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var char = _step2.value;
      if (char === "\\") {
        ignoreNext = true;
      } else {
        if (char == "," && !ignoreNext) {
          returnValue.push(currentString.trim());
          currentString = "";
        } else {
          currentString += char;
        }
        ignoreNext = false;
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  returnValue.push(currentString.trim());
  return returnValue;
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
var createPluralConstant = Type => {
  var tagFunction = function tagFunction(literals) {
    for (var _len3 = arguments.length, placeholders = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      placeholders[_key3 - 1] = arguments[_key3];
    }
    var input = concatTemplateString.apply(void 0, [literals].concat(placeholders));
    if (input === "") {
      return Type.all();
    }
    try {
      return Type.get(splitByCommasWithEscapes(input));
    } catch (error) {
      handleTypeGetError(Type, error);
    }
    kolmafia.abort();
  };
  tagFunction.all = () => Type.all();
  return tagFunction;
};
/**
 * A Bounty specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Bounty, kolmafia.toBounty);
/**
 * A list of Bounties specified by a comma-separated list of names.
 * For a list of all possible Bounties, leave the template string blank.
 *
 * @category In-game constant
 */
createPluralConstant(kolmafia.Bounty);
/**
 * A Class specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Class, kolmafia.toClass);
/**
 * A list of Classes specified by a comma-separated list of names.
 * For a list of all possible Classes, leave the template string blank.
 *
 * @category In-game constant
 */
createPluralConstant(kolmafia.Class);
/**
 * A Coinmaster specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Coinmaster, kolmafia.toCoinmaster);
/**
 * A list of Coinmasters specified by a comma-separated list of names.
 * For a list of all possible Coinmasters, leave the template string blank.
 *
 * @category In-game constant
 */
createPluralConstant(kolmafia.Coinmaster);
/**
 * An Effect specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Effect, kolmafia.toEffect);
/**
 * A list of Effects specified by a comma-separated list of names.
 * For a list of all possible Effects, leave the template string blank.
 *
 * @category In-game constant
 */
createPluralConstant(kolmafia.Effect);
/**
 * An Element specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Element, kolmafia.toElement);
/**
 * A list of Elements specified by a comma-separated list of names.
 * For a list of all possible Elements, leave the template string blank.
 *
 * @category In-game constant
 */
createPluralConstant(kolmafia.Element);
/**
 * A Familiar specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Familiar, kolmafia.toFamiliar);
/**
 * A list of Familiars specified by a comma-separated list of names.
 * For a list of all possible Familiars, leave the template string blank.
 *
 * @category In-game constant
 */
createPluralConstant(kolmafia.Familiar);
/**
 * An Item specified by name.
 *
 * @category In-game constant
 */
var $item = createSingleConstant(kolmafia.Item, kolmafia.toItem);
/**
 * A list of Items specified by a comma-separated list of names.
 * For a list of all possible Items, leave the template string blank.
 *
 * @category In-game constant
 */
var $items = createPluralConstant(kolmafia.Item);
/**
 * A Location specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Location, kolmafia.toLocation);
/**
 * A list of Locations specified by a comma-separated list of names.
 * For a list of all possible Locations, leave the template string blank.
 *
 * @category In-game constant
 */
createPluralConstant(kolmafia.Location);
/**
 * A Modifier specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Modifier, kolmafia.toModifier);
/**
 * A list of Modifiers specified by a comma-separated list of names.
 * For a list of all possible Modifiers, leave the template string blank.
 *
 * @category In-game constant
 */
createPluralConstant(kolmafia.Modifier);
/**
 * A Monster specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Monster, kolmafia.toMonster);
/**
 * A list of Monsters specified by a comma-separated list of names.
 * For a list of all possible Monsters, leave the template string blank.
 *
 * @category In-game constant
 */
createPluralConstant(kolmafia.Monster);
/**
 * A Path specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Path, kolmafia.toPath);
/**
 * A list of Paths specified by a comma-separated list of names.
 * For a list of all possible Paths, leave the template string blank.
 *
 * @category In-game constant
 */
createPluralConstant(kolmafia.Path);
/**
 * A Phylum specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Phylum, kolmafia.toPhylum);
/**
 * A list of Phyla specified by a comma-separated list of names.
 * For a list of all possible Phyla, leave the template string blank.
 *
 * @category In-game constant
 */
createPluralConstant(kolmafia.Phylum);
/**
 * A Servant specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Servant, kolmafia.toServant);
/**
 * A list of Servants specified by a comma-separated list of names.
 * For a list of all possible Servants, leave the template string blank.
 *
 * @category In-game constant
 */
createPluralConstant(kolmafia.Servant);
/**
 * A Skill specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Skill, kolmafia.toSkill);
/**
 * A list of Skills specified by a comma-separated list of names.
 * For a list of all possible Skills, leave the template string blank.
 *
 * @category In-game constant
 */
createPluralConstant(kolmafia.Skill);
/**
 * A Slot specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Slot, kolmafia.toSlot);
/**
 * A list of Slots specified by a comma-separated list of names.
 * For a list of all possible Slots, leave the template string blank.
 *
 * @category In-game constant
 */
createPluralConstant(kolmafia.Slot);
/**
 * A Stat specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Stat, kolmafia.toStat);
/**
 * A list of Stats specified by a comma-separated list of names.
 * For a list of all possible Stats, leave the template string blank.
 *
 * @category In-game constant
 */
createPluralConstant(kolmafia.Stat);
/**
 * A Thrall specified by name.
 *
 * @category In-game constant
 */
createSingleConstant(kolmafia.Thrall, kolmafia.toThrall);
/**
 * A list of Thralls specified by a comma-separated list of names.
 * For a list of all possible Thralls, leave the template string blank.
 *
 * @category In-game constant
 */
createPluralConstant(kolmafia.Thrall);

/** From mall_overrides.ash. A fixed ceiling rather than the live mall
 * price, which go_to_fantasyrealm/check_tickets deliberately don't trust. */
var LYLECO_GUIDE_OVERRIDE = 2_000_000;

var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6, _templateObject7, _templateObject8, _templateObject9, _templateObject0, _templateObject1, _templateObject10;

/**
 * Ported from mall/check_mall_prices.ash. Purely informational -- prints
 * today's prices for things worth tracking, never buys or sells anything.
 */

// ASH did int/int division here, which truncates; JS needs it spelled out.
function printPrice(it, colour) {
  var price = kolmafia.mallPrice(it);
  if (price > 1_000_000) {
    kolmafia.print("".concat(it.name, " price: ").concat(Math.trunc(price / 1_000_000), "M"), colour);
  } else if (price > 1000) {
    kolmafia.print("".concat(it.name, " price: ").concat(Math.trunc(price / 1000), "k"), colour);
  } else {
    kolmafia.print("".concat(it.name, " price: ").concat(price, " meat"), colour);
  }
}
function checkDesirePrices() {
  printPrice($item(_templateObject || (_templateObject = _taggedTemplateLiteral(["Mr. Accessory"]))), "red");
  printPrice($item(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["Booke of Vampyric Knowledge"]))), "orange");
  // printPrice($item`moveable feast`, "DAA520");
  printPrice($item(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["Comprehensive Cartographic Compendium"]))), "DAA520");
  printPrice($item(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["Order of the Green Thumb Order Form"]))), "green");
  printPrice($item(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["meteorite fragment"]))), "blue");
  printPrice($item(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["Pok\xE9fam Guide to Capturing All of Them"]))), "purple");
  printPrice($item(_templateObject7 || (_templateObject7 = _taggedTemplateLiteral(["corked genie bottle"]))), "4B0082");
}
function checkKeepPrices() {
  var _iterator = _createForOfIteratorHelper($items(_templateObject8 || (_templateObject8 = _taggedTemplateLiteral(["ice sickle, haiku katana"])))),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var it = _step.value;
      printPrice(it, "gray");
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}
function checkSalesPrices() {
  var items = $items(_templateObject9 || (_templateObject9 = _taggedTemplateLiteral(["boxed Heartstone, boxed bat wings, assemble-it-yourself Leprecondo, lab-grown blood cubic zirconia, shrink-wrapped Cup of 13s, scabbarded Sword of S Words, Meat shield toddler, black rosebud"])));
  var _iterator2 = _createForOfIteratorHelper(items),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var it = _step2.value;
      printPrice(it, "black");
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
}
function checkGarbage() {
  var garbagePrice = kolmafia.mallPrice($item(_templateObject0 || (_templateObject0 = _taggedTemplateLiteral(["bag of park garbage"]))));
  kolmafia.print("Garbage price: ".concat(garbagePrice, " meat"), garbagePrice > 200 ? "red" : "gray");
}
function checkFantasyCalibration() {
  var guide = $item(_templateObject1 || (_templateObject1 = _taggedTemplateLiteral(["LyleCo Contractor's Manual"])));
  var guideTolerance = 500_000;
  printPrice(guide, kolmafia.mallPrice(guide) > LYLECO_GUIDE_OVERRIDE + guideTolerance ? "red" : "gray");

  // Not currently calibrating fantasyrealm tix, may change in future
  printPrice($item(_templateObject10 || (_templateObject10 = _taggedTemplateLiteral(["FantasyRealm guest pass"]))), "gray");
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
  kolmafia.print(" ");
  kolmafia.print("=== DESIRE tracker for today ===");
  checkDesirePrices();
  kolmafia.print(" ");
  kolmafia.print("=== SALES tracker for today ===");
  checkKeepPrices();
  checkSalesPrices();
  checkGarbage();
  kolmafia.print("===", "gray");
  checkFantasyCalibration();
  kolmafia.print("===", "black");
  checkKnuckleboneStore();
  kolmafia.print("===", "black");
  // Rhino's toLocaleString can't be trusted to add separators, so do it by hand.
  kolmafia.print("Meat: ".concat(kolmafia.myMeat().toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")));
}

/** `mall-prices` in the gCLI: just the price report, without a whole cap day.
 * Not named check_mall_prices -- mafia resolves scripts by filename across the
 * whole scripts tree, and the ASH original still lives in scripts/cap/mall/. */
function main() {
  checkMallPrices();
}

exports.main = main;
