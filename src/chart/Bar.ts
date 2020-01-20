import { COLOR_PLATE_8 } from '../options/color'

interface Point {
  x: number,
  y: number
}

interface baseBarOption {
  context2d: CanvasRenderingContext2D;
  points: Array<Point>;
  height: number;
}

export default class Bar {
  context2d: CanvasRenderingContext2D

  points: Array<Point>

  height: number

  constructor(option: baseBarOption) {
    this.points = option.points
    this.context2d = option.context2d
    this.height = option.height
  }

  render() {
    const { points, height, context2d } = this

    const barWidth = 20

    context2d.fillStyle = COLOR_PLATE_8[0]
    context2d.beginPath()
    points.forEach((point: Point) => {
      context2d.fillRect(point.x - barWidth / 2, point.y, barWidth, height - point.y)
    })

    context2d.stroke()
  }
}