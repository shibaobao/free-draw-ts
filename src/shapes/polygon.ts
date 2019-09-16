import { PolygonOption, AnchorPointStyle, HandlePoint } from '../interface'
import Shape from './shape'
import { DefaultAnchorPointStyle } from '../config'
import { FreeDrawEvents, KeyCodes } from '../enum'

class Polygon extends Shape {
  anchorPointStyle: AnchorPointStyle = DefaultAnchorPointStyle
  anchorPoints: Array<HandlePoint> = []
  isDrawing: Boolean = true
  maxPointsNumber: number = 50
  clickedAnchorPointIndex: number = -1

  constructor(option: PolygonOption) {
    super(option)

    if (option.anchorPointStyle) {
      this.anchorPointStyle = option.anchorPointStyle
    }
    if (option.points && option.points.length) {
      this.anchorPoints = option.points.map(point => ({ path: null, point }))
    } else {
      this.init = true
    }
    if (option.maxPointsNumber) {
      this.maxPointsNumber = option.maxPointsNumber
    }
  }

  // **************************** DRAW ****************************
  protected draw() {
    this.shape = this.drawShapeBody()
    this.generateHandlePoints()
    this.generateHandleLines()
    if (this.isDrawing) {
      // If the polygon is not closed, handle lines and points will not be drawn
      this.drawPolygonAnchorPoints()
    } else if (this.edit) {
      // Display all control elements after finishing the polygon
      this.drawHandleLines()
      this.drawHandlePoints()
      this.drawPolygonAnchorPoints()
    }
  }

  protected drawShapeBody() {
    const { anchorPoints } = this.getAttributes()
    let polygonPath = `M${anchorPoints.map(point => point.join(',')).join('L')}`
    if (!this.isDrawing) {
      // If the polygon has closed, get rid of the last element in the points array because it resembles the first one.
      polygonPath = `M${anchorPoints
        .map(point => point.join(','))
        .slice(0, -1)
        .join('L')}Z`
    }
    const polygonObj = new Path2D(polygonPath)
    this.freeDraw.updateCtxStyle(this.shapeStyle)
    if (!this.isDrawing) {
      this.freeDraw.ctx.fill(polygonObj)
    }
    this.freeDraw.ctx.stroke(polygonObj)
    return polygonObj
  }

  private drawPolygonAnchorPoints() {
    const { anchorPoints } = this.getAttributes()
    for (let i = 0; i < anchorPoints.length; i++) {
      if (!this.isDrawing && i === anchorPoints.length - 1) {
        // If the polygon is closed, the last point in the array should not be drawn because it resembles the first one.
        break
      }
      const anchorPointObj = new Path2D()
      anchorPointObj.arc(
        anchorPoints[i][0],
        anchorPoints[i][1],
        this.anchorPointStyle.radius,
        0,
        2 * Math.PI,
        false
      )
      this.freeDraw.updateCtxStyle(this.anchorPointStyle)
      this.freeDraw.ctx.fill(anchorPointObj)
      this.freeDraw.ctx.stroke(anchorPointObj)
      this.anchorPoints[i].path = anchorPointObj
    }
  }

  // **************************** GENERATE ****************************
  private generateHandlePoints() {
    const { anchorPoints } = this.getAttributes()
    let xCoordinates = anchorPoints.map(point => point[0])
    let yCoordinates = anchorPoints.map(point => point[1])
    if (!this.isDrawing) {
      // If the polygon is closed, the last point should not be taken into account or the max-min result will remain the same as the very beginning.
      xCoordinates.splice(-1, 1)
      yCoordinates.splice(-1, 1)
    }
    // The replacement method of the origin 4 ifs
    const top = Math.min(...yCoordinates)
    const bottom = Math.max(...yCoordinates)
    const left = Math.min(...xCoordinates)
    const right = Math.max(...xCoordinates)

    this.handlePoints = [
      { path: null, point: [left, top] },
      { path: null, point: [right, top] },
      { path: null, point: [right, bottom] },
      { path: null, point: [left, bottom] }
    ]
  }

  private generateHandleLines() {
    this.handleLines = [
      {
        path: null,
        startPoint: this.handlePoints[0].point,
        endPoint: this.handlePoints[1].point
      },
      {
        path: null,
        startPoint: this.handlePoints[1].point,
        endPoint: this.handlePoints[2].point
      },
      {
        path: null,
        startPoint: this.handlePoints[2].point,
        endPoint: this.handlePoints[3].point
      },
      {
        path: null,
        startPoint: this.handlePoints[3].point,
        endPoint: this.handlePoints[0].point
      }
    ]
  }

  // **************************** ATTRIBUTES ****************************
  protected getAttributes() {
    let anchorPoints: Array<Array<number>> = []
    if (this.anchorPoints && this.anchorPoints.length) {
      anchorPoints = this.anchorPoints.map(point =>
        this.freeDraw.getCoordinateWithZoomAndOffset(point.point)
      )
    }
    return {
      anchorPoints
    }
  }

  protected setAttributes() {
    this.anchorPoints.forEach(point => {
      point.point[0] = this.freeDraw.toFixedAccuracy(point.point[0])
      point.point[1] = this.freeDraw.toFixedAccuracy(point.point[1])
    })
  }

  // **************************** MOUSE ****************************
  protected handleMouseDown(event: MouseEvent) {
    const { offsetX: x, offsetY: y } = event
    const clickedAnchorPointIndex = this.pointInAnchorPointIndex(x, y)
    if (this.isDrawing) {
      if (clickedAnchorPointIndex !== 0) {
        // Clicked on anywhere except for the first anchor point
        this.anchorPoints.push({
          path: null,
          point: this.freeDraw.getCoordinateWithoutZoomAndOffset([x, y])
        })
      } else {
        // Close path when clicking on the first anchor point
        this.anchorPoints.push({
          path: null,
          point: [this.anchorPoints[0].point[0], this.anchorPoints[0].point[1]]
        })
        this.isDrawing = false
      }
    } else if (clickedAnchorPointIndex !== -1) {
      this.clickedAnchorPointIndex = clickedAnchorPointIndex
    }
  }

  protected handleMouseMove(event: MouseEvent) {
    const { offsetX: x, offsetY: y } = event
    if (this.clickedInShapePoint) {
      this.movePolygon(x, y)
      if (this.freeDraw.eventsReceive.includes(FreeDrawEvents.Drag)) {
        this.freeDraw.eventsCallBack(event, this.id, FreeDrawEvents.Drag)
      }
    } else if (this.clickedAnchorPointIndex !== -1) {
      this.movePolygonAnchorPoint(x, y)
    }
  }

  protected handleMouseUp() {
    super.handleMouseUp()
    this.clickedAnchorPointIndex = -1
  }

  // **************************** KEY ****************************
  protected handleKeyDown(event: KeyboardEvent) {
    super.handleKeyDown(event)
    let keyCode = null
    if (event.key) {
      keyCode = event.key
    }
    if (this.edit) {
      if (keyCode === KeyCodes.Backspace) {
        if (this.anchorPoints.length) {
          this.anchorPoints.pop()
          this.isDrawing = true
        }
      }
    }
  }

  // **************************** DETECTION ****************************
  protected includes(x: number, y: number): Boolean {
    return this.pointInAnchorPointIndex(x, y) !== -1 || this.pointInShape(x, y)
  }

  private pointInAnchorPointIndex(x: number, y: number) {
    if (!this.shape) {
      return -1
    } else {
      if (this.anchorPoints && this.anchorPoints.length > 1) {
        for (let i = 0; i < this.anchorPoints.length; i++) {
          if (this.freeDraw.ctx.isPointInPath(this.anchorPoints[i].path || new Path2D(), x, y)) {
            return i
          }
        }
      }
    }
    return -1
  }

  // **************************** TRANSFORM ****************************
  private movePolygon(x: number, y: number) {
    let anchorPoints: Array<HandlePoint> = []
    if (this.clickedInShapePoint) {
      const deltaX = (x - this.clickedInShapePoint[0]) * this.freeDraw.zoomLevel
      const deltaY = (y - this.clickedInShapePoint[1]) * this.freeDraw.zoomLevel
      anchorPoints = this.anchorPoints.map(each => {
        return {
          path: each.path,
          point: [each.point[0] + deltaX, each.point[1] + deltaY]
        }
      })
      this.clickedInShapePoint = [x, y]
    }
    this.anchorPoints = anchorPoints
    this.setAttributes()
  }

  private movePolygonAnchorPoint(x: number, y: number) {
    if (this.clickedAnchorPointIndex !== -1) {
      const { anchorPoints } = this.getAttributes()
      const deltaX = (x - anchorPoints[this.clickedAnchorPointIndex][0]) * this.freeDraw.zoomLevel
      const deltaY = (y - anchorPoints[this.clickedAnchorPointIndex][1]) * this.freeDraw.zoomLevel

      this.anchorPoints[this.clickedAnchorPointIndex].point[0] += deltaX
      this.anchorPoints[this.clickedAnchorPointIndex].point[1] += deltaY

      this.setAttributes()
    }
  }

  // **************************** SVG ****************************
  protected toSVGPath() {
    this.points = this.anchorPoints.map(point => point.point)
    this.svgPath = `<path d="M${this.points.map(point => point.join(',')).join('L')}Z />`
  }
}

export default Polygon
