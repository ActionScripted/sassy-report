/*
 * Sassy Report: Render.
 * Combine parser data with templates for output.
 */

const ejs = require('ejs');
const fs = require('fs');


function render(file_in, file_out, file_data, file_options) {
  fs.unlink(file_out, (err) => {});

  ejs.renderFile(file_in, file_data, file_options, (err, output) => {
    fs.writeFile(file_out, output, (err) => {});
  });
}


module.exports = { render };
