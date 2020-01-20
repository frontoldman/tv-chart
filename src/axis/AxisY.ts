import { axisOption } from '../types/index'
import Linear from '../scala/Linear'

export default class AxisY {
  context2d: CanvasRenderingContext2D

  maxTick: number

  start: [number, number]

  end: [number, number]

  size: number

  data: Array<any>;

  linear: Linear;

  domian: Array<number>;

  constructor(option: axisOption) {
    this.context2d = option.context2d
    this.maxTick = option.maxTick

    this.start = option.start
    this.end = option.end

    this.size = option.size

    this.data = option.data
  }

  useLinear(linear: Linear): AxisY {
    this.linear = linear
    return this
  }

  useDomain(domian: Array<number>): AxisY {
    this.domian = domian
    return this
  }

  render(): void {
    const { context2d, start, end, size, maxTick, data, domian } = this

    context2d.globalAlpha = 1
    context2d.strokeStyle = '#BFBFBF'
    context2d.fillStyle = '#545454'
    context2d.beginPath()
    context2d.moveTo(start[0], start[1])
    context2d.lineTo(end[0], end[1])

    const distance = domian[1] - domian[0]

    const yStep = distance / (maxTick - 1)

    const x = start[0]
    for (let i = maxTick - 1; i >= 0; i--) {
      let _yVal: number = yStep * i + domian[0]
      let y = this.linear.get(_yVal)
      let yVal = _yVal.toFixed(1)

      context2d.moveTo(x, y)
      context2d.lineTo(x - 10 - ((i === 0 || i === maxTick - 1) ? 10 : 0), y)

      context2d.textAlign = 'end'
      context2d.textBaseline = 'middle'
      context2d.font = '12px SimSun, Songti SC'

      context2d.fillText(yVal, x - 20, y)
    }

    context2d.stroke()

  }
}