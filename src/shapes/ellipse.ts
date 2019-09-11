import { EllipseOption } from '../interface'
import Shape from './shape'
import { FreeDrawEvents } from '../enum'

class Ellipse extends Shape {
  x: number = 0
  y: number = 0
  radiusX: number = 50
  radiusY: number = 50
  rotation: number = 0
  endAngle: number = 0
  startAngle: number = Math.PI * 2
  anticlockwise: boolean = false

  constructor(option: EllipseOption) {
    super(option)
    if (option.x) this.x = option.x
    if (option.y) this.y = option.y
    if (option.radiusX) this.radiusX = option.radiusX
    if (option.radiusY) this.radiusY = option.radiusY
    if (option.rotation) this.rotation = option.rotation
    if (option.endAngle) this.endAngle = option.endAngle
    if (option.startAngle) this.startAngle = option.startAngle
    if (option.anticlockwise) this.anticlockwise = option.anticlockwise
    this.draw()
  }

  // **************************** DRAW ****************************
  protected draw() {
    this.shape = this.drawShapeBody()
    this.generateHandlePoints()
    this.generateHandleLines()
    if (this.edit) {
      this.drawHandleLines()
      this.drawHandlePoints()
    }
  }

  protected drawShapeBody(): Path2D {
    const { x, y, radiusX, radiusY } = this.getAttributes()
    const ellipseObj = new Path2D()
    ellipseObj.ellipse(
      x,
      y,
      radiusX,
      radiusY,
      this.rotation,
      this.startAngle,
      this.endAngle,
      this.anticlockwise
    )
    this.freeDraw.updateCtxStyle(this.shapeStyle)
    this.freeDraw.ctx.fill(ellipseObj)
    this.freeDraw.ctx.stroke(ellipseObj)
    return ellipseObj
  }

  // **************************** GENERATE ****************************
  protected generateHandlePoints() {
    const { x, y, radiusX, radiusY } = this.getAttributes()
    const handlePoints = []
    handlePoints[0] = {
      path: null,
      point: [x - radiusX, y - radiusY]
    }
    handlePoints[1] = {
      path: null,
      point: [x + radiusX, y - radiusY]
    }
    handlePoints[2] = {
      path: null,
      point: [x + radiusX, y + radiusY]
    }
    handlePoints[3] = {
      path: null,
      point: [x - radiusX, y + radiusY]
    }
    this.handlePoints = handlePoints
  }

  protected generateHandleLines() {
    const { x, y, radiusX, radiusY } = this.getAttributes()
    const handleLines = []
    handleLines[0] = {
      path: null,
      startPoint: [x - radiusX, y - radiusY],
      endPoint: [x + radiusX, y - radiusY]
    }
    handleLines[1] = {
      path: null,
      startPoint: [x + radiusX, y - radiusY],
      endPoint: [x + radiusX, y + radiusY]
    }
    handleLines[2] = {
      path: null,
      startPoint: [x + radiusX, y + radiusY],
      endPoint: [x - radiusX, y + radiusY]
    }
    handleLines[3] = {
      path: null,
      startPoint: [x - radiusX, y + radiusY],
      endPoint: [x - radiusX, y - radiusY]
    }
    this.handleLines = handleLines
  }

  // **************************** ATTRIBUTES ****************************
  protected getAttributes() {
    const centerPoint = this.freeDraw.getCoordinateWithZoomAndOffset([this.x, this.y])
    const radiusX = this.freeDraw.addZoomForLength(this.radiusX)
    const radiusY = this.freeDraw.addZoomForLength(this.radiusY)
    return {
      x: centerPoint[0],
      y: centerPoint[1],
      radiusX,
      radiusY
    }
  }

  protected setAttributes() {
    this.x = this.freeDraw.toFixedAccuracy(this.x)
    this.y = this.freeDraw.toFixedAccuracy(this.y)
    this.radiusX = this.freeDraw.toFixedAccuracy(this.radiusX)
    this.radiusY = this.freeDraw.toFixedAccuracy(this.radiusY)
  }

  // **************************** MOUSE ****************************
  protected handleMouseMove(event: MouseEvent) {
    const { offsetX: x, offsetY: y } = event
    if (this.clickedHandlePointIndex !== -1) {
      this.resizeEllipseByPoint(x, y)
      if (this.freeDraw.eventsReceive.includes(FreeDrawEvents.Transform)) {
        this.freeDraw.eventsCallBack(event, this.id, FreeDrawEvents.Transform)
      }
    } else if (this.clickedHandleLineIndex !== -1) {
      this.resizeEllipseByLine(x, y)
      if (this.freeDraw.eventsReceive.includes(FreeDrawEvents.Transform)) {
        this.freeDraw.eventsCallBack(event, this.id, FreeDrawEvents.Transform)
      }
    } else if (this.clickedInShapePoint) {
      this.moveEllipse(x, y)
      if (this.freeDraw.eventsReceive.includes(FreeDrawEvents.Drag)) {
        this.freeDraw.eventsCallBack(event, this.id, FreeDrawEvents.Drag)
      }
    }
  }

  // **************************** TRANSFORM ****************************
  private resizeEllipseByPoint(x: number, y: number) {
    const basePoint = this.handlePoints[this.clickedHandlePointIndex].point
    const ratio = this.radiusX / this.radiusY
    const deltaX = (x - basePoint[0]) / this.freeDraw.zoomLevel
    const deltaY = deltaX / ratio
    const increment = [
      // radiusX, radiusY, x, y
      [-1, -1, 1, 1],
      [1, 1, 1, -1],
      [1, 1, 1, 1],
      [-1, -1, 1, -1]
    ]

    const newRadiusX = this.radiusX + (deltaX * increment[this.clickedHandlePointIndex][0]) / 2
    const newRadiusY = this.radiusY + (deltaY * increment[this.clickedHandlePointIndex][1]) / 2
    if (newRadiusX > 0 && newRadiusY > 0) {
      this.radiusX = newRadiusX
      this.radiusY = newRadiusY
      this.x += (deltaX * increment[this.clickedHandlePointIndex][2]) / 2
      this.y += (deltaY * increment[this.clickedHandlePointIndex][3]) / 2
    }

    this.setAttributes()
  }

  private resizeEllipseByLine(x: number, y: number) {
    const baseLine = this.handleLines[this.clickedHandleLineIndex]
    const deltaX = (x - baseLine.startPoint[0]) / this.freeDraw.zoomLevel
    const deltaY = (y - baseLine.startPoint[1]) / this.freeDraw.zoomLevel
    const increment = [
      // radiusX, radiusY, x, y
      [0, -1, 0, 1],
      [1, 0, 1, 0],
      [0, 1, 0, 1],
      [-1, 0, 1, 0]
    ]

    const newRadiusX = this.radiusX + (deltaX * increment[this.clickedHandleLineIndex][0]) / 2
    const newRadiusY = this.radiusY + (deltaY * increment[this.clickedHandleLineIndex][1]) / 2
    if (newRadiusX > 0 && newRadiusY > 0) {
      this.radiusX = newRadiusX
      this.radiusY = newRadiusY
      this.x += (deltaX * increment[this.clickedHandleLineIndex][2]) / 2
      this.y += (deltaY * increment[this.clickedHandleLineIndex][3]) / 2
    }

    this.setAttributes()
  }

  private moveEllipse(x: number, y: number) {
    if (this.clickedInShapePoint) {
      const deltaX = (x - this.clickedInShapePoint[0]) / this.freeDraw.zoomLevel
      const deltaY = (y - this.clickedInShapePoint[1]) / this.freeDraw.zoomLevel
      this.x += deltaX
      this.y += deltaY

      this.clickedInShapePoint = [x, y]
      this.setAttributes()
    }
  }

  // **************************** SVG ****************************
  protected toSVGPath() {
    const x = this.freeDraw.toFixedAccuracy(this.x)
    const y = this.freeDraw.toFixedAccuracy(this.y)
    const radiusX = this.freeDraw.toFixedAccuracy(this.radiusX)
    const radiusY = this.freeDraw.toFixedAccuracy(this.radiusY)
    this.svgPath = `<ellipse cx="${x}" cy="${y}" rx="${radiusX}" ry="${radiusY}" />`
  }
}

export default Ellipse
