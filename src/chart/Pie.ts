import { COLOR_PLATE_8 } from '../options/color'

interface Angle {
  start: number,
  end: number,
}

interface basePieOption {
  context2d: CanvasRenderingContext2D;
  arcs: Array<Angle>;
  center: { x: number, y: number };
  radius: number | { minRadius: number, maxRadius: number }
}

export default class Pie {
  context2d: CanvasRenderingContext2D

  arcs: Array<Angle>

  height: number

  center: { x: number, y: number }

  radius: number | { minRadius: number, maxRadius: number }

  constructor(option: basePieOption) {
    this.arcs = option.arcs
    this.context2d = option.context2d
    this.center = option.center
    this.radius = option.radius
  }

  render() {
    const { arcs, center, context2d, radius } = this

    let _radius: number, minRadius: number, maxRadius: number 

    console.log(radius)

    let isHuan = false
    if (typeof radius === 'object') {
      minRadius = radius.minRadius
      maxRadius = radius.maxRadius
      isHuan = true
    } else {
      _radius = radius
    }

    arcs.forEach(({ start, end }: { start: number, end: number }, index) => {
      context2d.beginPath()
      
      if (isHuan) {
        context2d.arc(center.x, center.y, maxRadius, start, end)
        context2d.arc(center.x, center.y, minRadius, end, start, true)
      } else {
        context2d.arc(center.x, center.y, _radius, start, end)
        context2d.lineTo(center.x, center.y)
      }
      
      context2d.closePath()
      context2d.strokeStyle = COLOR_PLATE_8[index % COLOR_PLATE_8.length]
      context2d.fillStyle = COLOR_PLATE_8[index % COLOR_PLATE_8.length]
      context2d.fill()

    })

    context2d.stroke()
    // context2d.lineWidth = 1
  }
}