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

const pkgJson = `{
  "name": "foo",
  "main": "qux.js",
  "custom": "browser.js"
}`

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

test('should work if module not have package.json (resolves index.js)', () => {
  const content = 'module.exports = { foo: 123 }'
  mkdirp.sync('./node_modules/foobar-quxie')
  fs.writeFileSync('./node_modules/foobar-quxie/index.js', content)

  return resolvePackage('foobar-quxie').then((fp) => {
    test.strictEqual(typeof fp === 'string', true)
    test.strictEqual(fp.endsWith('index.js'), true)
    const res = require(fp) // eslint-disable-line global-require
    test.strictEqual(res.foo, 123)
    rimraf.sync('./node_modules/foobar-quxie')
  })
})

test('prefer opts.mainFile instead of index.js, if package.json not exist', () => {
  const mod = 'module.exports = (abc) => abc + 123'
  mkdirp.sync('./node_modules/abc-fn')
  fs.writeFileSync('./node_modules/abc-fn/custom.js', mod)

  return resolvePackage('abc-fn', {
    mainFile: 'custom.js'
  }).then((fp) => {
    test.strictEqual(typeof fp === 'string', true)
    const abc = require(fp) // eslint-disable-line global-require
    test.strictEqual(abc(100), 223)
    rimraf.sync('./node_modules/abc-fn')
  })
})

test('prefer opts.mainFile even if package.json exists and has main field', () => {
  const mainFile = 'module.exports = 333'

  mkdirp.sync('./node_modules/barry')
  fs.writeFileSync('./node_modules/barry/bar.js', mainFile)
  fs.writeFileSync('./node_modules/barry/package.json', pkgJson)

  return resolvePackage('barry', { mainFile: 'bar.js' }).then((fpath) => {
    const barryMain = require(fpath) // eslint-disable-line global-require
    test.strictEqual(barryMain, 333)
    rimraf.sync('./node_modules/barry')
  })
})

test('prefer opts.mainField even if package.json exists and has main field', () => {
  mkdirp.sync('./node_modules/xyz-fab')
  fs.writeFileSync('./node_modules/xyz-fab/package.json', pkgJson)
  fs.writeFileSync('./node_modules/xyz-fab/browser.js', 'module.exports = 555')

  return resolvePackage('xyz-fab', {
    mainField: 'custom'
  }).then((filepath) => {
    test.strictEqual(typeof filepath === 'string', true)
    const actual = require(filepath) // eslint-disable-line global-require
    test.strictEqual(actual, 555)
    rimraf.sync('./node_modules/xyz-fab')
  })
})

test("prefer package.json's `main` field if no opts.mainFile and no opts.mainField", () => {
  mkdirp.sync('./node_modules/megacool')
  fs.writeFileSync('./node_modules/megacool/qux.js', 'module.exports = 777')
  fs.writeFileSync('./node_modules/megacool/package.json', pkgJson)

  const promise = resolvePackage('megacool')
  return promise.then((filepath) => {
    test.strictEqual(require(filepath), 777) // eslint-disable-line global-require
    rimraf.sync('./node_modules/megacool')
  })
})

test('resolves to package directory as last resort when no main field in package.json', () => {
  mkdirp.sync('./node_modules/boombam')
  fs.writeFileSync('./node_modules/boombam/package.json', `{
    "name": "boombam"
  }`)

  return resolvePackage('boombam').then((fp) => {
    test.strictEqual(/node_modules/.test(fp), true)
    test.strictEqual(fp.endsWith('boombam'), true)
    rimraf.sync('./node_modules/boombam')
  })
})
