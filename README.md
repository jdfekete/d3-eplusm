# Implementation of the EpluM scale for d3.

D3 provides several scales in [d3-scale](https://github.com/d3/d3-scale): quantitative, ordered, and categorical. EplusM is a quantitative scale, a good alternative to the logarithmic scale for values with orders of magnitude varying widely.

See this publication for details: 
Katerina Batziakoudi, Florent Cabric, Stéphanie Rey, and Jean-Daniel Fekete. 2025. Lost in Magnitudes: Exploring Visualization Designs for Large Value Ranges. In Proceedings of the 2025 CHI Conference on Human Factors in Computing Systems (CHI '25). Association for Computing Machinery, New York, NY, USA, Article 1170, 1–18. https://doi.org/10.1145/3706598.3713487

## Using d3-eplusm

In JavaScript development, you can add the library in your `package.json` file with the following command:
```
npm i d3-eplusm
```

## API

Like all the quantitative scales of d3, d3-eplusm can be used like this:
```
const x1 = scaleEplusM()
    .domain([1, 1e10])
    .range([marginLeft, width - marginRight]);
```

It provides the usual methods, such as `ticks()` and `nice()`.
In addition, you can also specify the number of tick values you want using the `goodTicks()` method.
It takes either a number of tick labels to show, between 1 and 9, or an array of tick units to show, such as `goodTicks([1, 5])` (equivalent to `goodTicks(2)` or simply `goodTicks`
