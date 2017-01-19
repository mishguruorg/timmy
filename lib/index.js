import Module from 'module'
import resolve from 'resolve'
import caller from 'caller'
import fs from 'fs'
import path from 'path'
import findPackageJSON from 'find-package-json'

import formatTable from './formatTable'

const MODULE_REQUIRE = Module.prototype.require

const createTimer = () => {
  const time = process.hrtime()
  return () => {
    const diff = process.hrtime(time)
    return (diff[0] * 1e3) + (diff[1] / 1e6)
  }
}

const resolveModulePath = (modulePath, context) => {
  try {
    const basedir = path.dirname(context)
    const resolvedPath = resolve.sync(modulePath, {basedir})
    const realPath = fs.realpathSync(resolvedPath)
    return realPath
  } catch (err) {
    // probably a native module, such as 'fs'
    return modulePath
  }
}

function createTimmy () {
  const stats = new Map()

  let getTotalDuration = createTimer()
  let minDuration = 100

  Module.prototype.require = function require (modulePath) {
    const getDuration = createTimer()
    const result = MODULE_REQUIRE.apply(this, arguments)
    const duration = getDuration()

    if (duration > minDuration) {
      stats.set([modulePath, caller(2)], duration)
    }

    return result
  }

  return {
    restoreRequire () {
      Module.prototype.require = MODULE_REQUIRE
    },

    resetTimer () {
      getTotalDuration = createTimer()
    },

    setMinDuration (time) {
      minDuration = time
    },

    printStats (cwd = caller()) {
      const packagePath = findPackageJSON(cwd).next().value.__path
      const rootPath = path.dirname(packagePath)

      const tableData = []
      const total = getTotalDuration()

      for (const [[modulePath, context], duration] of stats) {
        const resolvedPath = resolveModulePath(modulePath, context)

        let prettyPath = path.relative(rootPath, resolvedPath)

        if (/node_modules\//.test(prettyPath)) {
          prettyPath = prettyPath.replace(/^.*node_modules\//, '~ ')
        }

        tableData.push([prettyPath, duration])
      }

      console.log(formatTable(tableData, total))
    },
  }
}

export default createTimmy()
