/*!
 * resolve-package <https://github.com/tunnckoCore/resolve-package>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (http://i.am.charlike.online)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

const fs = require('fs')
const test = require('mukla')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const resolvePackage = require('./index')

test('resolve-package', () => {
  // try: pre-commit, babel-generator,
  // load-pkg, standard, npm and etc...
  return resolvePackage('standard')
    .then((fp) => {
      test.strictEqual(typeof fp === 'string', true)
      return resolvePackage('npm')
    })
    .then((fp) => {
      test.strictEqual(typeof fp === 'string', true)
      return resolvePackage('pre-commit')
    })
})

test('should work if module not have package.json', () => {
  const content = 'module.exports = { foo: 123 }'
  mkdirp.sync('./node_modules/foobar-quxie')
  fs.writeFileSync('./node_modules/foobar-quxie/index.js', content)

  return resolvePackage('foobar-quxie').then((fp) => {
    test.strictEqual(typeof fp === 'string', true)
    test.strictEqual(fp.endsWith('index.js'), true)
    const res = require(fp)
    test.strictEqual(res.foo, 123)
    rimraf.sync('./node_modules/foobar-quxie')
  })
})

test('should work for custom index file, through opts.index', () => {
  const mod = 'module.exports = (abc) => abc + 123'
  mkdirp.sync('./node_modules/abc-fn')
  fs.writeFileSync('./node_modules/abc-fn/custom.js', mod)

  return resolvePackage('abc-fn', {
    indexFile: 'custom.js'
  }).then((fp) => {
    test.strictEqual(typeof fp === 'string', true)
    const abc = require(fp)
    test.strictEqual(abc(100), 223)
    rimraf.sync('./node_modules/abc-fn')
  })
})

test('should work for custom main, through opts.main', () => {
  const pkg = `{
    "name": "xyz",
    "browser": "bar.js"
  }`
  mkdirp.sync('./node_modules/xyz-fab')
  fs.writeFileSync('./node_modules/xyz-fab/package.json', pkg)
  fs.writeFileSync('./node_modules/xyz-fab/bar.js', 'module.exports = 555')

  return resolvePackage('xyz-fab', {
    mainField: 'browser'
  }).then((filepath) => {
    test.strictEqual(typeof filepath === 'string', true)
    const actual = require(filepath)
    test.strictEqual(actual, 555)
    rimraf.sync('./node_modules/xyz-fab')
  })
})
