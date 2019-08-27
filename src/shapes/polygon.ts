import { PolygonOption } from '../interface'
import Shape from './shape'

class Polygon extends Shape {
  constructor (option: PolygonOption) {
    super(option);
  }
}

export default Polygon;
