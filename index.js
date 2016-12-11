/*!
 * resolve-package <https://github.com/tunnckoCore/resolve-package>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (http://i.am.charlike.online)
 * Released under the MIT license.
 */

'use strict'

const fs = require('fs')
const path = require('path')
const get = require('get-installed-path')

const readPackage = (fp) => new Promise((resolve, reject) => {
  fs.readFile(path.resolve(fp, 'package.json'), 'utf8', (err, str) => {
    if (err) return reject(err)
    const json = JSON.parse(str)
    resolve(json)
  })
})

const tryLoad = (opts, resolve) => (fp) => {
  readPackage(fp).then(
    (pkg) => {
      resolve(path.resolve(fp, opts.mainField ? pkg[opts.mainField] : pkg.main))
    },
    (e) => {
      resolve(path.resolve(fp, opts.indexFile || 'index.js'))
    }
  )
}

const resolvePackage = (name, opts) => new Promise((resolve, reject) => {
  opts = opts && typeof opts === 'object' ? opts : {}
  opts.local = true

  get(name, opts).then(tryLoad(opts, resolve), (e) => {
    opts.local = false
    get(name, opts).then(tryLoad(opts, resolve), reject)
  })
})

module.exports = resolvePackage
