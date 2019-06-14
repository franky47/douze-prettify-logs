import { LogEntry } from './defs'
import { levelFilter, categoryFilter } from './filters'

const defaultLogEntry: LogEntry = {
  v: 1,
  time: 1560370115565,
  level: 30,
  msg: 'Hello, World !',
  name: 'test',
  instance: 'foo.bar.egg'
}

describe('Filters', () => {
  describe('levelFilter', () => {
    test('no specified level always passes', () => {
      const entry: LogEntry = {
        ...defaultLogEntry,
        level: -42
      }
      const received = levelFilter(entry)
      expect(received).toBe(true)
    })

    test('level higher than config should pass', () => {
      const received = levelFilter(defaultLogEntry, 20)
      expect(received).toBe(true)
    })

    test('level equal to config should pass', () => {
      const received = levelFilter(defaultLogEntry, 30)
      expect(received).toBe(true)
    })

    test('level lower than config should be blocked', () => {
      const received = levelFilter(defaultLogEntry, 50)
      expect(received).toBe(false)
    })
  })

  // --

  describe('categoryFilter', () => {
    test('no specified category always passes', () => {
      const entry: LogEntry = {
        ...defaultLogEntry
      }
      let received = categoryFilter(entry)
      expect(received).toBe(true)
      received = categoryFilter({ ...entry, category: 'foo' })
      expect(received).toBe(true)
    })

    test('missing category in log entry is rejected', () => {
      const entry: LogEntry = {
        ...defaultLogEntry,
        category: 'foo'
      }
      let received = categoryFilter(entry)
      expect(received).toBe(true)
      received = categoryFilter({ ...entry, category: 'foo' })
      expect(received).toBe(true)
    })

    test('matching single category', () => {
      const matchingFoo = categoryFilter(
        { ...defaultLogEntry, category: 'foo' },
        'foo'
      )
      expect(matchingFoo).toBe(true)
      const matchingBar = categoryFilter(
        { ...defaultLogEntry, category: 'bar' },
        'foo'
      )
      expect(matchingBar).toBe(false)
    })

    test('matching multiple categories', () => {
      const matchingFoo = categoryFilter(
        { ...defaultLogEntry, category: 'foo' },
        'foo,bar'
      )
      expect(matchingFoo).toBe(true)
      const matchingBar = categoryFilter(
        { ...defaultLogEntry, category: 'bar' },
        'foo,bar'
      )
      expect(matchingBar).toBe(true)
      const matchingEgg = categoryFilter(
        { ...defaultLogEntry, category: 'egg' },
        'foo,bar'
      )
      expect(matchingEgg).toBe(false)
    })

    test('matching is case-insensitive', () => {
      const received = categoryFilter(
        { ...defaultLogEntry, category: 'foo' },
        'FOO'
      )
      expect(received).toBe(true)
    })

    test('exclude category', () => {
      const matchingFoo = categoryFilter(
        { ...defaultLogEntry, category: 'foo' },
        '!foo'
      )
      expect(matchingFoo).toBe(false)
      const matchingBar = categoryFilter(
        { ...defaultLogEntry, category: 'bar' },
        '!foo'
      )
      expect(matchingBar).toBe(true)
      const matchingEgg = categoryFilter(
        { ...defaultLogEntry, category: 'egg' },
        '!foo,egg'
      )
      expect(matchingEgg).toBe(true)
    })
  })
})
