"use strict";

const path = require("path");
const minimist = require("minimist");
const gulp = require("gulp");
const gulpClean = require("gulp-clean");
const gulpUglify = require("gulp-uglify");
const rollup = require("rollup");
const alias = require("@rollup/plugin-alias");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const replace = require("@rollup/plugin-replace");
const typescript = require("@rollup/plugin-typescript");

const cleanDist = () => {
  return gulp.src("dist", { allowEmpty: true }).pipe(gulpClean());
};

const checkArgv = () => {
  const args = [
    "platform",
    "domain",
    "app_id",
    "app_key",
    "xor_key",
    "token_key",
    "slogan",
    "share_img_url",
  ];
  const argv = minimist(process.argv.slice(2));

  let flag = false;
  const ret = {};
  args.some((arg) => {
    if (!argv[arg]) {
      flag = true;
      console.log(`Missing --${arg}`);
      return true;
    }
    ret[`__${arg}__`] = argv[arg];
    return false;
  });
  if (flag) return Promise.resolve(false);

  return Promise.resolve(ret);
};

const generateSdk = async () => {
  const replaces = await checkArgv();
  if (!replaces) {
    process.exit();
  }

  return rollup
    .rollup({
      input: "./src/main.ts",
      treeshake: true,
      plugins: [
        alias({
          entries: [
            {
              find: "@",
              replacement: path.resolve(__dirname, "./src"),
            },
          ],
          customResolver: nodeResolve({
            extensions: [".ts"],
          }),
        }),
        replace({
          preventAssignment: true,
          ...replaces,
        }),
        typescript({
          tsconfig: "./tsconfig.json",
        }),
      ],
    })
    .then((bundle) => {
      const writePromises = [];
      const moduleTypes = ["esm"];

      moduleTypes.map((moduleType) => {
        writePromises.push(
          bundle.write({
            file: "./dist/my-sdk.js",
            format: moduleType,
            name: "my-sdk",
            sourcemap: false,
          })
        );
      });

      return Promise.all(writePromises);
    })
    .catch((err) => {
      console.log(err);
    });
};

const uglifyJs = () => {
  return gulp.src("./dist/*.js").pipe(gulpUglify()).pipe(gulp.dest("./dist/"));
};

exports.default = gulp.series(cleanDist, generateSdk, uglifyJs);
