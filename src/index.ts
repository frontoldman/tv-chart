import { BaseChart, chartOption, chartSize, BaseLinear } from './types/index'
import { getOffset, queryDom, createDom, setStyle, setAttr } from './utils/dom'
import { isString } from './utils/index'
import { max, min } from './utils/data'
import Linear from './scala/linear'

interface Point {
  x: number,
  y: number
}

class Chart {
  private option: chartOption

  private size: chartSize

  private contianerDom: HTMLElement

  private canvasDom: HTMLCanvasElement

  private context2d: CanvasRenderingContext2D

  private _domainY: Array<number> = []

  private _domainX: Array<number> = []

  private linearX: Linear = null

  private linearY: Linear = null

  private maxXTick: number = 6

  private maxYTick: number = 6

  constructor(option: chartOption) {
    this.initOption(option)
    this.initContainer()
    this.createCanvas()

    this.createLinear()

    const { type } = option
    if (type === 'line') {
      this.renderLine()
    } else if (type === 'bar') {
      this.renderBar()
    }

    this.renderAxisX()
    this.renderAxisY()
  }

  // 初始化options
  private initOption(option: chartOption) {
    this.option = option
    return this.option
  }

  // 获取容器尺寸
  private initContainer() {
    const { contianer } = this.option
    let contianerDom: HTMLElement
    if (isString(contianer)) {
      contianerDom = queryDom(<string>contianer)
    } else {
      contianerDom = <HTMLElement>contianer
    }

    if (!contianerDom) {
      throw new Error('请设置正确的contianer')
      return
    }

    this.size = getOffset(contianerDom)
    this.contianerDom = contianerDom

    setStyle(contianerDom, {
      position: 'relative'
    })
  }

  /**
   * 创建canvas
   */
  createCanvas() {
    const { size: { width, height } } = this
    const canvasDom: HTMLCanvasElement = <HTMLCanvasElement>createDom('canvas')
    setStyle(canvasDom, {
      position: 'absolute',
      left: 0,
      right: 0,
      width: width + 'px',
      height: height + 'px',
    })

    setAttr(canvasDom, {
      width: width + 'px',
      height: height + 'px'
    })

    this.canvasDom = canvasDom
    this.contianerDom.appendChild(canvasDom)

    const context2d: CanvasRenderingContext2D = canvasDom.getContext('2d')

    this.context2d = context2d
  }

  /**
   * 创建比例尺
   */
  createLinear() {
    const { data, padding, axis } = this.option
    const { height, width } = this.size

    const maxY: number = max(data, item => item.y)

    const linearY = new Linear()
    linearY.domain([0, maxY]).range([height - padding[2], padding[0]])

    this.linearY = linearY

    let paddingLeft = 0
    let paddingRight = 0
    // 如果坐标轴设置了padding, 图标整体向内
    if (axis && axis.x && axis.x.padding && axis.x.padding.left && axis.x.padding.right) {
      paddingLeft = axis.x.padding.left
      paddingRight = axis.x.padding.right
    } 

    const linearX = new Linear()
    linearX.domain([0, data.length - 1]).range([padding[3] + paddingLeft, width - padding[1] - paddingRight])

    this.linearX = linearX

    this._domainY = [0, maxY]
    this._domainX = [0, data.length - 1]
  }

  renderLine() {
    const { data, showArea } = this.option

    const points: Array<Point> = data.map(({ y }: { y: number }, index: number) => {
      return {
        x: this.linearX.get(index),
        y: this.linearY.get(y)
      }
    })

    const n: number = points.length

    this.context2d.beginPath()
    this.context2d.moveTo(points[0].x, points[0].y)
    if (n === 1) {
      this.context2d.lineTo(points[0].x, points[0].y)
    } else if (n === 2) {
      this.context2d.lineTo(points[1].x, points[1].y)
    } else {
      // https://math.stackexchange.com/questions/45218/implementation-of-monotone-cubic-interpolation

      const ds: number[] = [] // 两点之间的距离y / x 比例
      const dxs: number[] = [] // 两点之间的x距离
      const dys: number[] = [] // 两点之间的y距离
      const ms: number[] = []

      let i

      for (i = 0; i < n - 1; i++) {
        dxs[i] = points[i + 1].x - points[i].x
        dys[i] = points[i + 1].y - points[i].y
        ds[i] = dys[i] / dxs[i]
      }

      ms[0] = ds[0]
      ms[n - 1] = ds[n - 2];


      for (i = 1; i < n - 1; i++) {
        if (ds[i] === 0 || ds[i - 1] === 0 || (ds[i - 1] > 0) !== (ds[i] > 0)) {
          ms[i] = 0;
        } else {
          ms[i] = 3 * (dxs[i - 1] + dxs[i]) / (
            (2 * dxs[i] + dxs[i - 1]) / ds[i - 1] +
            (dxs[i] + 2 * dxs[i - 1]) / ds[i]);

          if (!isFinite(ms[i])) {
            ms[i] = 0;
          }
        }
      }

      for (i = 0; i < n - 1; i++) {
        this.context2d.bezierCurveTo(
          // First control point
          points[i].x + dxs[i] / 3,
          points[i].y + ms[i] * dxs[i] / 3,
          // Second control point
          points[i + 1].x - dxs[i] / 3,
          points[i + 1].y - ms[i + 1] * dxs[i] / 3,
          // End point
          points[i + 1].x,
          points[i + 1].y,
        );
      }
    }

    if (showArea && n > 1) {
      const firstPoint = points[0]
      const lastPoint = points[n - 1]
      this.context2d.lineTo(lastPoint.x, this.linearY.get(0))
      this.context2d.lineTo(firstPoint.x, this.linearY.get(0))
      this.context2d.closePath()
      this.context2d.fill()
    }

    this.context2d.stroke()

  }

  renderBar() {
    const { data, padding } = this.option
    const { height } = this.size

    const points: Array<Point> = data.map(({ y }: { y: number }, index: number) => {
      return {
        x: this.linearX.get(index),
        y: this.linearY.get(y)
      }
    })

    points.forEach((point: Point) => {
      this.context2d.fillRect(point.x - 5, point.y, 10, height - padding[2] - point.y)
    })

    this.context2d.stroke()
  }

  renderAxisX(): void {
    const { data, padding } = this.option
    const { width, height } = this.size
    const { context2d } = this

    context2d.moveTo(padding[3], height - padding[2])
    context2d.lineTo(width - padding[1], height - padding[2])

    let sparseSize: number = 1

    if (data.length > this.maxXTick) {
      sparseSize = Math.ceil(data.length / this.maxXTick)
    }

    data.forEach((item: { x: any; y: number }, index: number) => {
      const x = this.linearX.get(index)
      const y = height - padding[2]

      context2d.moveTo(x, y)
      context2d.lineTo(x, y + 10 + ((index === 0 || index === data.length - 1) ? 10 : 0))

      context2d.textAlign = 'center'
      context2d.font = '16px SimSun, Songti SC'

      if (sparseSize <= 1 || index % sparseSize === 0 || index === data.length - 1) {
        context2d.fillText(item.x, x, y + 30)
      }
    })

    context2d.stroke()
  }

  renderAxisY(): void {
    const { data, padding } = this.option
    const { width, height } = this.size
    const { context2d } = this

    context2d.moveTo(padding[3], height - padding[2])
    context2d.lineTo(padding[3], padding[0])

    const distance = this._domainY[1] - this._domainY[0]

    const yStep = distance / (this.maxYTick - 1)

    const x = padding[3]
    for (let i = this.maxYTick - 1; i >= 0; i--) {
      let _yVal: number  = yStep * i + this._domainY[0]
      let y = this.linearY.get(_yVal)
      let yVal = _yVal.toFixed(1)

      context2d.moveTo(x, y)
      context2d.lineTo(x - 10 - ((i === 0 || i === this.maxYTick - 1) ? 10 : 0), y)

      context2d.textAlign = 'end'
      context2d.font = '12px SimSun, Songti SC'

      context2d.fillText(yVal, x - 20, y + 5)
    }

    context2d.stroke()
  }

}

const data = []
for (var ii = 0; ii < 10; ii++) {
  data[ii] = {
    x: ii,
    y: Math.random() * 90
  }
}

console.log(data)

new Chart({
  contianer: '#line',
  // data: [{ x: 1, y: 20 }, { x: 2, y: 30 }, { x: 3, y: 50 }, { x: 4, y: 35 }, { x: 5, y: 35 }],
  padding: [20, 20, 50, 50],
  data,
  type: 'line'
})


new Chart({
  contianer: '#bar',
  // data: [{ x: 1, y: 20 }, { x: 2, y: 30 }, { x: 3, y: 50 }, { x: 4, y: 35 }, { x: 5, y: 35 }],
  padding: [20, 20, 50, 50],
  data,
  type: 'bar',
  axis: {
    x: {
      padding: {
        left: 50,
        right: 50
      }
    }
  }
})

new Chart({
  contianer: '#linearea',
  // data: [{ x: 1, y: 20 }, { x: 2, y: 30 }, { x: 3, y: 50 }, { x: 4, y: 35 }, { x: 5, y: 35 }],
  padding: [20, 20, 50, 50],
  data,
  type: 'line',
  showArea: true
})