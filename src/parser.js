/*
 * Sassy Report: Parser.
 * Parse SASS file(s) and extract data.
 */

const fs = require('fs');
const listSelectors = require('list-selectors');
const parser = require('postcss-selector-parser');
const path = require('path');
const sass = require('node-sass');
const util = require('util');


async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function process(sass_file, css_tmp) {
  const sass_render = sass.renderSync({ file: sass_file })

  if (fs.existsSync(css_tmp)) {
    fs.unlink(css_tmp, (err) => {});
  }

  fs.writeFile(css_tmp, sass_render.css, (err) => {});

  function getSelectors() {
    return new Promise((resolve, reject) => {
      listSelectors([css_tmp], data => { resolve(data); });
    });
  }

  return await getSelectors();
}


async function parse(sass_root, css_tmp) {
  let report = {
    classes   : [],
    files     : [],
    ids       : [],
    selectors : [],
    types     : [],
  };

  await fs.promises.mkdir(
    path.dirname(css_tmp),
    {recursive: true}
  );

  await fs.promises.readdir(sass_root).then(async (files) => {
    await asyncForEach(files, async (file) => {
      if (file.endsWith('.scss')) {
        const sass_file = path.join(sass_root, file);
        const sass_data = await process(sass_file, css_tmp);

        report.files.push(sass_file);

        // TODO: I don't like this syntax/structure
        report.selectors = report.selectors.concat(sass_data.selectors);
        report.ids = report.ids.concat(sass_data.simpleSelectors.ids);
        report.classes = report.classes.concat(sass_data.simpleSelectors.classes);
        report.types = report.types.concat(sass_data.simpleSelectors.types);
      }
    });
  });

  return report;
}


module.exports = { parse };
