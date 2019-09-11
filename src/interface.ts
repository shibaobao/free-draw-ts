import { ShapeType } from './enum'

export interface FreeDrawOptions {
  canvasDOM: HTMLCanvasElement
  eventsReceive?: Array<string>
  eventsCallBack?: Function
  mouseOnly?: Boolean
  zoomLevel?: number
  offsetTop?: number
  offsetLeft?: number
  transformCenter?: Array<number>
  calculationAccuracy?: number
}

export interface ZoomAndOffset {
  zoomLevel?: number
  offsetTop?: number
  offsetLeft?: number
  transformCenter?: Array<number>
}

export interface ShapeStyle {
  lineWidth: number
  fillStyle?: string
  strokeStyle: string
}

export interface HandlePoint {
  path: Path2D | null
  point: Array<number>
}

export interface HandlePointStyle {
  lineWidth: number
  fillStyle: string
  strokeStyle: string
  size: number
}

export interface HandleLine {
  path: Path2D | null
  startPoint: Array<number>
  endPoint: Array<number>
}

export interface HandleLineStyle {
  lineWidth: number
  strokeStyle: string
}

export interface AnchorPointStyle {
  lineWidth: number
  fillStyle: string
  strokeStyle: string
  radius: number
}

export interface RectOption {
  id: string
  type: ShapeType.Rect
  points?: Array<Array<number>>
  startPoint?: Array<number>
  width?: number
  height?: number
  shapeStyle?: ShapeStyle
  handlePointStyle?: HandlePointStyle
  handleLineStyle?: HandleLineStyle
  withZoomAndOffset?: boolean
  freeDraw?: any
}

export interface EllipseOption {
  id: string
  type: ShapeType.Ellipse
  x?: number
  y?: number
  radiusX?: number
  radiusY?: number
  rotation?: number
  endAngle?: number
  startAngle?: number
  anticlockwise?: boolean
  withZoomAndOffset?: boolean
  shapeStyle?: ShapeStyle
  handlePointStyle?: HandlePointStyle
  handleLineStyle?: HandleLineStyle
  freeDraw?: any
}

export interface PolygonOption {
  id: string
  type: ShapeType.Polygon
  points?: Array<Array<number>>
  maxPointsNumber?: number
  shapeStyle?: ShapeStyle
  handlePointStyle?: HandlePointStyle
  handleLineStyle?: HandleLineStyle
  anchorPointStyle?: AnchorPointStyle
  freeDraw?: any
}

export interface StringKeyObject {
  [key: string]: any
}
