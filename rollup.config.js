import terser from "@rollup/plugin-terser";
import dsv from '@rollup/plugin-dsv';
import * as meta from "./package.json";

const config = {
  input: "src/index.js",
  output: {
    file: `dist/${meta.name}.js`,
    name: "d3-eplusm",
    format: "umd",
    indent: false,
    extend: true,
    banner: `// ${meta.homepage} v${meta.version}`
  },
  plugins: []
};

export default [
  config,
  {
    ...config,
    output: {
      ...config.output,
      file: `dist/${meta.name}.min.js`
    },
    plugins: [
      ...config.plugins,
      dsv(),
      terser({
        output: {
          preamble: config.output.banner
        }
      })
    ]
  }
];
