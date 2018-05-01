const { sync } = require('glob');
const Logger = require('../logger');
const Utils = require('../utils');

const BaseDirective = require('./base');

// TODO: Allow custom directives in site folder?
const vapidDirectives = sync(`${__dirname}/!(base|index).js`);
const availableDirectives = {};

vapidDirectives.forEach((file) => {
  /* eslint-disable-next-line global-require, import/no-dynamic-require */
  const klass = require(file)(BaseDirective);
  const name = Utils.kebabCase(klass.name).split('-')[0];

  availableDirectives[name] = klass;
});

function find(params) {
  const name = params.type;

  if (Utils.has(availableDirectives, name)) {
    return new availableDirectives[name](params);
  }

  // Only show warning if someone explicity enters a bad name
  if (name) { Logger.warn(`Directive type '${name}' does not exist. Falling back to 'text'`); }
  /* eslint-disable-next-line new-cap */
  return new availableDirectives.text(params);
}

module.exports = {
  find,
};