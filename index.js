'use strict';
const ClientKitTask = require('clientkit-task');
const nunjucks = require('nunjucks');
const async = require('async');
const os = require('os');

class NunjucksTask extends ClientKitTask {

  compile(input, output, done) {
    return done();
  }

  precompile(input, output, done) {
    if (!Array.isArray(input)) {
      input = [input];
    }
    async.map(input, (file, next) => {
      const env = new nunjucks.Environment();
      let out = null;
      try {
        out = nunjucks.precompile(file, { env });
      } catch (e) {
        return next(e);
      }
      next(null, out);
    }, (err, results) => {
      if (err) {
        return done(err);
      }
      this.write(output, results.join(os.EOL), done);
    });
  }

  process(input, output, done) {
    // if it's a suitable compile specifier:
    if (typeof input === 'object' && input.type && input.input) {
      if (input.type === 'precompile') {
        return this.precompile(input.input, output, done);
      }
      return this.compile(input, output, done);
    }
    return this.precompile(input, output, done);
  }
}

module.exports = NunjucksTask;
