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
    var lineWidth = 2;
    var strokeStyle = '#0E71EB';
    var fillStyle = 'rgba(14, 113, 235, 0.8)';
    var handlePointLineWidth = 2;
    var handlePointFillStyle = '#FFFFFF';
    var handlePoinStrokeStyle = '#0E71EB';
    var handlePointSize = 8;
    exports.DefaultShapeStyle = {
        lineWidth: lineWidth,
        fillStyle: fillStyle,
        strokeStyle: strokeStyle
    };
    exports.DefaultHandlePointStyle = {
        lineWidth: handlePointLineWidth,
        fillStyle: handlePointFillStyle,
        strokeStyle: handlePoinStrokeStyle,
        size: handlePointSize
    };
});
