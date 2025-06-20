import { ticks } from 'd3-array';
import { format, formatSpecifier } from 'd3-format';
import nice from './nice.js';
import { copy, transformer } from './continuous.js';
import { initRange } from './init.js';

const tick_order = [1, 5, 7, 3, 9, 2, 6, 4, 8];

function pow10(x) {
  return isFinite(x) ? +('1e' + x) : x < 0 ? 0 : x;
}

function roundat(x, prec) {
  const decimals = pow10(prec);
  return Math.round((x + Number.EPSILON) * decimals) / decimals;
}

function transformEpluM(x) {
  if (x === 0) {
    //console.log(`transformEpluM(${x}) = 0`);
    return 0;
  }
  const exponent = Math.trunc(Math.log10(x)),
    mantissa = x / pow10(exponent);
  const eplusm = exponent + (mantissa - 1) / 9;
  //console.log(`transformEpluM(${x}) = ${eplusm}`);
  return eplusm;
}

function transformLin(x) {
  if (x === 0) return 0;
  const exponent = Math.trunc(x),
    mantissa = (x - exponent) * 9 + 1;
  const lin = roundat(mantissa * pow10(exponent), 5);
  //console.log(`transformLin(${x}) = ${lin}`);
  return lin;
}

function transformEpluMn(x) {
  return -transformEpluM(-x);
}

function transformLinn(x) {
  return -transformLin(-x);
}

function reflect(f) {
  return (x, k) => -f(-x, k);
}

export function eplusm(transform) {
  const scale = transform(transformEpluM, transformLin);
  const domain = scale.domain;
  let base = 10;
  let logs;
  let invs;
  let pows;

  function rescale() {
    (logs = transformEpluM), (pows = pow10), (invs = transformLin);
    if (domain()[0] < 0) {
      (logs = reflect(logs)), (pows = reflect(pows)), (invs = reflect(invs));
      transform(transformEpluMn, transformLinn);
    } else {
      transform(transformEpluM, transformLin);
    }
    return scale;
  }

  scale.base = function (_) {
    return arguments.length ? ((base = +_), rescale()) : base;
  };

  scale.domain = function (_) {
    return arguments.length ? (domain(_), rescale()) : domain();
  };

  scale.goodTicks = function (order) {
    const d = domain();
    let u = d[0];
    let v = d[d.length - 1];
    const r = v < u;

    if (r) [u, v] = [v, u];

    //let i = pow10(Math.floor(Math.log10(u)));
    let j = pow10(Math.floor(Math.log10(v)));

    let n =
      order == null
        ? [1, 5]
        : Number.isInteger(order)
          ? tick_order.slice(0, order)
          : order;
    let ticks = [];
    for (let k of n) {
      let i = pow10(Math.floor(Math.log10(u)));
      while (i <= j) {
        ticks.push(i * k);
        i *= 10;
      }
    }
    return ticks;
  };

  scale.ticks = (count) => {
    const d = domain();
    let u = d[0];
    let v = d[d.length - 1];
    const r = v < u;

    if (r) [u, v] = [v, u];

    let i = logs(u);
    let j = logs(v);
    let k;
    let t;
    const n = count == null ? 10 : +count;
    let z = [];

    if (!(base % 1) && j - i < n) {
      (i = Math.floor(i)), (j = Math.ceil(j));
      if (u > 0)
        for (; i <= j; ++i) {
          for (k = 1; k < base; ++k) {
            t = i < 0 ? k / pows(-i) : k * pows(i);
            if (t < u) continue;
            if (t > v) break;
            z.push(t);
          }
        }
      else
        for (; i <= j; ++i) {
          for (k = base - 1; k >= 1; --k) {
            t = i > 0 ? k / pows(-i) : k * pows(i);
            if (t < u) continue;
            if (t > v) break;
            z.push(t);
          }
        }
      if (z.length * 2 < n) z = ticks(u, v, n);
    } else {
      z = ticks(i, j, Math.min(j - i, n)).map(invs);
    }
    return r ? z.reverse() : z;
  };

  scale.tickFormat = (count, specifier) => {
    if (count == null) count = 10;
    if (specifier == null) specifier = base === 10 ? 's' : ',';
    if (typeof specifier !== 'function') {
      if (
        !(base % 1) &&
        (specifier = formatSpecifier(specifier)).precision == null
      )
        specifier.trim = true;
      specifier = format(specifier);
    }
    if (count === Infinity) return specifier;
    const k = Math.max(1, (base * count) / scale.ticks().length); // TODO fast estimate?
    const visible = new Set(tick_order.slice(0, k));
    return (d) => {
      let i = d / pows(Math.round(logs(d)));
      if (i * base < base - 0.5) i *= base;
      i = Math.trunc(i);
      return visible.has(i) ? specifier(d) : '';
    };
  };

  scale.nice = () => {
    return domain(
      nice(domain(), {
        floor: (x) => invs(Math.floor(logs(x))),
        ceil: (x) => invs(Math.ceil(logs(x))),
      }),
    );
  };

  return scale;
}

export default function d3_eplusm() {
  const scale = eplusm(transformer()).domain([0, 10]);
  scale.copy = () => copy(scale, d3_eplusm());
  initRange.apply(scale, arguments);
  return scale;
}
