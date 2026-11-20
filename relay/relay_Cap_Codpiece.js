'use strict';

var kolmafia = require('kolmafia');

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return _arrayLikeToArray(r);
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
function _iterableToArray(r) {
  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _taggedTemplateLiteral(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, {
    raw: {
      value: Object.freeze(t)
    }
  }));
}
function _toConsumableArray(r) {
  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
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
var allGems;
/** Every item that can go in a socket, by name. */
function codpieceGems() {
  allGems ?? (allGems = kolmafia.Item.all().filter(it => gemEffect(it).length > 0).sort((a, b) => a.name.localeCompare(b.name)));
  return allGems;
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

/** Escapes text for use in HTML content and double-quoted attributes. */
function escape(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * "Cap Codpiece" in mafia's relay-browser script dropdown: choose the
 * Eternity Codpiece's preferred gem per socket, and put them back. Built as
 * relay/relay_Cap_Codpiece.js. The same preference drives `codpiece` in the
 * gCLI and cap's ascension prep.
 */
var SELF = "relay_Cap_Codpiece.js?relay=true";
/** The five choices from the form, or null if any is missing or not a gem. */
function chosenGems(fields) {
  var gems = SOCKETS.map((_, i) => {
    var id = Number(fields["gem".concat(i + 1)] ?? "");
    return id > 0 ? kolmafia.toItem(id) : $item.none;
  });
  var valid = gems.every(gem => gem === $item.none || codpieceGems().includes(gem));
  return valid ? gems : null;
}
function handle(fields) {
  switch (fields.action) {
    case "save":
    case "apply":
      {
        var gems = chosenGems(fields);
        if (!gems) return {
          text: "That isn't a socketable gem.",
          ok: false
        };
        setPreferredGems(gems);
        if (fields.action === "save") return {
          text: "Saved.",
          ok: true
        };
        var wrong = resetCodpiece();
        return wrong.length === 0 ? {
          text: "Saved, and the codpiece now matches.",
          ok: true
        } : {
          text: "Saved, but socket".concat(wrong.length > 1 ? "s" : "", " ").concat(wrong.map(i => i + 1).join(", "), " couldn't be set -- see the gCLI."),
          ok: false
        };
      }
    case "current":
      setPreferredGems(currentGems());
      return {
        text: "Preferred socketing set to what's in the codpiece now.",
        ok: true
      };
    default:
      return null;
  }
}
function owned(gem) {
  return kolmafia.itemAmount(gem) + kolmafia.closetAmount(gem) + kolmafia.storageAmount(gem);
}
function describe(gem) {
  return gem === $item.none ? "<span class=\"muted\">(empty)</span>" : "".concat(escape(gem.name), "<div class=\"effect\">").concat(escape(gemEffect(gem)), "</div>");
}
function gemSelect(socket, selected) {
  var options = [$item.none].concat(_toConsumableArray(codpieceGems())).map(gem => {
    var label = gem === $item.none ? "(empty)" : "".concat(gem.name, " -- ").concat(gemEffect(gem), " (have ").concat(owned(gem), ")");
    return "<option value=\"".concat(gem === $item.none ? 0 : gem.id, "\"").concat(gem === selected ? " selected" : "", ">").concat(escape(label), "</option>");
  });
  return "<select name=\"gem".concat(socket + 1, "\">").concat(options.join(""), "</select>");
}
function sockets() {
  var current = currentGems();
  var preferred = preferredGems();
  var rows = SOCKETS.map((_, i) => {
    var want = preferred ? preferred[i] : current[i];
    var off = preferred !== null && preferred[i] !== current[i];
    return "\n    <tr".concat(off ? " class=\"off\"" : "", ">\n      <td class=\"n\">").concat(i + 1, "</td>\n      <td>").concat(describe(current[i]), "</td>\n      <td>").concat(gemSelect(i, want), "</td>\n    </tr>");
  }).join("");
  return "\n<form method=\"post\" action=\"".concat(SELF, "\">\n  <table>\n    <tr><th></th><th>In the codpiece now</th><th>Preferred</th></tr>").concat(rows, "\n  </table>\n  <div class=\"buttons\">\n    <button type=\"submit\" name=\"action\" value=\"save\">Save</button>\n    <button type=\"submit\" name=\"action\" value=\"apply\">Save and socket now</button>\n    <button type=\"submit\" name=\"action\" value=\"current\"\n      onclick=\"return confirm('Replace the preferred socketing with what is in the codpiece now?')\">Use what's socketed now</button>\n  </div>\n</form>\n").concat(preferred ? "" : "<p class=\"muted\">No preferred socketing saved yet; the choices above are what's socketed now.</p>");
}
function main() {
  var message = haveCodpiece() ? handle(kolmafia.formFields()) : null;
  kolmafia.write("<!doctype html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n<title>Cap Codpiece</title>\n<style>\n  body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; margin: 16px; max-width: 900px; }\n  h1 { font-size: 20px; margin: 0 0 4px; }\n  .intro, .muted { color: #666; }\n  .intro { margin: 0 0 12px; }\n  table { border-collapse: collapse; width: 100%; }\n  th { text-align: left; font-size: 12px; color: #444; padding: 3px 6px; border-bottom: 1px solid #ccc; }\n  td { padding: 5px 6px; border-bottom: 1px solid #eee; vertical-align: top; }\n  td.n { color: #888; width: 1%; }\n  tr.off td { background: #fdf0e0; }\n  .effect { color: #777; font-size: 12px; }\n  select { font-size: 13px; padding: 2px 4px; max-width: 100%; }\n  button { font-size: 14px; padding: 3px 8px; }\n  .buttons { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }\n  .message { margin: 12px 0; padding: 6px 8px; border-radius: 3px; }\n  .ok { background: #e6f4e6; color: #225522; }\n  .error { background: #f8e3e3; color: #882222; }\n</style>\n</head>\n<body>\n<h1>Cap Codpiece</h1>\n<p class=\"intro\">The Eternity Codpiece's preferred gems. <code>codpiece</code> in the gCLI and cap's ascension prep put these back; highlighted sockets don't match.</p>\n".concat(message ? "<p class=\"message ".concat(message.ok ? "ok" : "error", "\">").concat(escape(message.text), "</p>") : "", "\n").concat(haveCodpiece() ? sockets() : "<p class=\"message error\">The Eternity Codpiece isn't in inventory or equipped.</p>", "\n</body>\n</html>"));
}

exports.main = main;
