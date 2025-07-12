// Functions to show bricks

export default function bricks(brickColor) {
  let bricks = {};
  const missingUnitColor = 'rgb(200, 200, 211)';

  // Pattern viewBox settings
  const viewBoxSpace = 100;
  const spacing = 2;
  const totalBricks = 10;

  // Define visual proportions for bricks and gaps (in the pattern coordinate system)
  const brickTotalSpace = viewBoxSpace / totalBricks; //including both brick height and spacing between bricks
  const brickHeight = 0.7 * brickTotalSpace; // allocate a bit more space to the bricks (0.6) rather than the spacing between them (0.4)
  const brickGap = 0.3 * brickTotalSpace;

  // Estimate brick height in pixels using the y-scale
  function getBrickHeight(y) {
    const intervalHeight = y(10 ** 0) - y(10 ** 1); // height of one exponent interval
    const brickHeight = 0.7 * (intervalHeight / (totalBricks - 1)); // match visual design proportions
    return brickHeight;
  }

  // Compute vertical gap between bars and first brick row in pixels
  function gapFromLastExponent(y) {
    // the abstract bar has to end where the brick equal to the mantissa of 9 at the previous exponent ends
    // the gap is equal to half brick (because it is centered at the line of the exponent) plus one spacing
    const gap_in_viewbox = brickHeight / 2 + brickGap;
    // to calculate the actual y position we have to compute first the actual interval height
    const intervalHeight = y(10 ** 0) - y(10 ** 1);
    // the interval height in the viewbox we create for the pattern is equal with one interval
    // plus one brick, because the first and the last brick are centered in the middle of the line
    const intervalHeightInViewBox = viewBoxSpace - brickHeight;
    const real_gap =
      (gap_in_viewbox / intervalHeightInViewBox) * intervalHeight;
    return real_gap;
  }

  // Return the lower bound (start of exponent range) for a value
  bricks.start = function (v) {
    return 10 ** Math.trunc(Math.log10(v));
  };

  // Return the upper bound (end of exponent range)
  bricks.end = function (v) {
    return 10 ** Math.trunc(Math.log10(v) + 1);
  };

  // Count how many bricks to show (rounded mantissa)
  bricks.count = function (v) {
    const oom = Math.pow(10, Math.floor(Math.log10(v)));
    const mantissa = v / oom;
    let count = Math.round(mantissa);
    if (count > 9) {
      count = 1; // rollover to next exponent
    }
    return count;
  };

  // Position for the abstract bar
  bricks.barY = function (y, v) {
    return y(bricks.start(v)) + gapFromLastExponent(y);
  };

  // Height of the abstract bar
  bricks.barHeight = function (y, v) {
    return y(1) - y(bricks.start(v)) - gapFromLastExponent(y);
  };

  // Y-position of the top brick
  bricks.brickY = function (y, v) {
    return y(bricks.end(v)) - getBrickHeight(y) / 2;
  };

  // Total height of the brick pattern area
  bricks.brickHeight = function (y) {
    const intervalHeight = y(10 ** 0) - y(10 ** 1);
    return intervalHeight + getBrickHeight(y);
  };

  bricks.pattern = function (v) {
    return `url(#bricks${bricks.count(v)})`;
  };

  bricks.declarePatterns = function (svg) {
    const defs = svg.append('defs');
    for (let brick = 1; brick <= 10; brick++) {
      const pattern = defs
        .append('pattern')
        .attr('id', `bricks${brick}`)
        .attr('viewBox', `0,0,${viewBoxSpace},${viewBoxSpace}`)
        .attr('width', '100%')
        .attr('height', '100%');
      for (let v = 0; v < 10; v++) {
        pattern
          .append('rect')
          .attr('x', 0)
          .attr('y', viewBoxSpace - (totalBricks + spacing) * v)
          .attr('width', '100%')
          .attr('height', brickHeight)
          .attr('fill', v < brick ? brickColor : missingUnitColor);
      }
    }
  };

  return bricks;
}
