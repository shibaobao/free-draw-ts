const lineWidth = 2
const strokeStyle = '#0E71EB'
const editingFillStyle = 'rgba(14, 113, 235, 0.3)'
const fillStyle = 'rgba(14, 130, 250, 1)'

const handlePointLineWidth = 2
const handlePointFillStyle = '#FFFFFF'
const handlePoinStrokeStyle = '#0E71EB'
const handlePointSize = 8

const handleLineWidth = 2
const handleLineStrokeStyle = '#0e71e8'

const anchorPointFillStyle = '#27ae60'
const anchorPointRatio = 6

export const DefaultShapeStyle = {
  lineWidth,
  fillStyle,
  strokeStyle
}

export const DefaultEditingShapeStyle = {
  lineWidth,
  fillStyle: editingFillStyle,
  strokeStyle
}

export const DefaultHandlePointStyle = {
  lineWidth: handlePointLineWidth,
  fillStyle: handlePointFillStyle,
  strokeStyle: handlePoinStrokeStyle,
  size: handlePointSize
}

export const DefaultHandleLineStyle = {
  lineWidth: handleLineWidth,
  strokeStyle: handleLineStrokeStyle
}

export const DefaultAnchorPointStyle = {
  lineWidth: handlePointLineWidth,
  fillStyle: anchorPointFillStyle,
  strokeStyle: handleLineStrokeStyle,
  radius: anchorPointRatio
}
