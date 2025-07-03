// Functions to show bricks


export default function bricks(brickColor, height) {
  let bricks = {};
  const missingUnitColor = "rgb(200, 200, 211)";
  const spacing = 3;
  const totalBricks = 10

 // Estimate brickHeight by computing the pixel height of one exponent range
  function getBrickHeight(y) {
    const intervalHeight = y(10 ** 0) - y(10 ** 1); // height of one exponent interval
    const totalSpacing = spacing * (totalBricks - 1);
    const brickHeight = (intervalHeight - totalSpacing) / totalBricks;
    return brickHeight;
  }

  function gapFromLastExponent(y) {
    return getBrickHeight(y)/2 + spacing;;
  } 

  bricks.start = function(v) {
    return 10**Math.trunc(Math.log10(v));
  }

  bricks.end = function(v) {
    return 10**Math.trunc(Math.log10(v)+1);
  }

  bricks.count = function(v) {
    const oom = Math.pow(10, Math.floor(Math.log10(v)));
    const mantissa = v / oom;                             
    let count = Math.round(mantissa);                    
    if (count > 9) {
      count = 1; // rollover to next exponent
    }
    console.log(count)
    return count;
  }

  bricks.exp = function(v) {
    return Math.floor(Math.log10(v));
  }

  bricks.barY = function(y, v) {
    return y(bricks.start(v)) + gapFromLastExponent(y);
  }

  bricks.barHeight = function(y, v) {
    return y(1) - y(bricks.start(v)) - gapFromLastExponent(y);
  }

  bricks.brickY = function(y, v) {
    const exp = Math.floor(Math.log10(v));
    const top = y(10 ** (exp + 1)) + getBrickHeight(y) / 2;
    const brickCount = bricks.count(v);
    return top - brickCount * (getBrickHeight(y) + spacing);
  }

  bricks.brickHeight = function(y, v) {
    return y(bricks.start(v)) - y(bricks.end(v)) + getBrickHeight(y);
  }

  bricks.pattern = function(v) {
    return `url(#bricks${bricks.count(v)})`
  }

  bricks.declarePatterns = function(svg, y, exp) {
    const defs = svg.append('defs');
    const brickHeight =  getBrickHeight(y);
    const intervalHeight = y(10 ** 0) - y(10 ** 1);

    for (let brick = 1; brick <= totalBricks; brick++) {
      const pattern = defs.append('pattern')
        .attr('id', `bricks${brick}`)
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', '100%')
        .attr('height', intervalHeight + brickHeight)  // exact height of one exponent range plus one brick height, half at the bottom of the lower exponent and half at the top of the top exponent
        .attr('patternTransform', `translate(0, ${y(10 ** (exp + 1)) + brickHeight / 2})`);

      for (let v = 0; v < totalBricks; v++) {
        const y = (totalBricks - 1 - v) * (brickHeight + spacing);
        pattern.append('rect')
          .attr('x', 0)
          .attr('y', y)
          .attr('width', '100%')
          .attr('height', brickHeight)
          .attr('fill', v < brick ? brickColor : missingUnitColor);
        }
      }
    };

  return bricks;
}
