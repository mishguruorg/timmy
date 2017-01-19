#!/usr/bin/env node

const path = require('path')

const modulePath = path.join(process.cwd(), process.argv[2])

const {default: timmy} = require('../dist')

require(modulePath)

timmy.printStats()
