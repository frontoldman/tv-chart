import { BaseLinear, domainValAry, rangeValAry } from '../types/index'
 
export default class Linear implements BaseLinear {
  private _domianVal: domainValAry = [0, 1]
  private _rangeVal: rangeValAry = [0, 1]

  private _rangeDistance: number = 0
  private _domainDistance: number = 0
  private _step: number = 0

  constructor() {

  }

  domain(domain: domainValAry): BaseLinear {
    this._domianVal = domain
    this._domainDistance = domain[1] - domain[0]
    if (this._domainDistance) {
      this.setStep()
    }
    return this
  }

  range(range: rangeValAry): BaseLinear  {
    this._rangeVal = range
    this._rangeDistance = range[1] - range[0]
    if (this._domainDistance) {
      this.setStep()
    }
    return this
  }

  /**
   * 获取domain对应的range值
   * @param domainVal 
   */
  get(domainVal: number): number {
    return this._rangeVal[0] + domainVal * this.getStep()
  }

  setStep() {
    this._step = this._rangeDistance / this._domainDistance
  }

  getStep(): number {
    return this._step
  }

  getAll() {
    
  }

  getRange(): rangeValAry {
    return this._rangeVal
  }

  getDomain(): domainValAry {
    return this._domianVal
  }

}