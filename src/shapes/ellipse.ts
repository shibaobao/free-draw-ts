import { EllipseOption } from '../interface'
import Shape from './shape'

class Ellipse extends Shape {
  constructor (option: EllipseOption) {
    super(option);
  }
}

export default Ellipse;
