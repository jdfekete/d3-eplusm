// Functions to show bricks


export default function bricks(brickColor) {
  var bricks = {};

  bricks.start = function(v) {
    return 10**Math.trunc(Math.log10(v));
  }

  bricks.end = function(v) {
    return 10**Math.trunc(Math.log10(v)+1);
  }

  bricks.count = function(v) {
    const oom = bricks.start(v);
    return Math.floor((v - oom) / oom);
  }

  bricks.barY = function(y, v) {
    return y(bricks.start(v));
  }

  bricks.barHeight = function(y, v) {
    return y(1) - y(bricks.start(v));
  }

  bricks.brickY = function(y, v) {
    return y(bricks.end(v));
  }

  bricks.brickHeight = function(y, v) {
    return y(bricks.start(v)) - y(bricks.end(v));
  }

  bricks.pattern = function(v) {
    return `url(#bricks${bricks.count(v)})`
  }

  bricks.declarePatterns = function(svg) {
    const defs = svg.append('defs');
    for (let brick = 1; brick < 10; brick++) {
      const pattern = defs.append('pattern')
            .attr('id', `bricks${brick}`)
            .attr('viewBox', '0,0,100,100')
            .attr('width', '100%')
            .attr('height', '100%');
      for (let v = 1; v < 10; v++) {
        pattern.append('rect')
          .attr('x', 0)
          .attr('y', 103-12*v)
          .attr('width', '100%')
          .attr('height', '5')
          .attr('fill', v <= brick ? brickColor : 'Grey');
      }
    }
  }

  return bricks;
}
