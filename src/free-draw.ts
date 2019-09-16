import {
  FreeDrawOptions,
  ZoomAndOffset,
  RectOption,
  EllipseOption,
  PolygonOption,
  StringKeyObject,
  ShapeStyle
} from './interface'
import { Mode, Mouse, Key, ShapeType } from './enum'
import Rect from './shapes/rect'
import Polygon from './shapes/polygon'
import Ellipse from './shapes/ellipse'

class FreeDraw {
  ctx: CanvasRenderingContext2D
  canvasDOM: HTMLCanvasElement

  mouseOnly: Boolean = false

  mode: string = Mode.View
  editingShapeId: string = ''
  clickedShapeId: string = ''

  eventsReceive: Array<String> = []
  eventsCallBack!: Function

  shapeInCanvas: StringKeyObject = {}

  zoomLevel: number = 1
  offsetTop: number = 0
  offsetLeft: number = 0
  transformCenter: Array<number> = [0, 0]

  calculationAccuracy: number = 2

  constructor(options: FreeDrawOptions) {
    this.canvasDOM = options.canvasDOM
    this.ctx = this.canvasDOM.getContext('2d') as CanvasRenderingContext2D
    if (options.eventsReceive && options.eventsReceive.length > 0) {
      this.eventsReceive = options.eventsReceive
    }
    if (options.eventsCallBack) {
      this.eventsCallBack = options.eventsCallBack
    }
    if (options.zoomLevel) {
      this.zoomLevel = options.zoomLevel
    }
    if (options.offsetTop) {
      this.offsetTop = options.offsetTop
    }
    if (options.offsetLeft) {
      this.offsetLeft = options.offsetLeft
    }
    if (options.transformCenter) {
      this.transformCenter = options.transformCenter
    }
    if (options.calculationAccuracy) {
      this.calculationAccuracy = options.calculationAccuracy
    }
    if (options.mouseOnly) {
      this.mouseOnly = options.mouseOnly
    }

    this.init()
  }

  private init() {
    this.canvasDOM.addEventListener(Mouse.Mousedown, this.distributeCanvasMouseEvents.bind(this))
    this.canvasDOM.addEventListener(Mouse.Mousemove, this.distributeCanvasMouseEvents.bind(this))
    this.canvasDOM.addEventListener(Mouse.Mouseup, this.distributeCanvasMouseEvents.bind(this))
    if (!this.mouseOnly) {
      window.document.addEventListener(Key.Keydown, this.distributeCanvasKeyEvents.bind(this))
      window.document.addEventListener(Key.Keyup, this.distributeCanvasKeyEvents.bind(this))
    }
  }

  // **************************** EVENTS ****************************
  private distributeCanvasMouseEvents(event: MouseEvent) {
    const { type, offsetX, offsetY } = event
    if (this.mode === Mode.View) {
      if (type === Mouse.Mousedown) {
      }
    } else if (this.mode === Mode.Edit) {
      const editingShape = this.shapeInCanvas[this.editingShapeId]
      if (editingShape && !editingShape.isFinished) {
        if (type === Mouse.Mousedown) {
          if (editingShape.includes(offsetX, offsetY)) {
            this.clickedShapeId = editingShape.id
            editingShape.edit = true
          } else {
            editingShape.edit = false
          }
        } else if (type === Mouse.Mouseup) {
          this.clickedShapeId = ''
        }
        editingShape.mouseEventTrigger(event)
      }
      if (this.eventsCallBack) {
      }
      this.refreshShapes()
    }
  }

  private distributeCanvasKeyEvents(event: KeyboardEvent) {
    if (this.mode === Mode.View) {
    } else if (this.mode === Mode.Edit) {
      const editingShape = this.shapeInCanvas[this.editingShapeId]
      if (editingShape) {
        editingShape.keyEventTrigger(event)
      }
      if (this.eventsCallBack) {
      }
      this.refreshShapes()
    }
  }

  // **************************** GLOBAL / CANVAS ****************************
  public updateCtxStyle(style: ShapeStyle) {
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

  public updateMode(mode: Mode.Edit | Mode.View, id?: string) {
    this.mode = mode
    if (id) {
      this.editingShapeId = id
    } else {
      this.editingShapeId = ''
    }
  }

  public refreshShapes() {
    this.clearCanvas()
    for (const key of Object.keys(this.shapeInCanvas)) {
      this.shapeInCanvas[key].draw()
    }
  }

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
  }

  public remove(id: string) {
    if (this.shapeInCanvas[id]) {
      delete this.shapeInCanvas[id]
      this.refreshShapes()
    }
  }

  public removeAll() {
    this.shapeInCanvas = {}
    this.mode = Mode.View
    this.refreshShapes()
  }

  public create(option: RectOption | EllipseOption | PolygonOption) {
    const { id, type } = option
    let shape = null
    if (this.mode === Mode.Edit) throw new Error(`Can only edit one shape at a time`)
    if (this.shapeInCanvas[id]) {
      throw new Error(`Id must be unique, shape id "${id}" has already exist`)
    }
    this.updateMode(Mode.Edit, id)
    option.freeDraw = this
    if (type === ShapeType.Rect) {
      shape = new Rect(this.rectOptionFactory(option as RectOption))
    } else if (type === ShapeType.Polygon) {
      shape = new Polygon(this.polygonOptionFactory(option as PolygonOption))
    } else if (type === ShapeType.Ellipse) {
      shape = new Ellipse(this.ellipseOptionFactory(option as EllipseOption))
    } else {
      throw new Error(`Shape type "${type}" is not support`)
    }
    this.shapeInCanvas[id] = shape
    return this.shapeInCanvas[id]
  }

  public setZoomAndOffset(options: ZoomAndOffset) {
    if (options.zoomLevel) {
      this.zoomLevel = options.zoomLevel
    }
    if (options.offsetLeft) {
      this.offsetLeft = options.offsetLeft
    }
    if (options.offsetTop) {
      this.offsetTop = options.offsetTop
    }
    if (options.transformCenter) {
      this.transformCenter = options.transformCenter
    }
    this.refreshShapes()
  }

  // **************************** FACTORY ****************************
  private rectOptionFactory(option: RectOption) {
    if (option.startPoint && option.startPoint.length > 0 && option.width && option.height) {
      option.startPoint = this.getCoordinateWithoutZoomAndOffset(option.startPoint)
      option.height = this.removeZoomForLength(option.height)
      option.width = this.removeZoomForLength(option.width)
    } else if (option.points && option.points.length === 4) {
      option.startPoint = this.getCoordinateWithoutZoomAndOffset(option.points[0])
      option.width = this.removeZoomForLength(option.points[1][0] - option.points[0][0])
      option.height = this.removeZoomForLength(option.points[3][1] - option.points[0][1])
    }
    return option
  }

  private polygonOptionFactory(option: PolygonOption) {
    if (option.points && option.points.length > 0) {
      option.points = option.points.map(point => this.getCoordinateWithoutZoomAndOffset(point))
    }
    return option
  }

  private ellipseOptionFactory(option: EllipseOption) {
    if (option.radiusX && option.radiusY && option.x && option.y) {
      option.radiusX = this.removeZoomForLength(option.radiusX)
      option.radiusY = this.removeZoomForLength(option.radiusY)
      const centerPoint = this.getCoordinateWithoutZoomAndOffset([option.x, option.y])
      option.x = centerPoint[0]
      option.y = centerPoint[1]
    }
    return option
  }

  // **************************** UTILS ****************************
  public getCoordinateWithoutZoomAndOffset(point: number[]) {
    let x = point[0]
    let y = point[1]
    x = (x - this.offsetLeft - this.transformCenter[0]) * this.zoomLevel + this.transformCenter[0]
    y = (y - this.offsetTop - this.transformCenter[1]) * this.zoomLevel + this.transformCenter[1]
    return [this.toFixedAccuracy(x), this.toFixedAccuracy(y)]
  }

  public getCoordinateWithZoomAndOffset(point: number[]) {
    let x = point[0]
    let y = point[1]
    x = (x - this.transformCenter[0]) / this.zoomLevel + this.transformCenter[0] + this.offsetLeft
    y = (y - this.transformCenter[1]) / this.zoomLevel + this.transformCenter[1] + this.offsetTop

    return [this.toFixedAccuracy(x), this.toFixedAccuracy(y)]
  }

  public removeZoomForLength(length: number) {
    return this.toFixedAccuracy(length / this.zoomLevel)
  }

  public addZoomForLength(length: number) {
    return this.toFixedAccuracy(length * this.zoomLevel)
  }

  public toFixedAccuracy(value: number) {
    return Number(value.toFixed(this.calculationAccuracy))
  }
}

export default FreeDraw
