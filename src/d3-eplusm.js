import {ticks} from "d3-array";
import {format, formatSpecifier} from "d3-format";
import {nice} from "./imported.js";
import {copy, transformer} from "./imported.js";
import {initRange} from "./imported.js";
// import nice from "./nice.js";
// import {copy, transformer} from "./continuous.js";
// import {initRange} from "./init.js";

const float = new Float64Array(1),
      bytes = new Uint8Array(float.buffer);

function decomposeEM(x) {
  float[0] = Number(x);

  const sign = bytes[7] >> 7,
        exponent = ((bytes[7] & 0x7f) << 4 | bytes[6] >> 4) - 0x3ff;

  bytes[7] = 0x3f;
  bytes[6] |= 0xf0;

  return {
    sign: sign,
    exponent: exponent,
    mantissa: float[0],
  }
}

function pow10(x) {
  return isFinite(x) ? +("1e" + x) : x < 0 ? 0 : x;
}

function transformEpluM(x) {
  const exponent = Math.floor(Math.log10(x));
  const mantissa = x - Math.exp10(exponent);
  return exponent + mantissa;
}

function transformLin(x) {
  exponent = Math.floor(x);
  mantissa = x - exponent;
  return mantissa + pow10(exponent);
}

function reflect(f) {
  return (x, k) => -f(-x, k);
}

export function eplusm(transform) {
  const scale = transform(transformEpluM, transformLin);
  const domain = scale.domain;
  let base = 10;
  let logs;
  let pows;

  function rescale() {
    logs = transformEpluM, pows = transformLin;
    if (domain()[0] < 0) {
      logs = reflect(logs), pows = reflect(pows);
      transform(transformLogn, transformExpn);
    } else {
      transform(transformLog, transformExp);
    }
    return scale;
  }

  scale.base = function() {
    return base;
  };

  scale.domain = function(_) {
    return arguments.length ? (domain(_), rescale()) : domain();
  };

  scale.ticks = count => {
    const d = domain();
    let u = d[0];
    let v = d[d.length - 1];
    const r = v < u;

    if (r) ([u, v] = [v, u]);

    let i = logs(u);
    let j = logs(v);
    let k;
    let t;
    const n = count == null ? 10 : +count;
    let z = [];

    if (!(base % 1) && j - i < n) {
      i = Math.floor(i), j = Math.ceil(j);
      if (u > 0) for (; i <= j; ++i) {
        for (k = 1; k < base; ++k) {
          t = i < 0 ? k / pows(-i) : k * pows(i);
          if (t < u) continue;
          if (t > v) break;
          z.push(t);
        }
      } else for (; i <= j; ++i) {
        for (k = base - 1; k >= 1; --k) {
          t = i > 0 ? k / pows(-i) : k * pows(i);
          if (t < u) continue;
          if (t > v) break;
          z.push(t);
        }
      }
      if (z.length * 2 < n) z = ticks(u, v, n);
    } else {
      z = ticks(i, j, Math.min(j - i, n)).map(pows);
    }
    return r ? z.reverse() : z;
  };

  scale.tickFormat = (count, specifier) => {
    if (count == null) count = 10;
    if (specifier == null) specifier = base === 10 ? "s" : ",";
    if (typeof specifier !== "function") {
      if (!(base % 1) && (specifier = formatSpecifier(specifier)).precision == null) specifier.trim = true;
      specifier = format(specifier);
    }
    if (count === Infinity) return specifier;
    const k = Math.max(1, base * count / scale.ticks().length); // TODO fast estimate?
    return d => {
      let i = d / pows(Math.round(logs(d)));
      if (i * base < base - 0.5) i *= base;
      return i <= k ? specifier(d) : "";
    };
  };

  scale.nice = () => {
    return domain(nice(domain(), {
      floor: x => pows(Math.floor(logs(x))),
      ceil: x => pows(Math.ceil(logs(x)))
    }));
  };

  return scale;
}

export default function d3_eplusm() {
  const scale = eplusm(transformer()).domain([1, 10]);
  scale.copy = () => copy(scale, d3_eplusm());
  initRange.apply(scale, arguments);
  return scale;
}
