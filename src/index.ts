import { FreeDrawOptions, ZoomAndOffset, RectOption, EllipseOption, PolygonOption } from './interface'
import { Mode, Mouse, ShapeType } from './enum'
import Rect from './shapes/rect'
import Polygon from './shapes/polygon'
import Ellipse from './shapes/ellipse'

class FreeDraw {
  ctx: CanvasRenderingContext2D;
  canvasDOM: HTMLCanvasElement;

  mode: string = Mode.View;
  editingShapeId: string = '';
  clickedShapeId: string = '';

  eventsReceive: Array<String> = [];
  eventsCallBack: Function;

  shapeInCanvas: Object = {};

  zoomLevel: number = 1;
  offsetTop: number = 0;
  offsetLeft: number = 0;
  transformCenter: Array<number> = [0, 0];

  calculationAccuracy: number = 2;

  constructor (options: FreeDrawOptions) {
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

  private init () {
    this.canvasDOM.addEventListener(Mouse.Mousedown, this.distributeCanvasEvents.bind(this));
    this.canvasDOM.addEventListener(Mouse.Mousemove, this.distributeCanvasEvents.bind(this));
    this.canvasDOM.addEventListener(Mouse.Mouseup, this.distributeCanvasEvents.bind(this));
  }

  private distributeCanvasEvents (event: MouseEvent) {
    const { type, offsetX: x, offsetY: y } = event;
    if (this.mode === Mode.View) {
      if (type === Mouse.Keydown) return;
    } else {
      if (type === Mouse.Mousedown) {
      } else if (type === Mouse.Mouseup) {
        this.clickedShapeId = '';
      }
      if (this.eventsCallBack) {
      }
    }
  }

  private updateMode (mode: Mode.Edit | Mode.View, id?: string) {
    this.mode = mode;
    if (id) {
      this.editingShapeId = id;
    } else {
      this.editingShapeId = '';
    }
  }

  private refresh () {
    this.clearCanvas();
    for (let key in Object.keys(this.shapeInCanvas)) {}
  }

  private clearCanvas () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  private rectOptionFactory (option) {
    if (option.startPoint && option.startPoint.length > 0 && option.width && option.height) {
      option.startPoint = this.getCoordinateWithoutZoomAndOffset(option.startPoint);
      option.height = this.removeZoomForLength(option.height);
      option.width = this.removeZoomForLength(option.width);
    } else if (option.points && option.points.length === 4) {
      option.startPoint = this.getCoordinateWithoutZoomAndOffset(option.points[0]);
      option.width = this.removeZoomForLength(option.points[1][0] - option.points[0][0]);
      option.height = this.removeZoomForLength(option.points[3][1] - option.points[0][1]);
    } 
    return option;
  }

  private polygonOptionFactory (option) {
    return option;
  }

  private ellipseOptionFactory (option) {
    return option;
  }

  public getCoordinateWithoutZoomAndOffset (point: Array<number>) {
  }

  public getCoordinateWithZoomAndOffset (point: Array<number>) {
  }
  
  public removeZoomForLength (length: number) {
    return Number((length / this.zoomLevel).toFixed(this.calculationAccuracy));
  }

  public addZoomForLength (length: number) {
    return Number((length * this.zoomLevel).toFixed(this.calculationAccuracy));
  }

  public remove (id: string) {
    if (this.shapeInCanvas[id]) {
      delete this.shapeInCanvas[id];
      this.refresh();
    }
  }

  public removeAll () {
    this.shapeInCanvas = {};
    this.refresh();
  }

  public create (option: RectOption | EllipseOption | PolygonOption ) {
    const { id, type } = option;
    let shape = null
    if (this.mode === Mode.Edit) throw new Error(`Can only edit one shape at a time`);
    if (this.shapeInCanvas[id]) throw new Error(`Id must be unique, shape id '${id}' has already exist`);
    this.updateMode(Mode.Edit, id);
    option.freeDraw = this;
    if (type === ShapeType.Rect) {
      shape = new Rect(this.rectOptionFactory(option));
    } else if (type === ShapeType.Ellipse) {
      shape = new Polygon(this.polygonOptionFactory(option));
    } else if (type === ShapeType.Polygon) {
      shape = new Ellipse(this.ellipseOptionFactory(option));
    } else {
      throw new Error(`Shape type ${type} is not support`);
    }
    this.shapeInCanvas[id] = shape
    return this.shapeInCanvas[id];
  }
  
  public setZoomAndOffset (options: ZoomAndOffset) {
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
    this.refresh()
  }

  public updateCtxStyle (style) {
    if (style.lineWidth) {
      this.ctx.lineWidth = style.lineWidth
    }
    if (style.fillStyle) {
      this.ctx.fillStyle = style.fillStyle
    }
    if (style.strokeStyle) {
      this.ctx.strokeStyle = style.strokeStyle
    }
  }
}

export default FreeDraw
