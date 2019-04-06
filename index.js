const parser = require('./src/parser');
const path = require('path');
const renderer = require('./src/renderer');


const PARSER_FILE_TMP = path.join(__dirname, './tmp/css.tmp');
const RENDER_FILE_IN  = path.join(__dirname, './src/views/index.ejs');
const RENDER_FILE_OUT = path.join(__dirname, './reports/report.html')
const RENDER_OPTS     = {};

const sass_dir = './test/src';

async function main() {
  const data = await parser.parse(sass_dir, PARSER_FILE_TMP);

  renderer.render(
    RENDER_FILE_IN,
    RENDER_FILE_OUT,
    {report: data},
    RENDER_OPTS
  );
}

main();
