(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Mode;
    (function (Mode) {
        Mode["View"] = "View";
        Mode["Edit"] = "Edit";
    })(Mode = exports.Mode || (exports.Mode = {}));
    var Mouse;
    (function (Mouse) {
        Mouse["Mousedown"] = "mousedown";
        Mouse["Mousemove"] = "mousemove";
        Mouse["Mouseup"] = "mouseup";
        Mouse["Keydown"] = "keydown";
    })(Mouse = exports.Mouse || (exports.Mouse = {}));
    var ShapeType;
    (function (ShapeType) {
        ShapeType["Rect"] = "Rect";
        ShapeType["Ellipse"] = "Ellipse";
        ShapeType["Polygon"] = "Polygon";
    })(ShapeType = exports.ShapeType || (exports.ShapeType = {}));
});
