import { COLOR_PLATE_8 } from '../options/color'
import BaseChart from './BaseChart'
import pubsub from '../utils/pubsub'

interface Angle {
  start: number,
  end: number,
}

interface basePieOption {
  context2d: CanvasRenderingContext2D;
  arcs: Array<Angle>;
  center: { x: number, y: number };
  eventNo: number;
  radius: number | { minRadius: number, maxRadius: number };
  animateFn: () => Array<Angle>;
}

export default class Pie extends BaseChart {
  context2d: CanvasRenderingContext2D

  arcs: Array<Angle>

  height: number

  center: { x: number, y: number }

  radius: number | { minRadius: number, maxRadius: number }

  animateFn: () => Array<Angle>

  eventNo: number;

  eventTokens: Array<number> = []

  tipLinearEvent: { data: any, x: number, y: number, index: number }

  constructor(option: basePieOption) {
    super()
    this.arcs = option.arcs
    this.context2d = option.context2d
    this.center = option.center
    this.radius = option.radius

    this.eventNo = option.eventNo

    this.animateFn = option.animateFn

    this.initEvent()
  }

  private initEvent(): void {
    const locationToken = pubsub.subscribe('mouseover' + this.eventNo, 
    (e: { data: any, x: number, y: number, index: number }) => {
      this.tipLinearEvent = e
    })

    const hideToken = pubsub.subscribe('mouseout' + this.eventNo, () => {
      console.log('out')
      this.tipLinearEvent = null
    })

    this.eventTokens.push(hideToken)
    this.eventTokens.push(locationToken)
  }



  getEventIndex(x: number, y: number): number {
    let { arcs, center, context2d, radius } = this
    let _radius: number, minRadius: number, maxRadius: number

    let isHuan = false

    if (typeof radius === 'object') {
      minRadius = radius.minRadius
      maxRadius = radius.maxRadius
      isHuan = true
    } else {
      maxRadius = radius
      minRadius = 0
    }

    let startX = center.x
    let startY = center.y

    const distanceWithCenter = Math.sqrt(Math.pow((x - center.x), 2) + Math.pow((y - center.y), 2))

    if (distanceWithCenter >= minRadius && distanceWithCenter <= maxRadius) {
      const distanceAngle = getAngle(startX, startY, x, y)
      let inIndex = -1
      arcs.some(({ start, end }: { start: number, end: number }, index) => {

        if (distanceAngle >= start && distanceAngle < end) {
          inIndex = index
          return true
        }
      })

      return inIndex
    }

    return -1
  }

  renderTipHover() {
    console.log('in: ', this.tipLinearEvent)
    const { index } = this.tipLinearEvent
    let { arcs, center, context2d, radius } = this

    let _radius: number, minRadius: number, maxRadius: number

    let isHuan = false
    if (typeof radius === 'object') {
      minRadius = radius.minRadius
      maxRadius = radius.maxRadius
      isHuan = true
    } else {
      _radius = radius
    }

    const { start, end } = arcs[index]
    const color = COLOR_PLATE_8[index % COLOR_PLATE_8.length]

    context2d.beginPath()

    if (isHuan) {
      context2d.arc(center.x, center.y, maxRadius * 1.1, start, end)
      context2d.arc(center.x, center.y, minRadius, end, start, true)
    } else {
      context2d.arc(center.x, center.y, _radius * 1.1, start, end)
      context2d.lineTo(center.x, center.y)
    }

    context2d.closePath()
    context2d.lineWidth = 0.00001
    context2d.strokeStyle = color
    context2d.fillStyle = color
    context2d.fill()

  }

  renderChart() {
    this.arcs = this.animateFn()

    let { arcs, center, context2d, radius } = this

    let _radius: number, minRadius: number, maxRadius: number

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
      context2d.lineWidth = 0.00001
      context2d.strokeStyle = COLOR_PLATE_8[index % COLOR_PLATE_8.length]
      context2d.fillStyle = COLOR_PLATE_8[index % COLOR_PLATE_8.length]
      context2d.fill()
    })

    context2d.stroke()
  }

  render() {
    this.renderChart()
    if (this.tipLinearEvent) {
      this.renderTipHover()
    }
  }
}


/**
 * 获取夹角
 * @param px 
 * @param py 
 * @param mx 
 * @param my 
 */
function getAngle(px: number, py: number, mx: number, my: number): number {//获得人物中心和鼠标坐标连线，与y轴正半轴之间的夹角
  var x = Math.abs(px - mx);
  var y = Math.abs(py - my);
  var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  var cos = y / z;
  var radina = Math.acos(cos);//用反三角函数求弧度
  var angle = Math.floor(180 / (Math.PI / radina));//将弧度转换成角度

  if (mx > px && my > py) {//鼠标在第四象限
    angle = 180 - angle;
  }

  if (mx == px && my > py) {//鼠标在y轴负方向上
    angle = 180;
  }

  if (mx > px && my == py) {//鼠标在x轴正方向上
    angle = 90;
  }

  if (mx < px && my > py) {//鼠标在第三象限
    angle = 180 + angle;
  }

  if (mx < px && my == py) {//鼠标在x轴负方向
    angle = 270;
  }

  if (mx < px && my < py) {//鼠标在第二象限
    angle = 360 - angle;
  }

  // console.log('angle:', angle)

  return (angle / 180 - 0.5) * Math.PI;
}