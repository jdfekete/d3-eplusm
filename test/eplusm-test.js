/* eslint-env mocha */

import assert from 'assert';
import { interpolate } from 'd3-interpolate';
// import { format } from 'd3-format';
import { scaleEplusM } from '../src/index.js';
import { assertInDelta } from './asserts.js';

it('scaleEplusM() has the expected defaults', () => {
  const x = scaleEplusM();
  assert.deepStrictEqual(x.domain(), [0, 10]);
  assert.deepStrictEqual(x.range(), [0, 1]);
  assert.strictEqual(x.clamp(), false);
  assert.strictEqual(x.base(), 10);
  assert.strictEqual(x.interpolate(), interpolate);
  assert.deepStrictEqual(
    x.interpolate()({ array: ['red'] }, { array: ['blue'] })(0.5),
    { array: ['rgb(128, 0, 128)'] },
  );
  assertInDelta(x(5), 0.4444, 1e-3);
  assertInDelta(x.invert(0.4444), 5, 1e-3);
  assertInDelta(x(15), 1.0555, 1e-3);
  assertInDelta(x.invert(1.05555555), 15, 1e-3);
});

it('eplusm.domain(…) can take negative values', () => {
  const x = scaleEplusM().domain([-100, -1]);
  assert.deepStrictEqual(x.ticks().map(x.tickFormat(Infinity)), [
    '−100',
    '−90',
    '−80',
    '−70',
    '−60',
    '−50',
    '−40',
    '−30',
    '−20',
    '−10',
    '−9',
    '−8',
    '−7',
    '−6',
    '−5',
    '−4',
    '−3',
    '−2',
    '−1',
  ]);
  assertInDelta(x(-50), 0.277777, 1e-3);
});

it('eplusm.domain(…) preserves specified domain exactly, with no floating point error', () => {
  const x = scaleEplusM().domain([0.1, 1000]);
  assert.deepStrictEqual(x.domain(), [0.1, 1000]);
});

it('eplusm.ticks(…) returns exact ticks, with no floating point error', () => {
  assert.deepStrictEqual(
    scaleEplusM().domain([0.15, 0.68]).ticks(),
    [0.2, 0.3, 0.4, 0.5, 0.6],
  );
  assert.deepStrictEqual(
    scaleEplusM().domain([0.68, 0.15]).ticks(),
    [0.6, 0.5, 0.4, 0.3, 0.2],
  );
  assert.deepStrictEqual(
    scaleEplusM().domain([-0.15, -0.68]).ticks(),
    [-0.2, -0.3, -0.4, -0.5, -0.6],
  );
  assert.deepStrictEqual(
    scaleEplusM().domain([-0.68, -0.15]).ticks(),
    [-0.6, -0.5, -0.4, -0.3, -0.2],
  );
});

it('eplusm.range(…) does not coerce values to numbers', () => {
  const x = scaleEplusM().range(['0', '2']);
  assert.strictEqual(typeof x.range()[0], 'string');
  assert.strictEqual(typeof x.range()[1], 'string');
});

it('eplusm(x) does not clamp by default', () => {
  const x = scaleEplusM();
  assert.strictEqual(x.clamp(), false);
  assertInDelta(x(0.5), -0.055555, 1e-5);
  assertInDelta(x(15), 1.055555, 1e-3);
});

it('eplusm.clamp(true)(x) clamps to the domain', () => {
  const x = scaleEplusM().clamp(true);
  assertInDelta(x(-1), 0);
  assertInDelta(x(5), 0.44444, 1e-3);
  assertInDelta(x(15), 1, 1e-3);
  x.domain([10, 1]);
  assertInDelta(x(-1), 1);
  assertInDelta(x(5), 0.55555, 1e-3);
  assertInDelta(x(15), 0);
});

it('eplusm.clamp(true).invert(y) clamps to the range', () => {
  const x = scaleEplusM().clamp(true);
  assertInDelta(x.invert(-0.1), 0.1);
  assertInDelta(x.invert(0.555555), 6);
  assertInDelta(x.invert(1.5), 10);
  x.domain([10, 1]);
  assertInDelta(x.invert(-0.1), 10);
  assertInDelta(x.invert(0.55555555), 5);
  assertInDelta(x.invert(1.5), 1);
});

it('eplusm(x) maps a number x to a number y', () => {
  const x = scaleEplusM().domain([1, 2]);
  assertInDelta(x(1.0), 0.0);
  assertInDelta(x(1.5), 0.5);
  assertInDelta(x(2.0), 1.0);
  assertInDelta(x(2.5), 1.5);
});

it('eplusm.invert(y) maps a number y to a number x', () => {
  const x = scaleEplusM().domain([1, 2]);
  assertInDelta(x.invert(0.0), 1.0);
  assertInDelta(x.invert(0.5), 1.5);
  assertInDelta(x.invert(1.0), 2.0);
  assertInDelta(x.invert(1.5), 2.5);
});

it('eplusm.nice() nices the domain, extending it to powers of ten', () => {
  const x = scaleEplusM().domain([1.1, 10.9]).nice();
  assert.deepStrictEqual(x.domain(), [1, 100]);
  x.domain([10.9, 1.1]).nice();
  assert.deepStrictEqual(x.domain(), [100, 1]);
  x.domain([0.7, 11.001]).nice();
  assert.deepStrictEqual(x.domain(), [0.1, 100]);
  x.domain([123.1, 6.7]).nice();
  assert.deepStrictEqual(x.domain(), [1000, 1]);
  x.domain([0.01, 0.49]).nice();
  assert.deepStrictEqual(x.domain(), [0.01, 1]);
  x.domain([1.5, 50]).nice();
  assert.deepStrictEqual(x.domain(), [1, 100]);
  assertInDelta(x(1), 0);
  assertInDelta(x(100), 1);
});

it('eplusm.copy() isolates changes to the domain', () => {
  const x = scaleEplusM(),
    y = x.copy();
  x.domain([10, 100]);
  assert.deepStrictEqual(y.domain(), [0, 10]);
  assertInDelta(x(10), 0);
  assertInDelta(y(1), 0);
  y.domain([100, 1000]);
  assertInDelta(x(100), 1);
  assertInDelta(y(100), 0);
  assert.deepStrictEqual(x.domain(), [10, 100]);
  assert.deepStrictEqual(y.domain(), [100, 1000]);
});

it('eplusm.copy() isolates changes to the domain via nice', () => {
  const x = scaleEplusM().domain([1.5, 50]),
    y = x.copy().nice();
  assert.deepStrictEqual(x.domain(), [1.5, 50]);
  assertInDelta(x(1.5), 0);
  assertInDelta(x(50), 1);
  assertInDelta(x.invert(0), 1.5);
  assertInDelta(x.invert(1), 50);
  assert.deepStrictEqual(y.domain(), [1, 100]);
  assertInDelta(y(1), 0);
  assertInDelta(y(100), 1);
  assertInDelta(y.invert(0), 1);
  assertInDelta(y.invert(1), 100);
});

it('eplusm.copy() isolates changes to the range', () => {
  const x = scaleEplusM(),
    y = x.copy();
  x.range([1, 2]);
  assertInDelta(x.invert(1), 1);
  assertInDelta(y.invert(1), 10);
  assert.deepStrictEqual(y.range(), [0, 1]);
  y.range([2, 3]);
  assertInDelta(x.invert(2), 10);
  assertInDelta(y.invert(2), 1);
  assert.deepStrictEqual(x.range(), [1, 2]);
  assert.deepStrictEqual(y.range(), [2, 3]);
});

/*
it('eplusm.copy() isolates changes to clamping', () => {
  const x = scaleEplusM().clamp(true),
    y = x.copy();
  x.clamp(false);
  assertInDelta(x(0.5), -0.30103);
  assertInDelta(y(0.5), 0);
  assert.strictEqual(y.clamp(), true);
  y.clamp(false);
  assertInDelta(x(20), 1.30103);
  assertInDelta(y(20), 1.30103);
  assert.strictEqual(x.clamp(), false);
});

it('eplusm.ticks() generates the expected power-of-ten for ascending ticks', () => {
  const s = scaleEplusM();
  assert.deepStrictEqual(
    s.domain([1e-1, 1e1]).ticks().map(round),
    [
      0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 2, 3, 4, 5, 6, 7, 8, 9,
      10,
    ],
  );
  assert.deepStrictEqual(
    s.domain([1e-1, 1]).ticks().map(round),
    [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
  );
  assert.deepStrictEqual(
    s.domain([-1, -1e-1]).ticks().map(round),
    [-1, -0.9, -0.8, -0.7, -0.6, -0.5, -0.4, -0.3, -0.2, -0.1],
  );
});

it('eplusm.ticks() generates the expected power-of-ten ticks for descending domains', () => {
  const s = scaleEplusM();
  assert.deepStrictEqual(
    s.domain([-1e-1, -1e1]).ticks().map(round),
    [
      -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -0.9, -0.8, -0.7, -0.6, -0.5,
      -0.4, -0.3, -0.2, -0.1,
    ].reverse(),
  );
  assert.deepStrictEqual(
    s.domain([-1e-1, -1]).ticks().map(round),
    [-1, -0.9, -0.8, -0.7, -0.6, -0.5, -0.4, -0.3, -0.2, -0.1].reverse(),
  );
  assert.deepStrictEqual(
    s.domain([1, 1e-1]).ticks().map(round),
    [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].reverse(),
  );
});

it('eplusm.ticks() generates the expected power-of-ten ticks for small domains', () => {
  const s = scaleEplusM();
  assert.deepStrictEqual(s.domain([1, 5]).ticks(), [1, 2, 3, 4, 5]);
  assert.deepStrictEqual(s.domain([5, 1]).ticks(), [5, 4, 3, 2, 1]);
  assert.deepStrictEqual(s.domain([-1, -5]).ticks(), [-1, -2, -3, -4, -5]);
  assert.deepStrictEqual(s.domain([-5, -1]).ticks(), [-5, -4, -3, -2, -1]);
  assert.deepStrictEqual(s.domain([286.9252014, 329.4978332]).ticks(1), [300]);
  assert.deepStrictEqual(s.domain([286.9252014, 329.4978332]).ticks(2), [300]);
  assert.deepStrictEqual(
    s.domain([286.9252014, 329.4978332]).ticks(3),
    [300, 320],
  );
  assert.deepStrictEqual(
    s.domain([286.9252014, 329.4978332]).ticks(4),
    [290, 300, 310, 320],
  );
  assert.deepStrictEqual(
    s.domain([286.9252014, 329.4978332]).ticks(),
    [290, 295, 300, 305, 310, 315, 320, 325],
  );
});

it('eplusm.ticks() generates linear ticks when the domain extent is small', () => {
  const s = scaleEplusM();
  assert.deepStrictEqual(
    s.domain([41, 42]).ticks(),
    [41, 41.1, 41.2, 41.3, 41.4, 41.5, 41.6, 41.7, 41.8, 41.9, 42],
  );
  assert.deepStrictEqual(
    s.domain([42, 41]).ticks(),
    [42, 41.9, 41.8, 41.7, 41.6, 41.5, 41.4, 41.3, 41.2, 41.1, 41],
  );
  assert.deepStrictEqual(
    s.domain([1600, 1400]).ticks(),
    [1600, 1580, 1560, 1540, 1520, 1500, 1480, 1460, 1440, 1420, 1400],
  );
});

it('eplusm.base(base).ticks() generates the expected power-of-base ticks', () => {
  const s = scaleEplusM().base(Math.E);
  assert.deepStrictEqual(
    s.domain([0.1, 100]).ticks().map(round),
    [
      0.135335283237, 0.367879441171, 1, 2.718281828459, 7.389056098931,
      20.085536923188, 54.598150033144,
    ],
  );
});

it('eplusm.tickFormat() is equivalent to log.tickFormat(10)', () => {
  const s = scaleEplusM();
  assert.deepStrictEqual(s.domain([1e-1, 1e1]).ticks().map(s.tickFormat()), [
    '100m',
    '200m',
    '300m',
    '400m',
    '500m',
    '',
    '',
    '',
    '',
    '1',
    '2',
    '3',
    '4',
    '5',
    '',
    '',
    '',
    '',
    '10',
  ]);
});

it('eplusm.tickFormat(count) returns a filtered "s" format', () => {
  const s = scaleEplusM(),
    t = s.domain([1e-1, 1e1]).ticks();
  assert.deepStrictEqual(t.map(s.tickFormat(10)), [
    '100m',
    '200m',
    '300m',
    '400m',
    '500m',
    '',
    '',
    '',
    '',
    '1',
    '2',
    '3',
    '4',
    '5',
    '',
    '',
    '',
    '',
    '10',
  ]);
  assert.deepStrictEqual(t.map(s.tickFormat(5)), [
    '100m',
    '200m',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '1',
    '2',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '10',
  ]);
  assert.deepStrictEqual(t.map(s.tickFormat(1)), [
    '100m',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '1',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '10',
  ]);
  assert.deepStrictEqual(t.map(s.tickFormat(0)), [
    '100m',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '1',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '10',
  ]);
});

it('eplusm.tickFormat(count, format) returns the specified format, filtered', () => {
  const s = scaleEplusM(),
    t = s.domain([1e-1, 1e1]).ticks();
  assert.deepStrictEqual(t.map(s.tickFormat(10, '+')), [
    '+0.1',
    '+0.2',
    '+0.3',
    '+0.4',
    '+0.5',
    '',
    '',
    '',
    '',
    '+1',
    '+2',
    '+3',
    '+4',
    '+5',
    '',
    '',
    '',
    '',
    '+10',
  ]);
});

it('eplusm.base(base).tickFormat() returns the "," format', () => {
  const s = scaleEplusM().base(Math.E);
  assert.deepStrictEqual(s.domain([1e-1, 1e1]).ticks().map(s.tickFormat()), [
    '0.135335283237',
    '0.367879441171',
    '1',
    '2.71828182846',
    '7.38905609893',
  ]);
});

it('eplusm.base(base).tickFormat(count) returns a filtered "," format', () => {
  const s = scaleEplusM().base(16),
    t = s.domain([1e-1, 1e1]).ticks();
  assert.deepStrictEqual(t.map(s.tickFormat(10)), [
    '0.125',
    '0.1875',
    '0.25',
    '0.3125',
    '0.375',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '',
    '',
    '',
    '',
  ]);
  assert.deepStrictEqual(t.map(s.tickFormat(5)), [
    '0.125',
    '0.1875',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '1',
    '2',
    '3',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ]);
  assert.deepStrictEqual(t.map(s.tickFormat(1)), [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '1',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ]);
});

it('eplusm.ticks() generates log ticks', () => {
  const x = scaleEplusM();
  assert.deepStrictEqual(x.ticks().map(x.tickFormat(Infinity)), [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
  ]);
  x.domain([100, 1]);
  assert.deepStrictEqual(x.ticks().map(x.tickFormat(Infinity)), [
    '100',
    '90',
    '80',
    '70',
    '60',
    '50',
    '40',
    '30',
    '20',
    '10',
    '9',
    '8',
    '7',
    '6',
    '5',
    '4',
    '3',
    '2',
    '1',
  ]);
  x.domain([0.49999, 0.006029505943610648]);
  assert.deepStrictEqual(x.ticks().map(x.tickFormat(Infinity)), [
    '400m',
    '300m',
    '200m',
    '100m',
    '90m',
    '80m',
    '70m',
    '60m',
    '50m',
    '40m',
    '30m',
    '20m',
    '10m',
    '9m',
    '8m',
    '7m',
  ]);
  x.domain([0.95, 1.05e8]);
  assert.deepStrictEqual(x.ticks().map(x.tickFormat(8)).filter(String), [
    '1',
    '10',
    '100',
    '1k',
    '10k',
    '100k',
    '1M',
    '10M',
    '100M',
  ]);
});

it('eplusm.tickFormat(count) filters ticks to about count', () => {
  const x = scaleEplusM();
  assert.deepStrictEqual(x.ticks().map(x.tickFormat(5)), [
    '1',
    '2',
    '3',
    '4',
    '5',
    '',
    '',
    '',
    '',
    '10',
  ]);
  x.domain([100, 1]);
  assert.deepStrictEqual(x.ticks().map(x.tickFormat(10)), [
    '100',
    '',
    '',
    '',
    '',
    '50',
    '40',
    '30',
    '20',
    '10',
    '',
    '',
    '',
    '',
    '5',
    '4',
    '3',
    '2',
    '1',
  ]);
});

it('eplusm.ticks(count) filters powers-of-ten ticks for huge domains', () => {
  const x = scaleEplusM().domain([1e10, 1]);
  assert.deepStrictEqual(x.ticks().map(x.tickFormat()), [
    '10G',
    '1G',
    '100M',
    '10M',
    '1M',
    '100k',
    '10k',
    '1k',
    '100',
    '10',
    '1',
  ]);
  x.domain([1e-29, 1e-1]);
  assert.deepStrictEqual(x.ticks().map(x.tickFormat()), [
    '0.0001y',
    '0.01y',
    '1y',
    '100y',
    '10z',
    '1a',
    '100a',
    '10f',
    '1p',
    '100p',
    '10n',
    '1µ',
    '100µ',
    '10m',
  ]);
});

it('eplusm.ticks() generates ticks that cover the domain', () => {
  const x = scaleEplusM().domain([0.01, 10000]);
  assert.deepStrictEqual(x.ticks(20).map(x.tickFormat(20)), [
    '10m',
    '20m',
    '30m',
    '',
    '',
    '',
    '',
    '',
    '',
    '100m',
    '200m',
    '300m',
    '',
    '',
    '',
    '',
    '',
    '',
    '1',
    '2',
    '3',
    '',
    '',
    '',
    '',
    '',
    '',
    '10',
    '20',
    '30',
    '',
    '',
    '',
    '',
    '',
    '',
    '100',
    '200',
    '300',
    '',
    '',
    '',
    '',
    '',
    '',
    '1k',
    '2k',
    '3k',
    '',
    '',
    '',
    '',
    '',
    '',
    '10k',
  ]);
});

it('eplusm.ticks() generates ticks that cover the niced domain', () => {
  const x = scaleEplusM().domain([0.0124123, 1230.4]).nice();
  assert.deepStrictEqual(x.ticks(20).map(x.tickFormat(20)), [
    '10m',
    '20m',
    '30m',
    '',
    '',
    '',
    '',
    '',
    '',
    '100m',
    '200m',
    '300m',
    '',
    '',
    '',
    '',
    '',
    '',
    '1',
    '2',
    '3',
    '',
    '',
    '',
    '',
    '',
    '',
    '10',
    '20',
    '30',
    '',
    '',
    '',
    '',
    '',
    '',
    '100',
    '200',
    '300',
    '',
    '',
    '',
    '',
    '',
    '',
    '1k',
    '2k',
    '3k',
    '',
    '',
    '',
    '',
    '',
    '',
    '10k',
  ]);
});

it('eplusm.tickFormat(count, format) returns a filtered format', () => {
  const x = scaleEplusM().domain([1000.1, 1]);
  assert.deepStrictEqual(x.ticks().map(x.tickFormat(10, format('+,d'))), [
    '+1,000',
    '',
    '',
    '',
    '',
    '',
    '',
    '+300',
    '+200',
    '+100',
    '',
    '',
    '',
    '',
    '',
    '',
    '+30',
    '+20',
    '+10',
    '',
    '',
    '',
    '',
    '',
    '',
    '+3',
    '+2',
    '+1',
  ]);
});

it('eplusm.tickFormat(count, specifier) returns a filtered format', () => {
  const x = scaleEplusM().domain([1000.1, 1]);
  assert.deepStrictEqual(x.ticks().map(x.tickFormat(10, 's')), [
    '1k',
    '',
    '',
    '',
    '',
    '',
    '',
    '300',
    '200',
    '100',
    '',
    '',
    '',
    '',
    '',
    '',
    '30',
    '20',
    '10',
    '',
    '',
    '',
    '',
    '',
    '',
    '3',
    '2',
    '1',
  ]);
});

it('eplusm.tickFormat(count, specifier) trims trailing zeroes by default', () => {
  const x = scaleEplusM().domain([100.1, 0.02]);
  assert.deepStrictEqual(x.ticks().map(x.tickFormat(10, 'f')), [
    '100',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '20',
    '10',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '2',
    '1',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '0.2',
    '0.1',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '0.02',
  ]);
});

it('eplusm.tickFormat(count, specifier) with base two trims trailing zeroes by default', () => {
  const x = scaleEplusM().base(2).domain([100.1, 0.02]);
  assert.deepStrictEqual(x.ticks().map(x.tickFormat(10, 'f')), [
    '64',
    '32',
    '16',
    '8',
    '4',
    '2',
    '1',
    '0.5',
    '0.25',
    '0.125',
    '0.0625',
    '0.03125',
  ]);
});

it('eplusm.tickFormat(count, specifier) preserves trailing zeroes if needed', () => {
  const x = scaleEplusM().domain([100.1, 0.02]);
  assert.deepStrictEqual(x.ticks().map(x.tickFormat(10, '.1f')), [
    '100.0',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '20.0',
    '10.0',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '2.0',
    '1.0',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '0.2',
    '0.1',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '0.0',
  ]);
});

it('eplusm.ticks() returns the empty array when the domain is degenerate', () => {
  const x = scaleEplusM();
  assert.deepStrictEqual(x.domain([0, 1]).ticks(), []);
  assert.deepStrictEqual(x.domain([1, 0]).ticks(), []);
  assert.deepStrictEqual(x.domain([0, -1]).ticks(), []);
  assert.deepStrictEqual(x.domain([-1, 0]).ticks(), []);
  assert.deepStrictEqual(x.domain([-1, 1]).ticks(), []);
  assert.deepStrictEqual(x.domain([0, 0]).ticks(), []);
});

function round(x) {
  return Math.round(x * 1e12) / 1e12;
}
*/
