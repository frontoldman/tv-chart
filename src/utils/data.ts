interface Fn{
  (args: any): number;
}

export function max(list: Array<any>, fn: Fn): number {
  const result: Array<number> = list.map(fn)
  return <number>Math.max.apply(null, result)
}

export function min(list: Array<any>, fn: Fn): number {
  const result: Array<number> = list.map(fn)
  return <number>Math.min.apply(null, result)
}

export default {
  min,
  max,
}