'use strict';
const ClientKitTask = require('clientkit-task');
const nunjucks = require('nunjucks');
const async = require('async');
const os = require('os');
const fs = require('fs');
class NunjucksTask extends ClientKitTask {

  compile(input, output, allDone) {
    if (Array.isArray(input.input)) {
      return allDone(new Error('Compile can only compile individual files, not lists of files'));
    }
    const data = input.data ? input.data : {};
    async.autoInject({
      buffer: (done) => fs.readFile(input.input, done),
      env: (done) => done(null, this.options.path ? new nunjucks.Environment(new nunjucks.FileSystemLoader(this.options.path)) :
        new nunjucks.Environment(new nunjucks.FileSystemLoader(process.cwd()))),
      compile: (buffer, env, done) => done(null, nunjucks.compile(buffer.toString('utf-8'), env).render(data)),
      write: (compile, done) => this.write(output, compile, done)
    }, (err, results) => {
      if (err) {
        return allDone(err);
      }
      return allDone(null, results.compile);
    });
  }

  precompile(input, output, done) {
    if (!Array.isArray(input)) {
      input = [input];
    }
    const env = this.options.path ? nunjucks.configure(this.options.path) : nunjucks;
    async.map(input, (file, next) => {
      let out = null;
      try {
        out = env.precompile(file);
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
    // otherwise assume it's a filepath or list of filepaths:
    return this.precompile(input, output, done);
  }
}

module.exports = NunjucksTask;
