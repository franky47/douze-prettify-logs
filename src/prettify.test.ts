import chalk from 'chalk'
import {
  parseLogEntry,
  prettifyLogEntry,
  prettifyLevel,
  getExtraStuff,
  formatDate,
  generateHttpMessage
} from './prettify'
import { CliOptions, LogEntry } from './defs'

const options: CliOptions = {
  color: new chalk.constructor({ enabled: false }),
  level: 30
}

const defaultLogEntry: LogEntry = {
  v: 1,
  time: 1560370115565,
  level: 30,
  msg: 'Hello, World !',
  name: 'test',
  instance: 'foo.bar.egg'
}

describe('parseLogEntry', () => {
  test('empty string', () => {
    const run = () => parseLogEntry('')
    expect(run).toThrowError()
  })

  test('non-JSON line', () => {
    const run = () => parseLogEntry('not a JSON string')
    expect(run).toThrowError()
  })

  test('non-Pino JSON object', () => {
    const run = () => parseLogEntry('{"hello":"world"}')
    expect(run).toThrowError()
  })

  test('minimal log line', () => {
    const received = parseLogEntry('{"v":1,"time":1560370115565}')
    expect(received.time).toEqual(1560370115565)
  })
})

// --

describe('Date', () => {
  // Test disabled while there is no good way to mock timezones in dayjs
  // see https://github.com/iamkun/dayjs/pull/325
  // test('default option should use local time', () => {
  //   // Override UTC offset
  //   const received = formatDate(1560370115565, options)
  //   const expected = '2019-06-12 22:08:35.565'
  //   expect(received).toEqual(expected)
  // })

  test('passing utc=true should display the value as UTC', () => {
    const received = formatDate(1560370115565, { ...options, utc: true })
    const expected = '2019-06-12 20:08:35.565Z'
    expect(received).toEqual(expected)
  })
})

// --

describe('Levels', () => {
  test('uncolorized levels are all the same length', () => {
    const level10 = prettifyLevel(10, options.color)
    const level20 = prettifyLevel(20, options.color)
    const level30 = prettifyLevel(30, options.color)
    const level40 = prettifyLevel(40, options.color)
    const level50 = prettifyLevel(50, options.color)
    const level60 = prettifyLevel(60, options.color)
    expect(level20.length).toEqual(level10.length)
    expect(level30.length).toEqual(level10.length)
    expect(level40.length).toEqual(level10.length)
    expect(level50.length).toEqual(level10.length)
    expect(level60.length).toEqual(level10.length)
  })

  test('out of range', () => {
    const levelLow = prettifyLevel(0, options.color)
    expect(levelLow).toEqual('trace')
    const levelNeg = prettifyLevel(-12, options.color)
    expect(levelNeg).toEqual('trace')
    const levelHigh = prettifyLevel(1000, options.color)
    expect(levelHigh).toEqual('FATAL')
  })
})

// --

describe('getExtraStuff', () => {
  test('no other properties', () => {
    const received = getExtraStuff({
      v: 1,
      name: 'foo',
      level: 42,
      msg: 'hello',
      time: 1234567890,
      instance: 'test'
    })
    expect(received).toEqual({})
  })

  test('other properties are returned', () => {
    const received = getExtraStuff({
      v: 1,
      name: 'foo',
      level: 42,
      msg: 'hello',
      time: 1234567890,
      instance: 'test',
      foo: 'bar',
      egg: 'spam'
    })
    expect(received).toEqual({
      foo: 'bar',
      egg: 'spam'
    })
  })
})

// --

describe('generateHttpMessage', () => {
  const color = chalk.constructor({ enabled: false })

  test('with content-length', () => {
    const entry: LogEntry = {
      ...defaultLogEntry,
      msg: 'request completed',
      req: {
        url: '/foo/bar'
      },
      res: {
        statusCode: 123,
        headers: {
          'content-length': 42
        }
      },
      responseTime: 12
    }
    const received = generateHttpMessage(entry, color)
    const expected = '123 /foo/bar 12 ms - 42 bytes'
    expect(received).toEqual(expected)
  })

  test('without content-length', () => {
    const entry: LogEntry = {
      ...defaultLogEntry,
      msg: 'request completed',
      req: {
        url: '/foo/bar'
      },
      res: {
        statusCode: 123
      },
      responseTime: 12
    }
    const received = generateHttpMessage(entry, color)
    const expected = '123 /foo/bar 12 ms'
    expect(received).toEqual(expected)
  })

  test('missing trigger message returns original message', () => {
    const entry: LogEntry = {
      ...defaultLogEntry,
      req: {
        url: '/foo/bar'
      },
      res: {
        statusCode: 123
      },
      responseTime: 12
    }
    const received = generateHttpMessage(entry, color)
    const expected = defaultLogEntry.msg
    expect(received).toEqual(expected)
  })

  test('missing request object returns original message', () => {
    const entry: LogEntry = {
      ...defaultLogEntry,
      msg: 'request completed',
      res: {
        statusCode: 123
      },
      responseTime: 12
    }
    const received = generateHttpMessage(entry, color)
    const expected = 'request completed'
    expect(received).toEqual(expected)
  })

  test('missing response object returns original message', () => {
    const entry: LogEntry = {
      ...defaultLogEntry,
      msg: 'request completed',
      req: {
        url: '/foo/bar'
      },
      responseTime: 12
    }
    const received = generateHttpMessage(entry, color)
    const expected = 'request completed'
    expect(received).toEqual(expected)
  })

  test('missing response time', () => {
    const entry: LogEntry = {
      ...defaultLogEntry,
      msg: 'request completed',
      req: {
        url: '/foo/bar'
      },
      res: {
        statusCode: 123,
        headers: {
          'content-length': 42
        }
      }
    }
    const received = generateHttpMessage(entry, color)
    const expected = '123 /foo/bar - 42 bytes'
    expect(received).toEqual(expected)
  })
})

// --

describe('prettifyLogEntry', () => {
  test('log line should contain the date as ISO-8601', () => {
    const received = prettifyLogEntry(defaultLogEntry, {
      ...options,
      utc: true
    })
    expect(received).toMatch('2019-06-12 20:08:35.565Z')
    expect(received.split('\n').length).toEqual(1)
  })

  test('log line should contain the instance name', () => {
    const received = prettifyLogEntry(defaultLogEntry, options)
    expect(received).toMatch('foo.bar.egg')
    expect(received.split('\n').length).toEqual(1)
  })

  test('log line should contain the level name', () => {
    const received = prettifyLogEntry(defaultLogEntry, options)
    expect(received).toMatch('info')
    expect(received.split('\n').length).toEqual(1)
  })

  test('log line should contain the message', () => {
    const received = prettifyLogEntry(defaultLogEntry, options)
    expect(received).toMatch('Hello, World !')
    expect(received.split('\n').length).toEqual(1)
  })

  test('log line should contain the category', () => {
    const entry: LogEntry = { ...defaultLogEntry, category: '41IWygsCU' }
    const received = prettifyLogEntry(entry, options)
    expect(received).toMatch('41IWygsCU')
    expect(received.split('\n').length).toEqual(1)
  })

  test('log line should contain the git commit ID', () => {
    const entry: LogEntry = { ...defaultLogEntry, commit: '12345678' }
    const received = prettifyLogEntry(entry, options)
    expect(received).toMatch('12345678')
    expect(received.split('\n').length).toEqual(1)
  })

  test('log line should contain metadata', () => {
    const entry: LogEntry = { ...defaultLogEntry, meta: { hello: 'world' } }
    const received = prettifyLogEntry(entry, options)
    expect(received).toMatch('{"hello":"world"}')
    expect(received).not.toMatch('meta')
    expect(received.split('\n').length).toEqual(1)
  })

  test('log lines with extra stuff should be expanded', () => {
    const entry: LogEntry = { ...defaultLogEntry, extra: 'stuff' }
    const received = prettifyLogEntry(entry, options)
    expect(received.split('\n').length).toBeGreaterThan(1)
    expect(received.split('\n').length).toBeLessThanOrEqual(4)
    expect(received).toMatch('"extra": "stuff"')
  })
})
