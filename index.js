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
      if (typeof opts.mainFile === 'string') {
        return resolve(path.resolve(fp, opts.mainFile))
      }
      if (typeof opts.mainField === 'string') {
        fp = path.resolve(fp, pkg[opts.mainField])
        return resolve(fp)
      }
      resolve(path.resolve(fp, pkg.main))
    },
    (e) => {
      const index = typeof opts.mainFile === 'string'
      ? opts.mainFile
      : 'index.js'
      resolve(path.resolve(fp, index))
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
