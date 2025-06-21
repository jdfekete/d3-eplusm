import terser from "@rollup/plugin-terser";
import dsv from '@rollup/plugin-dsv';
import * as meta from "./package.json";

const config = {
  input: "src/index.js",
  external: Object.keys(meta.dependencies || {}).filter(key => /^d3-/.test(key)),
  output: {
    file: `dist/${meta.name}.js`,
    name: "d3-eplusm",
    format: "umd",
    indent: false,
    extend: true,
    banner: `// ${meta.homepage} v${meta.version}`,
    globals: Object.assign({}, ...Object.keys(meta.dependencies || {}).filter(key => /^d3-/.test(key)).map(key => ({[key]: "d3"})))
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
