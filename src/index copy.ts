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

    console.log(this.size)

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

    // this.context2d.moveTo(0, 100)

    // this.context2d.lineTo(200, 160)

    // 线条颜色 
    // this.context2d.strokeStyle = 'red';
    // 线条粗细
    // this.context2d.lineWidth = 10;

    console.log(points)

    // context.beginPath();
    // this.context2d.moveTo(50, 20);
    // this.context2d.bezierCurveTo(100, 100, 200, 40, 250, 120);

    let quadraticPoints: Array<Array<number>> = []
    let gapBefore: number = 0
    let stepY: number = 50

    points.forEach((point: Point, index: number) => {
      let pointCenterX1 = 0
      let pointCenterY1 = 0

      let pointCenterX2 = 0
      let pointCenterY2 = 0
      let gap = 0

      // 从第二个点开始绘制
      if (index > 0) {
        let pointBefore: Point = points[index - 1]
        pointCenterX1 = xStep / 3 + pointBefore.x
        pointCenterX2 = xStep / 3 * 2 + pointBefore.x
        gap = (point.y - pointBefore.y) / 3
        pointCenterY1 = Math.abs(gap + pointBefore.y)
        pointCenterY2 = Math.abs(gap * 2 + pointBefore.y)

        let isAdd = 0
        let quadraticPointBefore = quadraticPoints[quadraticPoints.length - 1]

        if (gapBefore !== 0) {
          if (gap > 0) {
            if (gapBefore > 0) {
              quadraticPointBefore[3] += stepY
              pointCenterY1 += stepY
              isAdd = 1
            } else if (gapBefore < 0) {
              quadraticPointBefore[3] -= stepY
              pointCenterY1 -= stepY
              isAdd = -1
            }
          } else if (gap < 0) {
            quadraticPointBefore[3] += stepY
            pointCenterY1 += stepY
            isAdd = 1
          }

          // 第一条线的控制点
          if (index === 2) {
            if (isAdd > 0) {
              console.log(222)
              quadraticPointBefore[1] += stepY
            } else if (isAdd < 0) {
              console.log(333)
              quadraticPointBefore[1] -= stepY
            }
          }
        }


        

        // if (gapBefore === 0) {
        //   if (gap < 0) {
        //     pointCenterY = pointCenterY - stepY
        //   } else if (gap > 0) {
        //     pointCenterY = pointCenterY + stepY
        //   }
        // } else if (gapBefore * gap > 0) {
        //   if (gap < 0) {
        //     pointCenterY = pointCenterY + stepY
        //   } else if (gap > 0) {
        //     pointCenterY = pointCenterY - stepY
        //   }
        // } else if (gapBefore * gap < 0) {
        //   if (gap < 0) {
        //     pointCenterY = pointCenterY - stepY
        //   } else if (gap > 0) {
        //     pointCenterY = pointCenterY - stepY
        //   }
        // }

        gapBefore = gap

        // this.context2d.lineTo(point.x, point.y)

        // this.context2d.quadraticCurveTo(pointCenterX, pointCenterY, point.x, point.y)
        quadraticPoints.push([pointCenterX1, pointCenterY1, pointCenterX2, pointCenterY2, point.x, point.y])
      }
    })

    quadraticPoints.forEach(quadraticPoint => {
      this.context2d.bezierCurveTo(
        quadraticPoint[0], quadraticPoint[1], quadraticPoint[2], quadraticPoint[3], quadraticPoint[4], quadraticPoint[5]
      )
    })

    quadraticPoints.forEach(quadraticPoint => {
      this.context2d.rect(quadraticPoint[0], quadraticPoint[1], 5, 5)
      this.context2d.rect(quadraticPoint[2], quadraticPoint[3], 5, 5)
    })

    this.context2d.stroke()

  }

}



new Chart({
  contianer: '#line',
  data: [{ x: 1, y: 20 }, { x: 2, y: 30 }, { x: 3, y: 50 }, { x: 4, y: 35 }, { x: 4, y: 35 }],
  // data: [{x:1, y: 20}, {x:2, y: 30}, {x: 3, y: 50}],
})
