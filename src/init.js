// https://d3js.org/d3-scale/ v4.0.2 Copyright 2010-2021 Mike Bostock
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

export function initInterpolator(domain, interpolator) {
  switch (arguments.length) {
    case 0:
      break;
    case 1: {
      if (typeof domain === 'function') this.interpolator(domain);
      else this.range(domain);
      break;
    }
    default: {
      this.domain(domain);
      if (typeof interpolator === 'function') this.interpolator(interpolator);
      else this.range(interpolator);
      break;
    }
  }
  return this;
}
