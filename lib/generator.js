const fs = require('fs');
const ejs = require('ejs');
const { randomBytes } = require('crypto');
const { basename, extname, resolve } = require('path');
const Boom = require('boom');

const Utils = require('./utils');
const pjson = require('../package.json');

const templateDir = resolve(__dirname, '../site_template');

class Generator {
  /*
   * Copies files for a new website
   * @params {string} target - a file path
   */
  static copyTo(target) {
    // Use Generator
    if (fs.existsSync(target)) {
      throw new Boom('Target directory already exists.');
    }

    _copyFiles(templateDir, target, {
      name: basename(target),
      package: pjson.name,
      version: pjson.version,
      secretKey: randomBytes(64).toString('hex'),
    });
  }
}

function _copyFiles(from, to, data) {
  const filesToCopy = fs.readdirSync(from);

  Utils.mkdirp(to);

  filesToCopy.forEach((file) => {
    let toPath = `${to}/${file}`;
    const fromPath = `${from}/${file}`;
    const stats = fs.statSync(fromPath);

    if (stats.isFile()) {
      let content = fs.readFileSync(fromPath, 'utf8');

      if (extname(fromPath) === '.ejs') {
        toPath = toPath.replace(/\.ejs$/, '');
        content = ejs.render(content, data);
      }

      fs.writeFileSync(toPath, content, 'utf8');
    } else if (stats.isDirectory()) {
      _copyFiles(fromPath, toPath, data);
    }
  });
}

module.exports = Generator;