import test from 'ava'

import timmy from '../lib'

test('printStats', () => {
  require('uuid')
  timmy.printStats()
})
