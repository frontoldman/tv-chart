import { axisOption } from '../types/index'
import Linear from '../scala/Linear'

export default class AxisX {
  context2d: CanvasRenderingContext2D

  maxTick: number

  start: [number, number]

  end: [number, number]

  size: number

  data: Array<any>;

  linear: Linear;

  constructor(option: axisOption) {
    this.context2d = option.context2d
    this.maxTick = option.maxTick

    this.start = option.start
    this.end = option.end

    this.size = option.size

    this.data = option.data
  }

  useLinear(linear: Linear): AxisX {
    this.linear = linear
    return this
  }

  render(): void {
    const { context2d, start, end, size, maxTick, data } = this
    
    context2d.globalAlpha = 1
    context2d.strokeStyle = '#BFBFBF'
    context2d.fillStyle = '#545454'
    context2d.beginPath()
    context2d.moveTo(start[0], start[1])
    context2d.lineTo(end[0], end[1])

    let sparseSize: number = 1

    if (size > maxTick) {
      sparseSize = Math.ceil(size / maxTick)
    }

    for (let i = 0; i < size; i++) {
      const x = this.linear.get(i)
      const y = end[1]

      context2d.moveTo(x, y)
      context2d.lineTo(x, y + 10 + ((i === 0 || i === size - 1) ? 10 : 0))

      context2d.textAlign = 'center'
      context2d.textBaseline = 'middle'
      context2d.font = '16px SimSun, Songti SC'

      if (sparseSize <= 1 || i % sparseSize === 0 || i === size - 1) {
        context2d.fillText(data[i], x, y + 20)
      }
    }

    context2d.stroke()

  }
}