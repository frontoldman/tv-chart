import { BaseChart, chartOption, chartSize } from './types/index'
import { getOffset, queryDom, createDom, setStyle, setAttr } from './utils/dom'
import { isString } from './utils/index'
import { max } from './utils/data'

class Chart {
  private option: chartOption

  private size: chartSize

  private contianerDom: HTMLElement

  private canvasDom: HTMLCanvasElement

  private context2d: CanvasRenderingContext2D

  constructor(option: chartOption) {
    this.initOption(option)
    this.initContainer()
    this.createCanvas()

    this.renderLine()
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

  rotationAxis() {
    this.context2d
  }

  renderLine() {
    interface Point {
      x: number,
      y: number
    }

    const { data } = this.option
    const { height, width } = this.size


    const maxY: number = max(data, item => item.y)

    const yStep = (height - 100) / maxY
    const xStep = width / (data.length - 1)

    const points: Array<Point> = data.map((item: { y: number }, index: number) => {
      return {
        x: index * xStep,
        y: height - item.y * yStep,
      }
    })

    this.context2d.beginPath()
    this.context2d.moveTo(points[0].x, points[0].y)
    if (points.length === 1) {
      this.context2d.lineTo(points[0].x, points[0].y)
    } else if (points.length === 2) {
      this.context2d.lineTo(points[1].x, points[1].y)
    } else {
      const ds = [] // 两点之间的距离y / x 比例
      const dxs = [] // 两点之间的x距离
      const dys = [] // 两点之间的y距离
      const ms = []
      const n = points.length

      for (let i = 0; i < n - 1; i++) {
        dxs[i] = points[i + 1].x - points[i].x
        dys[i] = points[i + 1].y - points[i].y
        ds[i] = dys[i] / dxs[i]
      }

      ms[0] = ds[0]
      ms[n - 1] = ds[n - 2];


      for (let i = 1; i < n - 1; i++) {
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

      for (let i = 0; i < n - 1; i++) {
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

    this.context2d.stroke()

  }

}



new Chart({
  contianer: '#line',
  // data: [{ x: 1, y: 20 }, { x: 2, y: 30 }, { x: 3, y: 50 }, { x: 4, y: 35 }, { x: 4, y: 35 }],
  data: [{x:1, y: 20}, {x:2, y: 30}],
})
