var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./enum", "./shapes/rect", "./shapes/polygon", "./shapes/ellipse"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var enum_1 = require("./enum");
    var rect_1 = __importDefault(require("./shapes/rect"));
    var polygon_1 = __importDefault(require("./shapes/polygon"));
    var ellipse_1 = __importDefault(require("./shapes/ellipse"));
    var FreeDraw = /** @class */ (function () {
        function FreeDraw(options) {
            this.mode = enum_1.Mode.View;
            this.editingShapeId = '';
            this.clickedShapeId = '';
            this.eventsReceive = [];
            this.shapeInCanvas = {};
            this.zoomLevel = 1;
            this.offsetTop = 0;
            this.offsetLeft = 0;
            this.transformCenter = [0, 0];
            this.calculationAccuracy = 2;
            this.canvasDOM = options.canvasDOM;
            this.ctx = this.canvasDOM.getContext('2d');
            if (options.eventsReceive && options.eventsReceive.length > 0) {
                this.eventsReceive = options.eventsReceive;
            }
            if (options.eventsCallBack) {
                this.eventsCallBack = options.eventsCallBack;
            }
            if (options.zoomLevel) {
                this.zoomLevel = options.zoomLevel;
            }
            if (options.offsetTop) {
                this.offsetTop = options.offsetTop;
            }
            if (options.offsetLeft) {
                this.offsetLeft = options.offsetLeft;
            }
            if (options.transformCenter) {
                this.transformCenter = options.transformCenter;
            }
            if (options.calculationAccuracy) {
                this.calculationAccuracy = options.calculationAccuracy;
            }
            this.init();
        }
        FreeDraw.prototype.init = function () {
            this.canvasDOM.addEventListener(enum_1.Mouse.Mousedown, this.distributeCanvasEvents.bind(this));
            this.canvasDOM.addEventListener(enum_1.Mouse.Mousemove, this.distributeCanvasEvents.bind(this));
            this.canvasDOM.addEventListener(enum_1.Mouse.Mouseup, this.distributeCanvasEvents.bind(this));
        };
        FreeDraw.prototype.distributeCanvasEvents = function (event) {
            var type = event.type, x = event.offsetX, y = event.offsetY;
            if (this.mode === enum_1.Mode.View) {
                if (type === enum_1.Mouse.Keydown)
                    return;
            }
            else {
                if (type === enum_1.Mouse.Mousedown) {
                }
                else if (type === enum_1.Mouse.Mouseup) {
                    this.clickedShapeId = '';
                }
                if (this.eventsCallBack) {
                }
            }
        };
        FreeDraw.prototype.updateMode = function (mode, id) {
            this.mode = mode;
            if (id) {
                this.editingShapeId = id;
            }
            else {
                this.editingShapeId = '';
            }
        };
        FreeDraw.prototype.refresh = function () {
            this.clearCanvas();
            for (var key in Object.keys(this.shapeInCanvas)) { }
        };
        FreeDraw.prototype.clearCanvas = function () {
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        };
        FreeDraw.prototype.rectOptionFactory = function (option) {
            if (option.startPoint && option.startPoint.length > 0 && option.width && option.height) {
                option.startPoint = this.getCoordinateWithoutZoomAndOffset(option.startPoint);
                option.height = this.removeZoomForLength(option.height);
                option.width = this.removeZoomForLength(option.width);
            }
            else if (option.points && option.points.length === 4) {
                option.startPoint = this.getCoordinateWithoutZoomAndOffset(option.points[0]);
                option.width = this.removeZoomForLength(option.points[1][0] - option.points[0][0]);
                option.height = this.removeZoomForLength(option.points[3][1] - option.points[0][1]);
            }
            return option;
        };
        FreeDraw.prototype.polygonOptionFactory = function (option) {
            return option;
        };
        FreeDraw.prototype.ellipseOptionFactory = function (option) {
            return option;
        };
        FreeDraw.prototype.getCoordinateWithoutZoomAndOffset = function (point) {
        };
        FreeDraw.prototype.getCoordinateWithZoomAndOffset = function (point) {
        };
        FreeDraw.prototype.removeZoomForLength = function (length) {
            return Number((length / this.zoomLevel).toFixed(this.calculationAccuracy));
        };
        FreeDraw.prototype.addZoomForLength = function (length) {
            return Number((length * this.zoomLevel).toFixed(this.calculationAccuracy));
        };
        FreeDraw.prototype.remove = function (id) {
            if (this.shapeInCanvas[id]) {
                delete this.shapeInCanvas[id];
                this.refresh();
            }
        };
        FreeDraw.prototype.removeAll = function () {
            this.shapeInCanvas = {};
            this.refresh();
        };
        FreeDraw.prototype.create = function (option) {
            var id = option.id, type = option.type;
            var shape = null;
            if (this.mode === enum_1.Mode.Edit)
                throw new Error("Can only edit one shape at a time");
            if (this.shapeInCanvas[id])
                throw new Error("Id must be unique, shape id '" + id + "' has already exist");
            this.updateMode(enum_1.Mode.Edit, id);
            option.freeDraw = this;
            if (type === enum_1.ShapeType.Rect) {
                shape = new rect_1.default(this.rectOptionFactory(option));
            }
            else if (type === enum_1.ShapeType.Ellipse) {
                shape = new polygon_1.default(this.polygonOptionFactory(option));
            }
            else if (type === enum_1.ShapeType.Polygon) {
                shape = new ellipse_1.default(this.ellipseOptionFactory(option));
            }
            else {
                throw new Error("Shape type " + type + " is not support");
            }
            this.shapeInCanvas[id] = shape;
            return this.shapeInCanvas[id];
        };
        FreeDraw.prototype.setZoomAndOffset = function (options) {
            if (options.zoomLevel) {
                this.zoomLevel = options.zoomLevel;
            }
            if (options.offsetLeft) {
                this.offsetLeft = options.offsetLeft;
            }
            if (options.offsetTop) {
                this.offsetTop = options.offsetTop;
            }
            if (options.transformCenter) {
                this.transformCenter = options.transformCenter;
            }
            this.refresh();
        };
        FreeDraw.prototype.updateCtxStyle = function (style) {
            if (style.lineWidth) {
                this.ctx.lineWidth = style.lineWidth;
            }
            if (style.fillStyle) {
                this.ctx.fillStyle = style.fillStyle;
            }
            if (style.strokeStyle) {
                this.ctx.strokeStyle = style.strokeStyle;
            }
        };
        return FreeDraw;
    }());
    exports.default = FreeDraw;
});
