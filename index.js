'use strict';
const ClientKitTask = require('clientkit-task');
const nunjucks = require('nunjucks');
const async = require('async');
const os = require('os');

class NunjucksTask extends ClientKitTask {
  process(input, output, done) {
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
}

module.exports = NunjucksTask;
