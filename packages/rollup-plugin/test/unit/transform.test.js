import { parse } from 'acorn';
import sut from '../../src/transform';
import setup from '../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  t.context.entryOptions = {
    name: 'lib',
    entry: 'entry',
    file: 'entry.js'
  };
  t.context.chunkOptions = {
    name: 'lib',
    entry: 'c/chunk',
    file: 'c/chunk.js'
  };
  t.context.transform = (code, options = t.context.entryOptions) => (
    sut({
      code,
      ast: parse(code, { ecmaVersion: 6 }),
      map: false
    }, options)
  );
  t.context.transformChunk = code => t.context.transform(code, t.context.chunkOptions);
});

test('requires define expression', t => {
  t.throws(() => t.context.transform(`var a = 1;`));
});

test('requires only one define expression', t => {
  t.notThrows(() => t.context.transform(`define(() => {});`));
  t.throws(() => t.context.transform(`define(() => {}); define(() => {});`));
});

test('requires 1 or 2 arguments', t => {
  // Empty
  t.throws(() => t.context.transform(`define();`));
  // Already has id
  t.throws(() => t.context.transform(`define('id', [], ()=>{});`));
});

test('requires proper arguments', t => {
  // No callback
  t.throws(() => t.context.transform(`define([]);`));
  // Object define
  t.throws(() => t.context.transform(`define([], {});`));
  // Non-Array define
  t.throws(() => t.context.transform(`define(true, () => {});`));
  // Non-Literal define
  t.throws(() => t.context.transform(`define([true], (T) => {});`));
  // Different lengths
  t.throws(() => t.context.transform(`define([], (a) => {});`));
  t.throws(() => t.context.transform(`define(['a'], () => {});`));
});

test('keeps require statements as-is', t => {
  const before = [
    `define(() => {`,
    `  const fs = require("fs");`,
    `});`
  ].join('\n');
  const after = [
    `define([], () => {`,
    `  const fs = require("fs");`,
    `});`
  ].join('\n');
  t.is(t.context.transform(before).code, after);
  t.is(t.context.transformChunk(before).code, after);
});

test('keeps globalThis.require statements as-is', t => {
  const before = [
    `define(() => {`,
    `  const fs = globalThis.require("fs");`,
    `});`
  ].join('\n');
  const after = [
    `define([], () => {`,
    `  const fs = globalThis.require("fs");`,
    `});`
  ].join('\n');
  t.is(t.context.transform(before).code, after);
  t.is(t.context.transformChunk(before).code, after);
});

test('changes require dependency to radpack', t => {
  const before = [
    `define(["require"], require => {`,
    `  const expressPath = require.resolve("express");`,
    `});`
  ].join('\n');
  const after = [
    `define(["radpack"], radpack => {`,
    `  const expressPath = require.resolve("express");`,
    `});`
  ].join('\n');
  t.is(t.context.transform(before).code, after);
  t.is(t.context.transformChunk(before).code, after);
});

test('adds radpack dependency when radpack is used', t => {
  const before = [
    `define(() => {`,
    `  radpack("dep").then(res => console.log(res));`,
    `});`
  ].join('\n');
  const after = [
    `define(["radpack"], (radpack) => {`,
    `  radpack("dep").then(res => console.log(res));`,
    `});`
  ].join('\n');
  t.is(t.context.transform(before).code, after);
  t.is(t.context.transformChunk(before).code, after);
});

test('adds id to non-array defines', t => {
  const before = `define(() => {});`;
  const res1 = t.context.transform(before);
  res1.setId('lib/entry-hash.js');
  const res2 = t.context.transformChunk(before);
  res2.setId('lib/c/chunk-hash.js');
  t.is(res1.code, `define("lib/entry-hash.js", [], () => {});`);
  t.is(res2.code, `define("lib/c/chunk-hash.js", [], () => {});`);
});

test('adds id and radpack to non-array defines', t => {
  const before = `define(() => {radpack()});`;
  const res1 = t.context.transform(before);
  res1.setId('lib/entry-hash.js');
  const res2 = t.context.transformChunk(before);
  res2.setId('lib/c/chunk-hash.js');
  t.is(res1.code, `define("lib/entry-hash.js", ["radpack"], (radpack) => {radpack()});`);
  t.is(res2.code, `define("lib/c/chunk-hash.js", ["radpack"], (radpack) => {radpack()});`);
});

test('adds id to empty array defines', t => {
  const before = `define([], () => {});`;
  const res1 = t.context.transform(before);
  res1.setId('lib/entry-hash.js');
  const res2 = t.context.transformChunk(before);
  res2.setId('lib/c/chunk-hash.js');
  t.is(res1.code, `define("lib/entry-hash.js", [], () => {});`);
  t.is(res2.code, `define("lib/c/chunk-hash.js", [], () => {});`);
});

test('adds id and radpack to empty array defines', t => {
  const before = `define([], () => {radpack()});`;
  const res1 = t.context.transform(before);
  res1.setId('lib/entry-hash.js');
  const res2 = t.context.transformChunk(before);
  res2.setId('lib/c/chunk-hash.js');
  t.is(res1.code, `define("lib/entry-hash.js", ["radpack"], (radpack) => {radpack()});`);
  t.is(res2.code, `define("lib/c/chunk-hash.js", ["radpack"], (radpack) => {radpack()});`);
});

test('adds id to array defines', t => {
  const before = `define(["something"], (something) => {});`;
  const res1 = t.context.transform(before);
  res1.setId('lib/entry-hash.js');
  const res2 = t.context.transformChunk(before);
  res2.setId('lib/c/chunk-hash.js');
  t.is(res1.code, `define("lib/entry-hash.js", ["something"], (something) => {});`);
  t.is(res2.code, `define("lib/c/chunk-hash.js", ["something"], (something) => {});`);
});

test('adds id and radpack to array defines', t => {
  const before = `define(["something"], (something) => {require([])});`;
  const res1 = t.context.transform(before);
  res1.setId('lib/entry-hash.js');
  const res2 = t.context.transformChunk(before);
  res2.setId('lib/c/chunk-hash.js');
  t.is(res1.code, `define("lib/entry-hash.js", ["something", "radpack"], (something, radpack) => {radpack.require([])});`);
  t.is(res2.code, `define("lib/c/chunk-hash.js", ["something", "radpack"], (something, radpack) => {radpack.require([])});`);
});

test('adds radpack to anon fns with no parentheses', t => {
  const before = `define(["something"], something => {radpack(Array())});`;
  const after = `define(["something", "radpack"], (something, radpack) => {radpack(Array())});`;
  t.is(t.context.transform(before).code, after);
  t.is(t.context.transformChunk(before).code, after);
});

test('updates path of radpack calls', t => {
  const before = [
    `define(["require"], (require) => {`,
    // Empty require
    `  require();`,
    // CJS require
    `  require("a");`,
    `  require("./a");`,
    `  require("~/a");`,
    // Global CJS require
    `  globalThis.require("b");`,
    `  globalThis.require("./b");`,
    `  globalThis.require("~/b");`,
    // AMD require
    `  require(["c", "./c", "~/c"]);`,
    // Empty radpack
    `  radpack();`,
    // radpack string
    `  radpack("c");`,
    `  radpack("./c");`,
    `  radpack("~/c");`,
    // radpack array
    `  radpack(["d", "./d", "~/d"]);`,
    `});`
  ].join('\n');
  t.is(t.context.transform(before).code, [
    `define(["radpack"], (radpack) => {`,
    // No changes
    `  require();`,
    `  require("a");`,
    `  require("./a");`,
    `  require("~/a");`,
    `  globalThis.require("b");`,
    `  globalThis.require("./b");`,
    `  globalThis.require("~/b");`,
    // Coverted to radpack.require and resolved paths
    `  radpack.require(["c", "~/c", "~/c"]);`,
    // No changes
    `  radpack();`,
    // radpack string
    `  radpack("c");`,
    `  radpack("~/c");`,
    `  radpack("~/c");`,
    // radpack array
    `  radpack(["d", "~/d", "~/d"]);`,
    `});`
  ].join('\n'));
  t.is(t.context.transformChunk(before).code, [
    `define(["radpack"], (radpack) => {`,
    // No changes
    `  require();`,
    `  require("a");`,
    `  require("./a");`,
    `  require("~/a");`,
    `  globalThis.require("b");`,
    `  globalThis.require("./b");`,
    `  globalThis.require("~/b");`,
    // Coverted to radpack.require and resolved paths
    `  radpack.require(["c", "~/c/c", "~/c"]);`,
    // No changes
    `  radpack();`,
    // radpack string
    `  radpack("c");`,
    `  radpack("~/c/c");`,
    `  radpack("~/c");`,
    // radpack array
    `  radpack(["d", "~/c/d", "~/d"]);`,
    `});`
  ].join('\n'));
});

