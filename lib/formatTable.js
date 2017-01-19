import table from 'text-table'
import prettyMs from 'pretty-ms'
import chalk from 'chalk'
import {square as barChar} from 'figures'

export default function formatTable (tableData, totalTime) {
  tableData.sort((a, b) => {
    return a[1] - b[1]
  })

  const longestTaskName = tableData.reduce((acc, row) => {
    const avg = row[1] / totalTime

    if (avg < 0.01) {
      return acc
    }

    return Math.max(acc, row[0].length)
  }, 0)

  const maxColumns = process.stdout.columns || 80
  let maxBarWidth

  if (longestTaskName > maxColumns / 2) {
    maxBarWidth = (maxColumns - 20) / 2
  } else {
    maxBarWidth = maxColumns - (longestTaskName + 20)
  }
  maxBarWidth = Math.max(0, maxBarWidth)

  function shorten (taskName) {
    const nameLength = taskName.length

    if (nameLength <= maxBarWidth) {
      return taskName
    }

    const partLength = Math.floor((maxBarWidth - 3) / 2)
    const start = taskName.substr(0, partLength + 1)
    const end = taskName.substr(nameLength - partLength)

    return `${start.trim()}...${end.trim()}`
  }

  function createBar (percentage) {
    const rounded = Math.round(percentage * 100)

    if (rounded === 0) {
      return '0%'
    }

    const barLength = Math.ceil(maxBarWidth * percentage) + 1
    const bar = new Array(barLength).join(barChar)

    return `${bar} ${rounded}%`
  }

  const tableDataProcessed = tableData.map((row) => {
    const avg = row[1] / totalTime

    if (Number.isNaN(avg) || (avg < 0.01)) {
      return null
    }

    return [shorten(row[0]), chalk.blue(prettyMs(row[1])), chalk.blue(createBar(avg))]
  }).reduce((acc, row) => {
    if (row) {
      acc.push(row)
      return acc
    }

    return acc
  }, [])

  tableDataProcessed.push([chalk.magenta('Total', prettyMs(totalTime))])

  return table(tableDataProcessed, {
    align: ['l', 'r', 'l'],
    stringLength (str) {
      return chalk.stripColor(str).length
    },
  })
}
