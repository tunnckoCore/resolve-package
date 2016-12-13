# resolve-package [![NPM version](https://img.shields.io/npm/v/resolve-package.svg?style=flat)](https://www.npmjs.com/package/resolve-package) [![NPM downloads](https://img.shields.io/npm/dm/resolve-package.svg?style=flat)](https://npmjs.org/package/resolve-package) [![npm total downloads][downloads-img]][downloads-url]

> Resolves a given package if it is installed locally, then tries to resolve it from global. Better approach than require.resolve

[![code climate][codeclimate-img]][codeclimate-url] 
[![standard code style][standard-img]][standard-url] 
[![linux build status][travis-img]][travis-url] 
[![windows build status][appveyor-img]][appveyor-url] 
[![coverage status][coveralls-img]][coveralls-url] 
[![dependency status][david-img]][david-url]

You might also be interested in [always-done](https://github.com/hybridables/always-done#readme).

## Table of Contents
- [Background](#background)
  * [Why](#why)
  * [Resolution](#resolution)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Related](#related)
- [Contributing](#contributing)
- [Building docs](#building-docs)
- [Running tests](#running-tests)
- [Author](#author)
- [License](#license)

## Background

### Why
Because I love hybrids - hybrid thinking. And here with _"hybrid"_ I mean that we need sane resolver. You give a package name and if it is not installed locally to be able to get it if it is installed globally. So that's what this package does - first tries to resolve it from locally installed modules, then if it's not found will load it from global.

That's useful and cool for command line interfaces, generators, scaffolders and etc stuff. There is one bad example - [gulp][], especially `gulp3`. I don't know, but for me it is weird to install same package both globally and locally. And Gulp is not the only one where I found this - this thinking and implementation. Two years or more I thinking why this is in that way.

Good example, where resolving is correctly done is [generate][] / [base][] / [verb][]. There if you have some _generator_ installed globally, you can use it through CLI, but if it is installed locally you, again, can use it - Generate is smart enough and the Base ecosystem is robust enough. Internally, somewhere (not sure enough yet), in Generate - actually somewhere in Base plugins, exactly the same thing is done. So I believe we can integrate this package there successfuly.

The [resolve-pkg][] does not do that thing, [resolve-module][] too, [resolve][] and [resolve-from][] too. So... that's why.

I built these 3-4 packages before ~2 years. I'm talking for [detect-installed][], [get-installed-path][] and [is-installed][]. They was not finished totally until now and there was few bugs.

**Just to be clear:** this package returns you a full absolute path to given package - the main export (the entry point or whatever you calling it) to the given package. Actual path that you can directly `require` in later step, that's all about.

### Resolution
So how we resolve given package?

**First,** we pass the name directly to [get-installed-path][] and pass `local: true` to get the folder of that package from locally installed modules if exists.  

Then we tries to read the `package.json` in that directory.  

**1)** If it exists we do 3 things (using `path.resolve`):
- if `options.mainFile` is given we join it with the folder of the package;
- if `options.mainField` is given we get the value of that field from that package.json file and join it with the folder of the package;
- or as last fallback if no options are given we use the value of `main` field in that package.json file.

**2)** If there's no `package.json` file in that directory we simply check if `options.mainFile` is given and join it with the directory of the package. If not given we fallback to use `index.js`.

**Second,** if given package is not installed locally we repeat the same process but we pass `local: false` to `get-install-path`, so it will check global registry of modules, based on [global-prefix][] and [global-modules][]. They are the best out there and works even on Windows machines, hence the green AppVeyor badges are all around mentioned packages.

_If it is not clear enough with that words, feel free to open an issue to discuss it, look at `tryLoad` function in the source code or review the [tests](test.js)._

## Install
Install with [npm](https://www.npmjs.com/)

```
$ npm install resolve-package --save
```

or install using [yarn](https://yarnpkg.com)

```
$ yarn add resolve-package
```

## Usage
> For more use-cases see the [tests](test.js)

```js
const resolvePackage = require('resolve-package')
```

## API

### [resolvePackage](index.js#L53)
> Get full absolute path of package with `name` from local node_modules or from globally installed.

**Params**

* `name` **{String}**: package name    
* `opts` **{Function}**: optional options such as below    
* `opts.cwd` **{String}**: directory where is the `node_modules` folder    
* `opts.mainFile` **{String}**: main file for directories, default `index.js`    
* `opts.mainField` **{String}**: name of the package.json's "main" field, default `main`    
* `returns` **{Promise}**  

**Example**

```js
const resolvePackage = require('resolve-package')

resolvePackage('npm').then((fp) => {
  console.log(fp)
  // => '~/.nvm/versions/node/v7.0.0/lib/node_modules/npm/lib/npm.js'
})

resolvePackage('standard').then((fp) => {
  console.log(fp)
  // => '~/.nvm/versions/node/v7.0.0/lib/node_modules/standard/index.js'
})

resolvePackage('get-installed-path').then((fp) => {
  console.log(fp)
  // => '~/code/resolve-package/node_modules/get-installed-path/index.js'
})

resolvePackage('foo-quqixs-dasdasdh').catch((err) => {
  console.error(err) // => Error module not found
})
```

## Related
- [always-done](https://www.npmjs.com/package/always-done): Handle completion and errors with elegance! Support for streams, callbacks, promises, child processes, async/await and sync functions. A drop-in replacement… [more](https://github.com/hybridables/always-done#readme) | [homepage](https://github.com/hybridables/always-done#readme "Handle completion and errors with elegance! Support for streams, callbacks, promises, child processes, async/await and sync functions. A drop-in replacement for [async-done][] - pass 100% of its tests plus more")
- [detect-installed](https://www.npmjs.com/package/detect-installed): Checks that given package is installed globally or locally. | [homepage](https://github.com/tunnckocore/detect-installed#readme "Checks that given package is installed globally or locally.")
- [each-promise](https://www.npmjs.com/package/each-promise): Iterate over promises, promise-returning or async/await functions in series or parallel. Support settle (fail-fast), concurrency (limiting) and hooks system (start… [more](https://github.com/tunnckocore/each-promise#readme) | [homepage](https://github.com/tunnckocore/each-promise#readme "Iterate over promises, promise-returning or async/await functions in series or parallel. Support settle (fail-fast), concurrency (limiting) and hooks system (start, beforeEach, afterEach, finish)")
- [get-installed-path](https://www.npmjs.com/package/get-installed-path): Get locally or globally installation path of given package name | [homepage](https://github.com/tunnckocore/get-installed-path#readme "Get locally or globally installation path of given package name")
- [global-modules](https://www.npmjs.com/package/global-modules): The directory used by npm for globally installed npm modules. | [homepage](https://github.com/jonschlinkert/global-modules "The directory used by npm for globally installed npm modules.")
- [global-paths](https://www.npmjs.com/package/global-paths): Returns an array of unique "global" directories based on the user's platform and environment. The resulting paths can be used… [more](https://github.com/jonschlinkert/global-paths) | [homepage](https://github.com/jonschlinkert/global-paths "Returns an array of unique "global" directories based on the user's platform and environment. The resulting paths can be used for doing lookups for generators or other globally installed npm packages. Node.js / JavaScript.")
- [global-prefix](https://www.npmjs.com/package/global-prefix): Get the npm global path prefix. | [homepage](https://github.com/jonschlinkert/global-prefix "Get the npm global path prefix.")
- [is-installed](https://www.npmjs.com/package/is-installed): Checks that given package is installed on the system - globally or locally. | [homepage](https://github.com/tunnckoCore/is-installed#readme "Checks that given package is installed on the system - globally or locally.")
- [minibase](https://www.npmjs.com/package/minibase): Minimalist alternative for Base. Build complex APIs with small units called plugins. Works well with most of the already existing… [more](https://github.com/node-minibase/minibase#readme) | [homepage](https://github.com/node-minibase/minibase#readme "Minimalist alternative for Base. Build complex APIs with small units called plugins. Works well with most of the already existing [base][] plugins.")
- [mukla](https://www.npmjs.com/package/mukla): Small, parallel and fast test framework with suppport for async/await, promises, callbacks, streams and observables. Targets and works at node.js… [more](https://github.com/tunnckocore/mukla#readme) | [homepage](https://github.com/tunnckocore/mukla#readme "Small, parallel and fast test framework with suppport for async/await, promises, callbacks, streams and observables. Targets and works at node.js v0.10 and above.")
- [try-catch-core](https://www.npmjs.com/package/try-catch-core): Low-level package to handle completion and errors of sync or asynchronous functions, using [once][] and [dezalgo][] libs. Useful for and… [more](https://github.com/hybridables/try-catch-core#readme) | [homepage](https://github.com/hybridables/try-catch-core#readme "Low-level package to handle completion and errors of sync or asynchronous functions, using [once][] and [dezalgo][] libs. Useful for and used in higher-level libs such as [always-done][] to handle completion of anything.")

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/tunnckoCore/resolve-package/issues/new).  
Please read the [contributing guidelines](CONTRIBUTING.md) for advice on opening issues, pull requests, and coding standards.  
If you need some help and can spent some cash, feel free to [contact me at CodeMentor.io](https://www.codementor.io/tunnckocore?utm_source=github&utm_medium=button&utm_term=tunnckocore&utm_campaign=github) too.

**In short:** If you want to contribute to that project, please follow these things

1. Please DO NOT edit [README.md](README.md), [CHANGELOG.md](CHANGELOG.md) and [.verb.md](.verb.md) files. See ["Building docs"](#building-docs) section.
2. Ensure anything is okey by installing the dependencies and run the tests. See ["Running tests"](#running-tests) section.
3. Always use `npm run commit` to commit changes instead of `git commit`, because it is interactive and user-friendly. It uses [commitizen][] behind the scenes, which follows Conventional Changelog idealogy.
4. Do NOT bump the version in package.json. For that we use `npm run release`, which is [standard-version][] and follows Conventional Changelog idealogy.

Thanks a lot! :)

## Building docs
Documentation and that readme is generated using [verb-generate-readme][], which is a [verb][] generator, so you need to install both of them and then run `verb` command like that

```
$ npm install verbose/verb#dev verb-generate-readme --global && verb
```

_Please don't edit the README directly. Any changes to the readme must be made in [.verb.md](.verb.md)._

## Running tests
Clone repository and run the following in that cloned directory

```
$ npm install && npm test
```

## Author
**Charlike Mike Reagent**

+ [github/tunnckoCore](https://github.com/tunnckoCore)
+ [twitter/tunnckoCore](http://twitter.com/tunnckoCore)
+ [codementor/tunnckoCore](https://codementor.io/tunnckoCore)

## License
Copyright © 2016, [Charlike Mike Reagent](http://i.am.charlike.online). Released under the [MIT license](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.2.0, on December 13, 2016._  
_Project scaffolded using [charlike][] cli._

[always-done]: https://github.com/hybridables/always-done
[async-done]: https://github.com/gulpjs/async-done
[base]: https://github.com/node-base/base
[charlike]: https://github.com/tunnckocore/charlike
[commitizen]: https://github.com/commitizen/cz-cli
[detect-installed]: https://github.com/tunnckocore/detect-installed
[dezalgo]: https://github.com/npm/dezalgo
[generate]: https://github.com/generate/generate
[get-installed-path]: https://github.com/tunnckocore/get-installed-path
[global-modules]: https://github.com/jonschlinkert/global-modules
[global-prefix]: https://github.com/jonschlinkert/global-prefix
[gulp]: http://gulpjs.com
[is-installed]: https://github.com/tunnckoCore/is-installed
[once]: https://github.com/isaacs/once
[resolve-from]: https://github.com/sindresorhus/resolve-from
[resolve-module]: https://github.com/jkroso/node-resolve-module
[resolve-pkg]: https://github.com/sindresorhus/resolve-pkg
[resolve]: https://github.com/substack/node-resolve
[standard-version]: https://github.com/conventional-changelog/standard-version
[verb-generate-readme]: https://github.com/verbose/verb-generate-readme
[verb]: https://github.com/verbose/verb

[downloads-url]: https://www.npmjs.com/package/resolve-package
[downloads-img]: https://img.shields.io/npm/dt/resolve-package.svg

[codeclimate-url]: https://codeclimate.com/github/tunnckoCore/resolve-package
[codeclimate-img]: https://img.shields.io/codeclimate/github/tunnckoCore/resolve-package.svg

[travis-url]: https://travis-ci.org/tunnckoCore/resolve-package
[travis-img]: https://img.shields.io/travis/tunnckoCore/resolve-package/master.svg?label=linux

[appveyor-url]: https://ci.appveyor.com/project/tunnckoCore/resolve-package
[appveyor-img]: https://img.shields.io/appveyor/ci/tunnckoCore/resolve-package/master.svg?label=windows

[coveralls-url]: https://coveralls.io/r/tunnckoCore/resolve-package
[coveralls-img]: https://img.shields.io/coveralls/tunnckoCore/resolve-package.svg

[david-url]: https://david-dm.org/tunnckoCore/resolve-package
[david-img]: https://img.shields.io/david/tunnckoCore/resolve-package.svg

[standard-url]: https://github.com/feross/standard
[standard-img]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg

