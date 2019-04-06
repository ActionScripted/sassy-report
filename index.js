const parser = require('./src/parser');
const path = require('path');
const renderer = require('./src/renderer');

const PARSER_FILE_TMP = path.join(__dirname, './.sassy_report.[id].css.tmp');
const RENDER_FILE_OUT = path.join(__dirname, './sassy_report.[id].html');
const RENDER_OPTS     = {};

const sass_dir = './test/src';


async function main() {
  const id = '123456789'; // TODO: wtf

  const parser_tmp = PARSER_FILE_TMP.replace('[id]', id);
  const render_out = RENDER_FILE_OUT.replace('[id]', id);

  const data = await parser.parse(sass_dir, parser_tmp);

  renderer.render(
    './src/views/index.ejs',
    RENDER_FILE_OUT.replace('[id]', id),
    {report: data},
    RENDER_OPTS
  );
}

main();
