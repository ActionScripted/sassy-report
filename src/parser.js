/*
 * Sassy Report: Parser.
 * Parse SASS file(s) and extract data.
 */

const fs = require('fs');
const listSelectors = require('list-selectors');
const parser = require('postcss-selector-parser');
const path = require('path');
const sass = require('node-sass');
const sassExtract = require('sass-extract');

const utils = require('./utils');


async function getReportCSS(sass_file, tmp_file) {
  return await (() => { return new Promise(resolve => {
    sass.render({ file: sass_file }, async (err, sass_result) => {

      try {
        await fs.promises.unlink(tmp_file);
      } catch (err) { /* */ }

      try {
        await fs.promises.writeFile(tmp_file, sass_result.css);
      } catch (err) { /* */ }

      listSelectors([tmp_file], data => { resolve(data); });
    });
  })})();
}


async function getReportSASS(sass_file, tmp_file) {
  return await (() => { return new Promise(resolve => {
    sassExtract.render({ file: sass_file })
      .then((data) => { resolve(data); });
  })})();
}


function processCSSData(report, data) {
  report.css_classes = report.css_classes.concat(data.simpleSelectors.classes);
  report.css_ids = report.css_ids.concat(data.simpleSelectors.ids);
  report.css_selectors = report.css_selectors.concat(data.selectors);
  report.css_types = report.css_types.concat(data.simpleSelectors.types);

  return report;
}

function processSASSData(report, data) {
  //report.sass_css = report.sass_vars.concat(data.css);
  //report.sass_map = report.sass_vars.concat(data.map);
  report.sass_files.push(...data.stats.includedFiles);
  report.sass_stats = report.sass_vars.concat(data.stats);
  report.sass_vars = report.sass_vars.concat(data.vars);

  return report;
}


async function parse(sass_root, tmp_file) {
  let report = {
    css_classes   : [],
    css_ids       : [],
    css_selectors : [],
    css_types     : [],
    css_raw       : [],
    sass_files    : [],
    sass_vars     : [],
  };

  // Create tmp dir, as needed
  try {
    await fs.promises.mkdir(path.dirname(tmp_file), {recursive: true});
  } catch (err) { /* */ }

  // Process SASS files
  await fs.promises.readdir(sass_root).then(async (files) => {
    await utils.asyncForEach(files, async (file) => {
      if (file.endsWith('.scss')) {
        const sass_file = path.join(sass_root, file);

        const css_data  = await getReportCSS(sass_file, tmp_file);
        const sass_data = await getReportSASS(sass_file, tmp_file);

        if (Object.keys(css_data).length) {
          report = processCSSData(report, css_data);
        }

        if (Object.keys(sass_data).length) {
          report = processSASSData(report, sass_data);
        }
      }
    });
  });

  // Remove tmp file
  try {
    await fs.promises.unlink(tmp_file);
  } catch (err) { /* */ }

  // (Maybe) Remove tmp dir
  try {
    await fs.promises.rmdir(path.dirname(tmp_file));
  } catch (err) { /* */ }

  return report;
}


module.exports = { parse };
