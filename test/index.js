'use strict';
const test = require('tape');
const NunjucksTask = require('../');
const ClientKitTask = require('clientkit-task');
const fs = require('fs');
const os = require('os');

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

test('returns an error when a render error occurs', (t) => {
  t.plan(3);
  const files = {};
  const results = [];
  const tagResults = [];
  const temp = console.log;
  console.log = (tags, data) => {
    results.push(data);
    tagResults.push(tags);
  };
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
    console.log = temp;
    t.notEqual(err, null, 'errors if you pass an unrenderable files');
    t.equal(results.length, 1, 'logs the error');
    t.equal(results[0].message.indexOf('ENOENT') > -1, true);
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
