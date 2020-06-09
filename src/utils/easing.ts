export const jQueryEasing = {
  linear: function( p: number ) {
    return p;
  },
  swing: function( p: number ) {
    return 0.5 - Math.cos( p*Math.PI ) / 2;
  }
};