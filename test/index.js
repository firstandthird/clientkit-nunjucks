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
