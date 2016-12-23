'use strict';
const test = require('tape');
const NunjucksTask = require('../');
const ClientKitTask = require('clientkit-task');
const fs = require('fs');
const os = require('os');
const async = require('async');


test('instance of', (t) => {
  t.plan(1);

  const nt = new NunjucksTask();

  t.equal(nt instanceof ClientKitTask, true, 'instance of ClientKitTask');
});

test('converts and saves', (t) => {
  t.plan(3);

  const file = `out1-${new Date().getTime()}.js`;
  const outpath = `${os.tmpdir()}/${file}`;
  const files = {};
  files[file] = 'test/fixtures/in.njk';
  const task = new NunjucksTask('nunjucks', {
    dist: os.tmpdir(),
    files
  });
  task.execute((err) => {
    t.equal(err, null, 'not erroring');
    t.equal(fs.existsSync(outpath), true, 'file exists');
    t.equal(fs.readFileSync(outpath, 'utf8'), fs.readFileSync('test/expected/out1.js', 'utf8'));
  });
});

test('converts array of files and saves', (t) => {
  t.plan(3);

  const file = `out2-${new Date().getTime()}.js`;
  const outpath = `${os.tmpdir()}/${file}`;
  const files = {};
  files[file] = ['test/fixtures/in.njk', 'test/fixtures/in2.njk'];
  const task = new NunjucksTask('nunjucks', {
    dist: os.tmpdir(),
    files
  });
  task.execute((err) => {
    t.equal(err, null, 'not erroring');
    t.equal(fs.existsSync(outpath), true, 'file exists');
    t.equal(fs.readFileSync(outpath, 'utf8'), fs.readFileSync('test/expected/out2.js', 'utf8'));
  });
});

test('precompiles a file object', (t) => {
  t.plan(3);
  const file = `out3-${new Date().getTime()}.js`;
  const outpath = `${os.tmpdir()}/${file}`;
  const files = {};
  files[file] = {
    type: 'precompile',
    input: ['test/fixtures/in.njk', 'test/fixtures/in2.njk'],
    data: {
      dog: 'woof!',
      cat: 'meow!'
    }
  };
  const task = new NunjucksTask('nunjucks', {
    dist: os.tmpdir(),
    files
  });
  task.execute((err) => {
    t.equal(err, null, 'not erroring');
    t.equal(fs.existsSync(outpath), true, 'file exists');
    t.equal(fs.readFileSync(outpath, 'utf8'), fs.readFileSync('test/expected/out2.js', 'utf8'));
  });
});

test('compiles a file object', (t) => {
  t.plan(3);
  const file = `out5-${new Date().getTime()}.html`;
  const outpath = `${os.tmpdir()}/${file}`;
  const files = {};
  files[file] = {
    type: 'compile',
    input: 'test/fixtures/in3.njk',
    data: {
      dog: 'woof!',
      cat: 'meow!',
      fox: '????'
    }
  };
  const task = new NunjucksTask('nunjucks', {
    dist: os.tmpdir(),
    files
  });
  task.execute((err) => {
    t.equal(err, null, 'not erroring');
    t.equal(fs.existsSync(outpath), true, 'file exists');
    t.equal(fs.readFileSync(outpath, 'utf8'), fs.readFileSync('test/expected/out4.html', 'utf8'));
  });
});

test('does not crash when a render error occurs', (t) => {
  t.plan(1);
  const files = {};
  const file = 'notGonnaHappen.js';
  files[file] = {
    type: 'compile',
    input: 'does/not/exist.njk',
    data: {
      dog: 'woof!',
      cat: 'meow!'
    }
  };
  const task = new NunjucksTask('nunjucks', {
    dist: os.tmpdir(),
    files
  });
  task.execute((err) => {
    t.notEqual(err, null, 'errors if you pass an unrenderable files');
  });
});

test('does not crash when a precompile error occurs', (t) => {
  t.plan(1);
  const files = {};
  const file = 'notGonnaHappen.js';
  files[file] = {
    type: 'precompile',
    input: ['test/fixtures/broke.njk'],
    data: {
      dog: 'woof!',
      cat: 'meow!'
    }
  };
  const task = new NunjucksTask('nunjucks', {
    dist: os.tmpdir(),
    files
  });
  task.execute((err) => {
    t.notEqual(err, null, 'errors if you pass an unrenderable files');
  });
});

test('compiles a file object with a path to support "extend" ', (t) => {
  t.plan(3);
  const file = `out6-${new Date().getTime()}.html`;
  const outpath = `${os.tmpdir()}/${file}`;
  const files = {};
  files[file] = {
    type: 'compile',
    input: 'test/fixtures/path.njk',
    data: {
      dog: 'woof!',
      cat: 'meow!',
      fox: '????'
    }
  };
  const task = new NunjucksTask('nunjucks', {
    path: 'test/expected',
    dist: os.tmpdir(),
    files
  });
  task.execute((err) => {
    t.equal(err, null, 'not erroring');
    t.equal(fs.existsSync(outpath), true, 'file exists');
    t.equal(fs.readFileSync(outpath, 'utf8'), fs.readFileSync('test/expected/out4.html', 'utf8'));
  });
});

test('returns an error if passed an array to compile option', (t) => {
  t.plan(1);
  const file = `out4-${new Date().getTime()}.js`;
  const files = {};
  files[file] = {
    type: 'compile',
    input: ['test/fixtures/in.njk', 'test/fixtures/in2.njk'],
    data: {
      dog: 'woof!',
      cat: 'meow!'
    }
  };
  const task = new NunjucksTask('nunjucks', {
    dist: os.tmpdir(),
    files
  });
  task.execute((err) => {
    t.notEqual(err, null, 'errors if you pass compile a list of files');
  });
});

test('returns an error when a compile error occurs', (t) => {
  t.plan(2);
  const files = {};
  const file = 'notGonnaHappen.js';
  files[file] = {
    type: 'compile',
    input: 'test/fixtures/broke.njk',
    data: {
      dog: 'woof!',
      cat: 'meow!'
    }
  };
  const task = new NunjucksTask('nunjucks', {
    dist: os.tmpdir(),
    files
  });
  task.execute((err) => {
    t.notEqual(err, null, 'errors if you pass an unrenderable files');
    t.equal(err.message.indexOf('ENOENT') > -1, true);
  });
});

test('returns an error when a precompile error occurs', (t) => {
  t.plan(2);
  const files = {};
  const file = 'notGonnaHappen.js';
  files[file] = {
    type: 'precompile',
    input: ['test/fixtures/broke.njk'],
    data: {
      dog: 'woof!',
      cat: 'meow!'
    }
  };
  const task = new NunjucksTask('nunjucks', {
    dist: os.tmpdir(),
    files
  });
  task.execute((err) => {
    t.notEqual(err, null, 'errors if you pass an unrenderable files');
    t.equal(err.message.indexOf('pathStats') > -1, true);
  });
});

test('does not cache compile jobs by default', (t) => {
  t.plan(5);
  const file = `out6-${new Date().getTime()}.html`;
  const outpath = `${os.tmpdir()}/${file}`;
  const files = {};
  files[file] = {
    type: 'compile',
    input: 'test/fixtures/in4.njk',
    data: {
      dog: 'woof!',
      cat: 'meow!',
      fox: '????'
    }
  };
  const task = new NunjucksTask('nunjucks', {
    dist: os.tmpdir(),
    files
  });
  async.autoInject({
    firstPass: (done) => task.execute(done),
    verifyFirstPass: (firstPass, done) => {
      t.equal(fs.existsSync(outpath), true, 'file exists');
      t.equal(fs.readFileSync(outpath, 'utf8').indexOf('woof!') > -1, true);
      done();
    },
    modifyTemplate: (verifyFirstPass, done) => fs.writeFile(files[file].input, '{{ cat }}', done),
    secondPass: (modifyTemplate, done) => task.execute(done),
    verifySecondPass: (secondPass, done) => {
      t.equal(fs.existsSync(outpath), true, 'file exists');
      t.equal(fs.readFileSync(outpath, 'utf8').indexOf('meow!') > -1, true);
      done();
    },
    restoreTemplate: (verifySecondPass, done) => fs.writeFile(files[file].input, '{{ dog }}', done),
  }, (err) => {
    t.equal(err, null);
  });
});

test('caching of previous compile jobs can be enabled by turning noCache to false', (t) => {
  t.plan(5);
  const file = `outCache1-${new Date().getTime()}.html`;
  const outpath = `${os.tmpdir()}/${file}`;
  const files = {};
  files[file] = {
    type: 'compile',
    input: 'test/fixtures/in4.njk',
    data: {
      dog: 'woof!',
      cat: 'meow!',
      fox: '????'
    }
  };
  const task = new NunjucksTask('nunjucks', {
    noCache: false,
    dist: os.tmpdir(),
    files
  });
  async.autoInject({
    firstPass: (done) => task.execute(done),
    verifyFirstPass: (firstPass, done) => {
      t.equal(fs.existsSync(outpath), true, 'file exists');
      t.equal(fs.readFileSync(outpath, 'utf8').indexOf('woof!') > -1, true);
      done();
    },
    modifyTemplate: (verifyFirstPass, done) => fs.writeFile(files[file].input, '{{ cat }}', done),
    secondPass: (modifyTemplate, done) => task.execute(done),
    verifySecondPass: (secondPass, done) => {
      t.equal(fs.existsSync(outpath), true, 'file exists');
      // should be unchanged from the previous run:
      t.equal(fs.readFileSync(outpath, 'utf8').indexOf('woof!') > -1, true);
      done();
    },
    restoreTemplate: (verifySecondPass, done) => fs.writeFile(files[file].input, '{{ dog }}', done),
  }, (err) => {
    t.equal(err, null);
  });
});
