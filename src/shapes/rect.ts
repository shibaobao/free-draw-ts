import { RectOption } from '../interface'
import Shape from './shape'

class Rect extends Shape {
  startPoint: Array<number>;
  width: number = 0;
  height: number = 0;
  constructor (option: RectOption) {
    super(option);
    if (option.startPoint && option.startPoint.length > 0 && option.width && option.height) {
      this.startPoint = option.startPoint;
      this.width = option.width;
      this.height = option.height;
      this.draw();
    } else {
      this.init = true;
    }
  }

  private draw () {
    this.shape = this.drawRect();
    this.generateHandlePoints();
    if (this.edit) {
      this.drawRectHandlePoints();
    }
  }

  private drawRect (): Path2D {
    const { width, height, startPoint } = this.getRectAttributes();
    const rectObj = new Path2D();
    rectObj.rect(startPoint[0], startPoint[1], width, height);
    this.freeDraw.updateCtxStyle(this.shapeStyle);
    this.freeDraw.ctx.fill(rectObj);
    this.freeDraw.ctx.stroke(rectObj);
    return rectObj;
  }

  private generateHandlePoints () {
    const handlePoints = [];
    handlePoints[0] = { path: null, point: this.startPoint };
    handlePoints[1] = { path: null, point: [this.startPoint[0] + this.width, this.startPoint[1]] };
    handlePoints[2] = { path: null, point: [this.startPoint[0] + this.width, this.startPoint[1] + this.height] };
    handlePoints[3] = { path: null, point: [this.startPoint[0], this.startPoint[1] + this.height] };
    this.handlePoints = handlePoints;
  }

  private drawRectHandlePoints () {
    const handlePoints = [];
    for (let handlePoint of this.handlePoints) {
      handlePoints.push({
        path: this.drawRectDragPoint(handlePoint.point[0], handlePoint.point[0], this.handlePointStyle),
        point: handlePoint.point
      });
    }
  }

  private getRectAttributes () {
    const startPoint = this.freeDraw.getCoordinateWithZoomAndOffset(this.startPoint);
    const width = this.freeDraw.addZoomForLength(this.width);
    const height = this.freeDraw.addZoomForLength(this.height);
    return {
      startPoint,
      height,
      width
    };
  }
}

export default Rect;
