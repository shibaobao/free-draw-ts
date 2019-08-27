(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../config"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var config_1 = require("../config");
    var Shape = /** @class */ (function () {
        function Shape(option) {
            this.edit = false;
            this.init = false;
            this.id = option.id;
            this.type = option.type;
            this.freeDraw = option.freeDraw;
            if (option.shapeStyle) {
                this.shapeStyle = option.shapeStyle;
            }
            else {
                this.shapeStyle = config_1.DefaultShapeStyle;
            }
            if (option.handlePointStyle) {
                this.handlePointStyle = option.handlePointStyle;
            }
            else {
                this.handlePointStyle = config_1.DefaultHandlePointStyle;
            }
        }
        Shape.prototype.eventTrigger = function () { };
        Shape.prototype.drawRectDragPoint = function (x, y, style) {
            var point = new Path2D();
            point.rect(x - style.size / 2, y - style.size / 2, style.size, style.size);
            this.freeDraw.updateCtxStyle(style);
            this.freeDraw.ctx.fill(point);
            this.freeDraw.ctx.stroke(point);
        };
        return Shape;
    }());
    exports.default = Shape;
});
