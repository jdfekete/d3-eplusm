// Copied from d3-scale/src/continous.js

import { bisect } from 'd3-array';
import {
  interpolate as interpolateValue,
  interpolateNumber,
  interpolateRound,
} from 'd3-interpolate';

var unit = [0, 1];

function constant(x) {
  return function () {
    return x;
  };
}

function number(x) {
  return +x;
}

export function identity(x) {
  return x;
}

function normalize(a, b) {
  return (b -= a = +a)
    ? function (x) {
        return (x - a) / b;
      }
    : constant(isNaN(b) ? NaN : 0.5);
}

function clamper(a, b) {
  var t;
  if (a > b) (t = a), (a = b), (b = t);
  return function (x) {
    return Math.max(a, Math.min(b, x));
  };
}

// normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
// interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
function bimap(domain, range, interpolate) {
  var d0 = domain[0],
    d1 = domain[1],
    r0 = range[0],
    r1 = range[1];
  if (d1 < d0) (d0 = normalize(d1, d0)), (r0 = interpolate(r1, r0));
  else (d0 = normalize(d0, d1)), (r0 = interpolate(r0, r1));
  return function (x) {
    return r0(d0(x));
  };
}

function polymap(domain, range, interpolate) {
  var j = Math.min(domain.length, range.length) - 1,
    d = new Array(j),
    r = new Array(j),
    i = -1;

  // Reverse descending domains.
  if (domain[j] < domain[0]) {
    domain = domain.slice().reverse();
    range = range.slice().reverse();
  }

  while (++i < j) {
    d[i] = normalize(domain[i], domain[i + 1]);
    r[i] = interpolate(range[i], range[i + 1]);
  }

  return function (x) {
    var i = bisect(domain, x, 1, j) - 1;
    return r[i](d[i](x));
  };
}

export function copy(source, target) {
  return target
    .domain(source.domain())
    .range(source.range())
    .interpolate(source.interpolate())
    .clamp(source.clamp())
    .unknown(source.unknown());
}

export function initRange(domain, range) {
  switch (arguments.length) {
    case 0:
      break;
    case 1:
      this.range(domain);
      break;
    default:
      this.range(range).domain(domain);
      break;
  }
  return this;
}

export function nice(domain, interval) {
  domain = domain.slice();

  var i0 = 0,
    i1 = domain.length - 1,
    x0 = domain[i0],
    x1 = domain[i1],
    t;

  if (x1 < x0) {
    (t = i0), (i0 = i1), (i1 = t);
    (t = x0), (x0 = x1), (x1 = t);
  }

  domain[i0] = interval.floor(x0);
  domain[i1] = interval.ceil(x1);
  return domain;
}

export function transformer() {
  var domain = unit,
    range = unit,
    interpolate = interpolateValue,
    transform,
    untransform,
    unknown,
    clamp = identity,
    piecewise,
    output,
    input;

  function rescale() {
    var n = Math.min(domain.length, range.length);
    if (clamp !== identity) clamp = clamper(domain[0], domain[n - 1]);
    piecewise = n > 2 ? polymap : bimap;
    output = input = null;
    return scale;
  }

  function scale(x) {
    return x == null || isNaN((x = +x))
      ? unknown
      : (
          output ||
          (output = piecewise(domain.map(transform), range, interpolate))
        )(transform(clamp(x)));
  }

  scale.invert = function (y) {
    return clamp(
      untransform(
        (
          input ||
          (input = piecewise(range, domain.map(transform), interpolateNumber))
        )(y),
      ),
    );
  };

  scale.domain = function (_) {
    return arguments.length
      ? ((domain = Array.from(_, number)), rescale())
      : domain.slice();
  };

  scale.range = function (_) {
    return arguments.length
      ? ((range = Array.from(_)), rescale())
      : range.slice();
  };

  scale.rangeRound = function (_) {
    return (range = Array.from(_)), (interpolate = interpolateRound), rescale();
  };

  scale.clamp = function (_) {
    return arguments.length
      ? ((clamp = _ ? true : identity), rescale())
      : clamp !== identity;
  };

  scale.interpolate = function (_) {
    return arguments.length ? ((interpolate = _), rescale()) : interpolate;
  };

  scale.unknown = function (_) {
    return arguments.length ? ((unknown = _), scale) : unknown;
  };

  return function (t, u) {
    (transform = t), (untransform = u);
    return rescale();
  };
}
