import { RectOption } from '../interface'
import Shape from './shape'
import { FreeDrawEvents } from '../enum'

class Rect extends Shape {
  startPoint!: Array<number>
  width: number = 100
  height: number = 100

  constructor(option: RectOption) {
    super(option)
    if (option.startPoint && option.startPoint.length > 0 && option.width && option.height) {
      this.startPoint = option.startPoint
      this.width = option.width
      this.height = option.height
    } else {
      this.init = true
    }
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
    const { width, height, startPoint } = this.getAttributes()
    const rectObj = new Path2D()
    rectObj.rect(startPoint[0], startPoint[1], width, height)
    this.freeDraw.updateCtxStyle(this.shapeStyle)
    this.freeDraw.ctx.fill(rectObj)
    this.freeDraw.ctx.stroke(rectObj)
    return rectObj
  }

  // **************************** GENERATE ****************************
  private generateHandlePoints() {
    const { startPoint, width, height } = this.getAttributes()
    const handlePoints = []
    handlePoints[0] = { path: null, point: startPoint }
    handlePoints[1] = { path: null, point: [startPoint[0] + width, startPoint[1]] }
    handlePoints[2] = {
      path: null,
      point: [startPoint[0] + width, startPoint[1] + height]
    }
    handlePoints[3] = { path: null, point: [startPoint[0], startPoint[1] + height] }
    this.handlePoints = handlePoints
  }

  private generateHandleLines() {
    const { startPoint, width, height } = this.getAttributes()
    const handleLines = []
    handleLines[0] = {
      path: null,
      startPoint: startPoint,
      endPoint: [startPoint[0] + width, startPoint[1]]
    }
    handleLines[1] = {
      path: null,
      startPoint: [startPoint[0] + width, startPoint[1]],
      endPoint: [startPoint[0] + width, startPoint[1] + height]
    }
    handleLines[2] = {
      path: null,
      startPoint: [startPoint[0] + width, startPoint[1] + height],
      endPoint: [startPoint[0], startPoint[1] + height]
    }
    handleLines[3] = {
      path: null,
      startPoint: [startPoint[0], startPoint[1] + height],
      endPoint: startPoint
    }
    this.handleLines = handleLines
  }

  // **************************** ATTRIBUTES ****************************
  protected getAttributes() {
    const startPoint = this.freeDraw.getCoordinateWithZoomAndOffset(this.startPoint)
    const width = this.freeDraw.addZoomForLength(this.width)
    const height = this.freeDraw.addZoomForLength(this.height)
    return {
      startPoint,
      height,
      width
    }
  }

  protected setAttributes() {
    this.width = this.freeDraw.toFixedAccuracy(this.width)
    this.height = this.freeDraw.toFixedAccuracy(this.height)
    this.startPoint[0] = this.freeDraw.toFixedAccuracy(this.startPoint[0])
    this.startPoint[1] = this.freeDraw.toFixedAccuracy(this.startPoint[1])
  }

  // **************************** MOUSE ****************************
  protected handleMouseMove(event: MouseEvent) {
    const { offsetX: x, offsetY: y } = event
    if (this.clickedHandlePointIndex !== -1) {
      // Clicked on handle point
      this.resizeRectByPoint(x, y)
      if (this.freeDraw.eventsReceive.includes(FreeDrawEvents.Transform)) {
        this.freeDraw.eventsCallBack(event, this.id, FreeDrawEvents.Transform)
      }
    } else if (this.clickedHandleLineIndex !== -1) {
      // Clicked on handle line
      this.resizeRectByLine(x, y)
      if (this.freeDraw.eventsReceive.includes(FreeDrawEvents.Transform)) {
        this.freeDraw.eventsCallBack(event, this.id, FreeDrawEvents.Transform)
      }
    } else if (this.clickedInShapePoint) {
      // Clicked inside the shape
      this.moveRect(x, y)
      if (this.freeDraw.eventsReceive.includes(FreeDrawEvents.Drag)) {
        this.freeDraw.eventsCallBack(event, this.id, FreeDrawEvents.Drag)
      }
    }
  }

  // **************************** TRANSFORM ****************************
  private resizeRectByPoint(x: number, y: number) {
    const basePoint = this.handlePoints[this.clickedHandlePointIndex].point
    const ratio = this.width / this.height
    const deltaWidth = (x - basePoint[0]) / this.freeDraw.zoomLevel
    const deltaHeight = deltaWidth / ratio
    const deltaX = (x - basePoint[0]) * this.freeDraw.zoomLevel
    const deltaY = deltaX / ratio
    const increment = [
      // width, height, startPoint[0], startPoint[1], increases or decreases or maintains
      [-1, -1, 1, 1],
      [1, 1, 0, -1],
      [1, 1, 0, 0],
      [-1, -1, 1, 0]
    ]
    const newWidth = this.width + deltaWidth * increment[this.clickedHandlePointIndex][0]
    const newHeight = this.height + deltaHeight * increment[this.clickedHandlePointIndex][1]
    if (newWidth > 0 && newHeight > 0) {
      this.width = newWidth
      this.height = newHeight
      this.startPoint[0] += deltaX * increment[this.clickedHandlePointIndex][2]
      this.startPoint[1] += deltaY * increment[this.clickedHandlePointIndex][3]
    }

    this.setAttributes()
  }

  private resizeRectByLine(x: number, y: number) {
    const baseLine = this.handleLines[this.clickedHandleLineIndex]
    const deltaWidth = (x - baseLine.startPoint[0]) / this.freeDraw.zoomLevel
    const deltaHeight = (y - baseLine.startPoint[1]) / this.freeDraw.zoomLevel
    const deltaX = (x - baseLine.startPoint[0]) * this.freeDraw.zoomLevel
    const deltaY = (y - baseLine.startPoint[1]) * this.freeDraw.zoomLevel
    const increment = [
      // width, height, startPoint[0], startPoint[1]
      [0, -1, 0, 1],
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [-1, 0, 1, 0]
    ]
    const newWidth = this.width + deltaWidth * increment[this.clickedHandleLineIndex][0]
    const newHeight = this.height + deltaHeight * increment[this.clickedHandleLineIndex][1]
    if (newWidth > 0 && newHeight > 0) {
      this.width = newWidth
      this.height = newHeight
      this.startPoint[0] += deltaX * increment[this.clickedHandleLineIndex][2]
      this.startPoint[1] += deltaY * increment[this.clickedHandleLineIndex][3]
    }

    this.setAttributes()
  }

  private moveRect(x: number, y: number) {
    if (this.clickedInShapePoint) {
      const deltaX = (x - this.clickedInShapePoint[0]) * this.freeDraw.zoomLevel
      const deltaY = (y - this.clickedInShapePoint[1]) * this.freeDraw.zoomLevel
      this.startPoint[0] += deltaX
      this.startPoint[1] += deltaY

      this.clickedInShapePoint = [x, y]
      this.setAttributes()
    }
  }

  // **************************** SVG ****************************
  protected toSVGPath() {
    this.points[0] = [
      this.freeDraw.toFixedAccuracy(this.startPoint[0]),
      this.freeDraw.toFixedAccuracy(this.startPoint[1])
    ]
    this.points[1] = [
      this.freeDraw.toFixedAccuracy(this.startPoint[0] + this.width),
      this.freeDraw.toFixedAccuracy(this.startPoint[1])
    ]
    this.points[2] = [
      this.freeDraw.toFixedAccuracy(this.startPoint[0] + this.width),
      this.freeDraw.toFixedAccuracy(this.startPoint[1] + this.height)
    ]
    this.points[3] = [
      this.freeDraw.toFixedAccuracy(this.startPoint[0]),
      this.freeDraw.toFixedAccuracy(this.startPoint[1] + this.height)
    ]
    this.svgPath = `<path d="M${this.points.map(point => point.join(',')).join('L')}Z />`
  }
}

export default Rect
