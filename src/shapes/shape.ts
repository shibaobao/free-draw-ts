import {
  ShapeStyle,
  RectOption,
  EllipseOption,
  PolygonOption,
  HandlePoint,
  HandlePointStyle,
  HandleLine,
  HandleLineStyle
} from '../interface'
import {
  DefaultShapeStyle,
  DefaultEditingShapeStyle,
  DefaultHandlePointStyle,
  DefaultHandleLineStyle
} from '../config'
import { Mode, ShapeType, Mouse, Key, KeyCodes } from '../enum'
import FreeDraw from '../free-draw'

class Shape {
  id: string
  edit: boolean = true
  type: ShapeType.Ellipse | ShapeType.Polygon | ShapeType.Rect
  shape!: Path2D
  shapeStyle: ShapeStyle
  handlePointStyle: HandlePointStyle
  handleLineStyle: HandleLineStyle

  svgPath!: string
  points: Array<Array<number>> = []
  handlePoints!: Array<HandlePoint>
  handleLines!: Array<HandleLine>

  clickedInShapePoint: number[] | null = null
  clickedHandlePointIndex: number = -1
  clickedHandleLineIndex: number = -1

  init: boolean = false
  isFinished: boolean = false

  freeDraw: FreeDraw

  constructor(option: RectOption | EllipseOption | PolygonOption) {
    this.id = option.id
    this.type = option.type
    this.freeDraw = option.freeDraw
    if (option.shapeStyle) {
      this.shapeStyle = option.shapeStyle
    } else {
      this.shapeStyle = DefaultEditingShapeStyle
    }
    if (option.handleLineStyle) {
      this.handleLineStyle = option.handleLineStyle
    } else {
      this.handleLineStyle = DefaultHandleLineStyle
    }
    if (option.handlePointStyle) {
      this.handlePointStyle = option.handlePointStyle
    } else {
      this.handlePointStyle = DefaultHandlePointStyle
    }
  }

  // **************************** DRAW ****************************
  protected draw() {
    return
  }

  protected drawShapeBody() {
    return
  }

  protected drawHandlePoint(x: number, y: number, style: HandlePointStyle) {
    const point = new Path2D()
    point.rect(x - style.size / 2, y - style.size / 2, style.size, style.size)
    this.freeDraw.updateCtxStyle(style)
    this.freeDraw.ctx.fill(point)
    this.freeDraw.ctx.stroke(point)

    return point
  }

  protected drawHandleLine(startPoint: number[], endPoint: number[], style: HandleLineStyle) {
    const linePath = `M${startPoint[0]},${startPoint[1]}L${endPoint[0]},${endPoint[1]}`
    const lineObj = new Path2D(linePath)
    this.freeDraw.updateCtxStyle(style)
    this.freeDraw.ctx.fill(lineObj)
    this.freeDraw.ctx.stroke(lineObj)

    return lineObj
  }

  protected drawHandlePoints() {
    for (const handlePoint of this.handlePoints) {
      handlePoint.path = this.drawHandlePoint(
        handlePoint.point[0],
        handlePoint.point[1],
        this.handlePointStyle
      )
    }
  }

  protected drawHandleLines() {
    for (const handleLine of this.handleLines) {
      handleLine.path = this.drawHandleLine(
        handleLine.startPoint,
        handleLine.endPoint,
        this.handleLineStyle
      )
    }
  }

  // **************************** FINISH ****************************
  protected finish() {
    this.edit = false
    this.isFinished = true
    this.shapeStyle = DefaultShapeStyle
    this.freeDraw.updateMode(Mode.View)
    this.toSVGPath()
  }

  // **************************** MOUSE ****************************
  public mouseEventTrigger(event: MouseEvent) {
    const { type } = event
    if (type === Mouse.Mousedown) {
      this.handleMouseDown(event)
    } else if (type === Mouse.Mouseup) {
      this.handleMouseUp()
    } else if (type === Mouse.Mousemove) {
      this.handleMouseMove(event)
    }
  }

  protected handleMouseUp() {
    this.clickedHandleLineIndex = -1
    this.clickedHandlePointIndex = -1
    this.clickedInShapePoint = null
  }

  protected handleMouseDown(event: MouseEvent) {
    return
  }

  protected handleMouseMove(event: MouseEvent) {
    return
  }

  // **************************** KEY ****************************
  public keyEventTrigger(event: KeyboardEvent) {
    const { type } = event
    if (type === Key.Keydown) {
      this.handleKeyDown(event)
    } else if (type === Key.Keyup) {
      this.handleKeyUp(event)
    }
  }

  protected handleKeyDown(event: KeyboardEvent) {
    let keyCode = null
    if (event.key) {
      keyCode = event.key
    }
    if (keyCode === KeyCodes.Enter) {
      this.finish()
    }
  }

  protected handleKeyUp(event: KeyboardEvent) {
    return
  }

  // **************************** DETECTION ****************************
  protected includes(x: number, y: number): Boolean {
    return (
      this.pointInHandlePoints(x, y) || this.pointInHandleLines(x, y) || this.pointInShape(x, y)
    )
  }

  protected pointInShape(x: number, y: number): Boolean {
    if (!this.shape) {
      this.clickedInShapePoint = null
    } else {
      this.clickedInShapePoint = this.freeDraw.ctx.isPointInPath(this.shape, x, y) ? [x, y] : null
    }

    return this.clickedInShapePoint !== null
  }

  protected pointInHandlePoints(x: number, y: number): Boolean {
    if (!this.shape) {
      this.clickedHandlePointIndex = -1
    } else if (this.edit) {
      for (let i = 0; i < this.handlePoints.length; i++) {
        if (this.freeDraw.ctx.isPointInPath(this.handlePoints[i].path || new Path2D(), x, y)) {
          this.clickedHandlePointIndex = i
          break
        }
      }
    }

    return this.clickedHandlePointIndex !== -1
  }

  protected pointInHandleLines(x: number, y: number): Boolean {
    if (!this.shape) {
      this.clickedHandleLineIndex = -1
    } else if (this.edit) {
      for (let i = 0; i < this.handleLines.length; i++) {
        if (
          this.distanceToSegment(
            x,
            y,
            this.handleLines[i].startPoint,
            this.handleLines[i].endPoint
          ) < 3
        ) {
          this.clickedHandleLineIndex = i
          break
        }
      }
    }

    return this.clickedHandleLineIndex !== -1
  }

  // **************************** ATTRIBUTES ****************************
  protected getAttributes() {
    return
  }

  protected setAttributes() {
    return
  }

  // **************************** SVG ****************************
  protected toSVGPath() {
    return
  }

  // **************************** UTILS ****************************
  private distanceBetweenPoints(point1: number[], point2: number[]) {
    const x1 = point1[0]
    const y1 = point1[1]
    const x2 = point2[0]
    const y2 = point2[1]
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
  }

  private distanceToSegment(x: number, y: number, startPoint: number[], endPoint: number[]) {
    const x1 = startPoint[0]
    const y1 = startPoint[1]
    const x2 = endPoint[0]
    const y2 = endPoint[1]
    const v1 = [x2 - x1, y2 - y1]
    const v2 = [x - x1, y - y1]
    const v3 = [x - x2, y - y2]

    const v1DotV2 = v1[0] * v2[0] + v1[1] * v2[1]
    const v1DotV3 = v1[0] * v3[0] + v1[1] * v3[1]

    if (v1DotV2 < 0 && v1DotV3 < 0) {
      return this.distanceBetweenPoints([x, y], startPoint)
    }
    if (v1DotV2 > 0 && v1DotV3 > 0) {
      return this.distanceBetweenPoints([x, y], endPoint)
    }
    const a = y2 - y1
    const b = x1 - x2
    const c = x2 * y1 - x1 * y2
    return Math.abs(a * x + b * y + c) / Math.sqrt(a * a + b * b)
  }
}

export default Shape
