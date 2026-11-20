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
createPluralConstant(kolmafia.Item);
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
var $slots = createPluralConstant(kolmafia.Slot);
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

var _templateObject, _templateObject2;

/**
 * The Eternity Codpiece's five gem sockets, which mafia treats as equipment
 * slots codpiece1..codpiece5.
 *
 * The preferred socketing lives in cap_codpieceGems: five comma-separated item
 * ids, one per socket, blank for a socket that should stay empty -- e.g.
 * "11979,,11979,11982,11979". Unset means no preference, so nothing is reset.
 * Set it from the "Cap Codpiece" relay page or `codpiece save` in the gCLI.
 */
var CODPIECE = $item(_templateObject || (_templateObject = _taggedTemplateLiteral(["The Eternity Codpiece"])));
var SOCKETS = $slots(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["codpiece1, codpiece2, codpiece3, codpiece4, codpiece5"])));
var GEMS_SETTING = "cap_codpieceGems";

/** What a gem does in the codpiece, e.g. "Spell Damage Percent: +10". */
function gemEffect(gem) {
  return gem === $item.none ? "" : kolmafia.stringModifier("EternityCodpiece:".concat(gem.name), "Modifiers");
}
function haveCodpiece() {
  return kolmafia.itemAmount(CODPIECE) + kolmafia.equippedAmount(CODPIECE) > 0;
}

/** What's in each socket now. */
function currentGems() {
  return SOCKETS.map(slot => kolmafia.equippedItem(slot));
}

/** The preferred gem per socket, or null if none has been set. */
function preferredGems() {
  var value = kolmafia.getProperty(GEMS_SETTING);
  if (!value) return null;
  var ids = value.split(",");
  return SOCKETS.map((_, i) => {
    var id = Number(ids[i] ?? "");
    return id > 0 ? kolmafia.toItem(id) : $item.none;
  });
}
function setPreferredGems(gems) {
  kolmafia.setProperty(GEMS_SETTING, gems.map(gem => gem === $item.none ? "" : "".concat(gem.id)).join(","));
}

/** Sockets (0-based) whose gem isn't the preferred one. */
function mismatchedSockets(preferred) {
  var current = currentGems();
  return SOCKETS.map((_, i) => i).filter(i => current[i] !== preferred[i]);
}

/** Gets one of a gem into inventory, from the closet or (out of ronin)
 * Hagnk's. Never buys. */
function fetchGem(gem) {
  if (kolmafia.itemAmount(gem) > 0) return true;
  if (kolmafia.closetAmount(gem) > 0 && kolmafia.takeCloset(1, gem)) return true;
  if (kolmafia.canInteract() && kolmafia.storageAmount(gem) > 0 && kolmafia.takeStorage(1, gem)) return true;
  return false;
}

/**
 * Puts the preferred gems back. Empties the wrong sockets first, so a gem
 * that's in the wrong socket comes back to inventory and can go in the right
 * one. Returns the sockets still wrong afterwards (empty means all good).
 */
function resetCodpiece() {
  var preferred = preferredGems();
  if (!preferred) {
    kolmafia.print("No preferred codpiece socketing set (".concat(GEMS_SETTING, "); leaving it alone."), "gray");
    return [];
  }
  if (!haveCodpiece()) {
    kolmafia.print("The Eternity Codpiece isn't in inventory or equipped; can't check its sockets.", "red");
    return [];
  }
  var wrong = mismatchedSockets(preferred);
  if (wrong.length === 0) {
    kolmafia.print("Codpiece sockets are as preferred.", "gray");
    return [];
  }
  var _iterator = _createForOfIteratorHelper(wrong),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var i = _step.value;
      if (kolmafia.equippedItem(SOCKETS[i]) !== $item.none) kolmafia.equip(SOCKETS[i], $item.none);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var _iterator2 = _createForOfIteratorHelper(wrong),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var _i = _step2.value;
      var gem = preferred[_i];
      if (gem === $item.none) continue;
      if (!fetchGem(gem)) {
        kolmafia.print("No ".concat(gem.name, " to put in socket ").concat(_i + 1, " (checked inventory, closet and Hagnk's)."), "red");
        continue;
      }
      kolmafia.print("Socketing ".concat(gem.name, " in codpiece socket ").concat(_i + 1, "."), "blue");
      kolmafia.equip(SOCKETS[_i], gem);
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  var stillWrong = mismatchedSockets(preferred);
  var _iterator3 = _createForOfIteratorHelper(stillWrong),
    _step3;
  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      var _i2 = _step3.value;
      var want = preferred[_i2] === $item.none ? "empty" : preferred[_i2].name;
      var have = kolmafia.equippedItem(SOCKETS[_i2]);
      kolmafia.print("Codpiece socket ".concat(_i2 + 1, " should be ").concat(want, " but is ").concat(have === $item.none ? "empty" : have.name, "."), "red");
    }
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }
  if (stillWrong.length === 0) kolmafia.print("Codpiece sockets reset.", "green");
  return stillWrong;
}

/** `codpiece` in the gCLI: keep the Eternity Codpiece's gems as preferred.
 * cap also runs the reset during ascension prep. The relay page "Cap
 * Codpiece" edits the preference.
 *   codpiece          put the preferred gems back where they belong
 *   codpiece check    just report, change nothing
 *   codpiece save     make what's socketed now the preferred socketing */
function main() {
  var command = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  switch (command.trim().toLowerCase()) {
    case "":
      resetCodpiece();
      return;
    case "check":
      return check();
    case "save":
      return save();
    default:
      kolmafia.print("Usage: codpiece [check | save]", "red");
  }
}
function describe(gem) {
  return gem === $item.none ? "(empty)" : "".concat(gem.name, " -- ").concat(gemEffect(gem));
}
function check() {
  if (!haveCodpiece()) {
    kolmafia.print("The Eternity Codpiece isn't in inventory or equipped.", "red");
    return;
  }
  var current = currentGems();
  var preferred = preferredGems();
  var wrong = preferred ? mismatchedSockets(preferred) : [];
  current.forEach((gem, i) => {
    var off = wrong.includes(i);
    var want = off && preferred ? " (preferred: ".concat(preferred[i] === $item.none ? "empty" : preferred[i].name, ")") : "";
    var line = "Socket ".concat(i + 1, ": ").concat(describe(gem)).concat(want);
    // No colour argument at all for mafia's theme default.
    if (off) kolmafia.print(line, "red");else kolmafia.print(line);
  });
  if (!preferred) kolmafia.print("No preferred socketing set (".concat(GEMS_SETTING, ")."), "gray");else if (wrong.length === 0) kolmafia.print("All sockets as preferred.", "green");
}
function save() {
  if (!haveCodpiece()) {
    kolmafia.print("The Eternity Codpiece isn't in inventory or equipped.", "red");
    return;
  }
  setPreferredGems(currentGems());
  kolmafia.print("Saved the current sockets as the preferred socketing.", "green");
}

exports.main = main;
