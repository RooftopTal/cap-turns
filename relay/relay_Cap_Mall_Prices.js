'use strict';

var kolmafia = require('kolmafia');

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
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
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = true,
      o = false;
    try {
      if (i = (t = t.call(r)).next, 0 === l) ; else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = true, n = r;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
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

var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6, _templateObject7, _templateObject8, _templateObject9, _templateObject0, _templateObject1, _templateObject10, _templateObject11, _templateObject12, _templateObject13, _templateObject14, _templateObject15, _templateObject16, _templateObject17, _templateObject18, _templateObject19, _templateObject20;

/**
 * Everything mall-prices tracks, and the source of truth for the sheet's
 * "Purchasing power (auto)" tab. One entry per real item.
 *
 * - currency: what IotMs get bought with, valued but not a goal.
 * - want: things to buy. Listed in priority order -- the sheet's "next
 *   purchase" is the first one.
 * - sell: held only to sell later.
 * - keep: could sell, probably won't.
 *
 * The list lives in the cap_mallTracked preference as comma-separated
 * itemId:kind pairs, in order, e.g. "12391:sell,9529:want". Edit it from the
 * "Cap Mall Prices" relay page or `mall-prices add|remove|list` in the gCLI.
 * The first time it's read, it's seeded from DEFAULT_TRACKED below.
 */

var KINDS = ["currency", "want", "sell", "keep"];
var TRACKED_SETTING = "cap_mallTracked";

/** What the preference starts out as. Edits go through the preference, not here. */
var DEFAULT_TRACKED = [{
  item: $item(_templateObject || (_templateObject = _taggedTemplateLiteral(["Mr. Accessory"]))),
  kind: "currency"
}, {
  item: $item(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["Uncle Buck"]))),
  kind: "currency"
}, {
  item: $item(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["Comprehensive Cartographic Compendium"]))),
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
  item: $item(_templateObject17 || (_templateObject17 = _taggedTemplateLiteral(["unopened legendary acorndion"]))),
  kind: "sell"
}, {
  item: $item(_templateObject18 || (_templateObject18 = _taggedTemplateLiteral(["ice sickle"]))),
  kind: "keep"
}, {
  item: $item(_templateObject19 || (_templateObject19 = _taggedTemplateLiteral(["haiku katana"]))),
  kind: "keep"
}, {
  item: $item(_templateObject20 || (_templateObject20 = _taggedTemplateLiteral(["Too Cold to Hold: How to Be Cool - A Memoir"]))),
  kind: "keep"
}];
function isKind(value) {
  return KINDS.includes(value);
}

/** An item from a number or a name; null if mafia doesn't know it. */
function parseItem(value) {
  var text = value.trim();
  if (!text) return null;
  var item = /^\d+$/.test(text) ? kolmafia.toItem(Number(text)) : kolmafia.toItem(text);
  return item === $item.none ? null : item;
}
function serialise(list) {
  return list.map(_ref => {
    var item = _ref.item,
      kind = _ref.kind;
    return "".concat(item.id, ":").concat(kind);
  }).join(",");
}

/** The tracked list, in order. Entries mafia can't resolve are skipped. */
function getTracked() {
  if (!kolmafia.propertyExists(TRACKED_SETTING)) {
    kolmafia.setProperty(TRACKED_SETTING, serialise(DEFAULT_TRACKED));
  }
  var list = [];
  var _iterator = _createForOfIteratorHelper(kolmafia.getProperty(TRACKED_SETTING).split(",")),
    _step;
  try {
    var _loop = function _loop() {
      var entry = _step.value;
      var _entry$trim$split = entry.trim().split(":"),
        _entry$trim$split2 = _slicedToArray(_entry$trim$split, 2),
        id = _entry$trim$split2[0],
        kind = _entry$trim$split2[1];
      var item = parseItem(id ?? "");
      if (item && kind && isKind(kind) && !list.some(t => t.item === item)) {
        list.push({
          item,
          kind
        });
      }
    };
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      _loop();
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return list;
}
function save(list) {
  kolmafia.setProperty(TRACKED_SETTING, serialise(list));
}

/**
 * Tracks an item, at the end of its kind's section (so a new want goes last
 * in the priority order). An item already tracked just has its kind changed.
 */
function addTracked(item, kind) {
  var list = getTracked().filter(t => t.item !== item);
  var at = list.length;
  for (var i = list.length - 1; i >= 0; i--) {
    if (list[i].kind === kind) {
      at = i + 1;
      break;
    }
  }
  list.splice(at, 0, {
    item,
    kind
  });
  save(list);
}

/** Stops tracking an item. False if it wasn't tracked. */
function removeTracked(item) {
  var list = getTracked();
  var kept = list.filter(t => t.item !== item);
  if (kept.length === list.length) return false;
  save(kept);
  return true;
}

/**
 * "Cap Mall Prices" in mafia's relay-browser script dropdown: add and remove
 * the items mall-prices tracks. Built as relay/relay_Cap_Mall_Prices.js --
 * mafia lists any relay/relay_*.js there, underscores shown as spaces.
 *
 * Every button posts back to this same script, which applies the change and
 * redraws the page.
 */
var SELF = "relay_Cap_Mall_Prices.js?relay=true";
var KIND_LABELS = {
  currency: "Currency",
  want: "Wanted (priority order)",
  sell: "For sale",
  keep: "Might sell"
};
function escape(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Applies whatever the form asked for; returns a message for the page. */
function handle(fields) {
  if (fields.action === "add") {
    var item = parseItem(fields.item ?? "");
    var kind = fields.kind ?? "";
    if (!item) return {
      text: "No item ".concat(escape(fields.item ?? ""), "."),
      ok: false
    };
    if (!isKind(kind)) return {
      text: "Pick a kind.",
      ok: false
    };
    addTracked(item, kind);
    return {
      text: "Tracking ".concat(escape(item.name), " (").concat(kind, ")."),
      ok: true
    };
  }
  if (fields.action === "remove") {
    var _item = parseItem(fields.item ?? "");
    if (_item && removeTracked(_item)) return {
      text: "Removed ".concat(escape(_item.name), "."),
      ok: true
    };
    return {
      text: "That item wasn't tracked.",
      ok: false
    };
  }
  return null;
}
function addForm() {
  var options = KINDS.map(k => "<option value=\"".concat(k, "\"").concat(k === "want" ? " selected" : "", ">").concat(k, "</option>")).join("");
  return "\n<form method=\"post\" action=\"".concat(SELF, "\" class=\"add\">\n  <input type=\"hidden\" name=\"action\" value=\"add\">\n  <label>Item number <input name=\"item\" inputmode=\"numeric\" placeholder=\"e.g. 12391\" required autofocus></label>\n  <label>Kind <select name=\"kind\">").concat(options, "</select></label>\n  <button type=\"submit\">Add</button>\n</form>");
}
function trackedTables() {
  var tracked = getTracked();
  return KINDS.map(kind => {
    var rows = tracked.filter(t => t.kind === kind).map(_ref => {
      var item = _ref.item;
      return "\n    <tr>\n      <td class=\"id\">".concat(item.id, "</td>\n      <td>").concat(escape(item.name), "</td>\n      <td class=\"remove\">\n        <form method=\"post\" action=\"").concat(SELF, "\" data-name=\"").concat(escape(item.name), "\"\n          onsubmit=\"return confirm('Stop tracking ' + this.dataset.name + '?')\">\n          <input type=\"hidden\" name=\"action\" value=\"remove\">\n          <input type=\"hidden\" name=\"item\" value=\"").concat(item.id, "\">\n          <button type=\"submit\" title=\"Stop tracking ").concat(escape(item.name), "\">Remove</button>\n        </form>\n      </td>\n    </tr>");
    }).join("");
    return "\n<h2>".concat(KIND_LABELS[kind], "</h2>\n").concat(rows ? "<table>".concat(rows, "</table>") : "<p class=\"empty\">Nothing here.</p>");
  }).join("");
}
function main() {
  var message = handle(kolmafia.formFields());
  kolmafia.write("<!doctype html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n<title>Cap Mall Prices</title>\n<style>\n  body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; margin: 16px; max-width: 640px; }\n  h1 { font-size: 20px; margin: 0 0 4px; }\n  h2 { font-size: 15px; margin: 20px 0 6px; border-bottom: 1px solid #ccc; padding-bottom: 2px; }\n  .intro { color: #666; margin: 0 0 12px; }\n  .add { display: flex; gap: 12px; align-items: end; flex-wrap: wrap; }\n  .add label { display: flex; flex-direction: column; gap: 2px; font-size: 12px; color: #444; }\n  .add input { width: 120px; }\n  input, select, button { font-size: 14px; padding: 3px 6px; }\n  .message { margin: 12px 0 0; padding: 6px 8px; border-radius: 3px; }\n  .ok { background: #e6f4e6; color: #225522; }\n  .error { background: #f8e3e3; color: #882222; }\n  table { border-collapse: collapse; width: 100%; }\n  td { padding: 3px 6px; border-bottom: 1px solid #eee; }\n  td.id { color: #888; width: 60px; font-variant-numeric: tabular-nums; }\n  td.remove { text-align: right; width: 1%; }\n  td.remove form { margin: 0; }\n  .empty { color: #888; margin: 0; }\n</style>\n</head>\n<body>\n<h1>Cap Mall Prices</h1>\n<p class=\"intro\">What <code>mall-prices</code> reports on and sends to the sheet. Adding an item that's already tracked changes its kind.</p>\n".concat(addForm(), "\n").concat(message ? "<p class=\"message ".concat(message.ok ? "ok" : "error", "\">").concat(message.text, "</p>") : "", "\n").concat(trackedTables(), "\n</body>\n</html>"));
}

exports.main = main;
