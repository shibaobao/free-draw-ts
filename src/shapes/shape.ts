import {
  ShapeStyle,
  HandlePointStyle,
  RectOption,
  EllipseOption,
  PolygonOption,
  HandlePoint
} from '../interface'
import { DefaultShapeStyle, DefaultHandlePointStyle } from '../config'
import { ShapeType } from '../enum'
import FreeDraw from '../free-draw'

class Shape {
  id: string
  edit: boolean = false
  type: ShapeType.Ellipse | ShapeType.Polygon | ShapeType.Rect
  shape!: Path2D
  shapeStyle: ShapeStyle
  handlePointStyle: HandlePointStyle

  svgPath!: string
  points!: Array<Array<number>>
  handlePoints!: Array<HandlePoint>

  init: boolean = false

  freeDraw: FreeDraw

  constructor(option: RectOption | EllipseOption | PolygonOption) {
    this.id = option.id
    this.type = option.type
    this.freeDraw = option.freeDraw
    if (option.shapeStyle) {
      this.shapeStyle = option.shapeStyle
    } else {
      this.shapeStyle = DefaultShapeStyle
    }
    if (option.handlePointStyle) {
      this.handlePointStyle = option.handlePointStyle
    } else {
      this.handlePointStyle = DefaultHandlePointStyle
    }
  }

  protected eventTrigger() {}

  protected drawRectDragPoint(x: number, y: number, style: HandlePointStyle) {
    const point = new Path2D()
    point.rect(x - style.size / 2, y - style.size / 2, style.size, style.size)
    this.freeDraw.updateCtxStyle(style)
    this.freeDraw.ctx.fill(point)
    this.freeDraw.ctx.stroke(point)
  }
}

export default Shape
