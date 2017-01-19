#!/usr/bin/env node

const path = require('path')
const flags = require('flags')
const resolve = require('resolve')

flags.defineString('package', null, 'Name of a package')
flags.defineString('file', null, 'Path to a file')
flags.defineBoolean('quiet', null, 'Only prints the total time')
flags.parse()

const packagePath = flags.get('package')
const filePath = flags.get('file')
const quiet = flags.get('quiet')

const cwd = process.cwd()

let modulePath = null

if (packagePath != null) {
  modulePath = resolve.sync(packagePath, {basedir: cwd})
} else if (filePath != null) {
  modulePath = path.join(cwd, filePath)
} else {
  throw new Error('Must specify --package or --file')
}

const {default: timmy} = require('../dist')

if (quiet) {
  timmy.restoreRequire()
  timmy.resetTimer()
}

require(modulePath)

timmy.printStats(modulePath)
