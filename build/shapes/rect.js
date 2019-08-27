var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./shape"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var shape_1 = __importDefault(require("./shape"));
    var Rect = /** @class */ (function (_super) {
        __extends(Rect, _super);
        function Rect(option) {
            var _this = _super.call(this, option) || this;
            _this.width = 0;
            _this.height = 0;
            if (option.startPoint && option.startPoint.length > 0 && option.width && option.height) {
                _this.startPoint = option.startPoint;
                _this.width = option.width;
                _this.height = option.height;
                _this.draw();
            }
            else {
                _this.init = true;
            }
            return _this;
        }
        Rect.prototype.draw = function () {
            this.shape = this.drawRect();
            this.generateHandlePoints();
            if (this.edit) {
                this.drawRectHandlePoints();
            }
        };
        Rect.prototype.drawRect = function () {
            var _a = this.getRectAttributes(), width = _a.width, height = _a.height, startPoint = _a.startPoint;
            var rectObj = new Path2D();
            rectObj.rect(startPoint[0], startPoint[1], width, height);
            this.freeDraw.updateCtxStyle(this.shapeStyle);
            this.freeDraw.ctx.fill(rectObj);
            this.freeDraw.ctx.stroke(rectObj);
            return rectObj;
        };
        Rect.prototype.generateHandlePoints = function () {
            var handlePoints = [];
            handlePoints[0] = { path: null, point: this.startPoint };
            handlePoints[1] = { path: null, point: [this.startPoint[0] + this.width, this.startPoint[1]] };
            handlePoints[2] = { path: null, point: [this.startPoint[0] + this.width, this.startPoint[1] + this.height] };
            handlePoints[3] = { path: null, point: [this.startPoint[0], this.startPoint[1] + this.height] };
            this.handlePoints = handlePoints;
        };
        Rect.prototype.drawRectHandlePoints = function () {
            var handlePoints = [];
            for (var _i = 0, _a = this.handlePoints; _i < _a.length; _i++) {
                var handlePoint = _a[_i];
                handlePoints.push({
                    path: this.drawRectDragPoint(handlePoint.point[0], handlePoint.point[0], this.handlePointStyle),
                    point: handlePoint.point
                });
            }
        };
        Rect.prototype.getRectAttributes = function () {
            var startPoint = this.freeDraw.getCoordinateWithZoomAndOffset(this.startPoint);
            var width = this.freeDraw.addZoomForLength(this.width);
            var height = this.freeDraw.addZoomForLength(this.height);
            return {
                startPoint: startPoint,
                height: height,
                width: width
            };
        };
        return Rect;
    }(shape_1.default));
    exports.default = Rect;
});
