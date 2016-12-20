/**
 * Display only
 * This file is used for user reason to set hot key map friendly
 * e.g.
 *  `Control + Shift + U` to set selection to upper case
 */
var Code2Key = {
    "Tab": CODE.TAB,
    "Shift": CODE.SHIFT,
    "Control": CODE.CONTROL,
    "Alt": CODE.ALT,
    "CapsLock": CODE.CAPS_LOCK,
    // "Meta": CODE.Meta, // Meta left
    // "Meta": CODE.Meta, // Meta right
    "A": CODE.A,
    "B": CODE.B,
    "C": CODE.C,
    "D": CODE.D,
    "E": CODE.E,
    "F": CODE.F,
    "G": CODE.G,
    "H": CODE.H,
    "I": CODE.I,
    "J": CODE.J,
    "K": CODE.K,
    "L": CODE.L,
    "M": CODE.M,
    "N": CODE.N,
    "O": CODE.O,
    "P": CODE.P,
    "Q": CODE.Q,
    "R": CODE.R,
    "S": CODE.S,
    "T": CODE.T,
    "U": CODE.U,
    "V": CODE.V,
    "W": CODE.W,
    "X": CODE.X,
    "Y": CODE.Y,
    "Z": CODE.Z,

    "Enter": CODE.ENTER,
    "BackQuote": CODE.BACK_QUOTE,

    // "Arrow": [CODE.ARROW_LEFT, CODE.ARROW_UP, CODE.ARROW_RIGHT, CODE.ARROW_DOWN]
    "Arrow": CODE.ARROW
};

// flip the object
(function () {
    var k, v, _ = {};
    for (k in Code2Key) {
        v = Code2Key[k];
        if (v instanceof Array) {
            for (var i in v) {
                _[v[i]] = k;
            }
        } else {
            _[v] = k;
        }
    }
    Code2Key = _;
})();
