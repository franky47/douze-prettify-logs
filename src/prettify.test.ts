import { prettifyLevel, prettifyLogLine, getExtraStuff } from './prettify'
import chalk from 'chalk'

describe('Levels', () => {
  let colorEnabled: boolean
  beforeEach(() => {
    colorEnabled = chalk.enabled
    chalk.enabled = false
  })
  afterEach(() => {
    chalk.enabled = colorEnabled
  })

  test('uncolorized levels are all the same length', () => {
    const level10 = prettifyLevel(10)
    const level20 = prettifyLevel(20)
    const level30 = prettifyLevel(30)
    const level40 = prettifyLevel(40)
    const level50 = prettifyLevel(50)
    const level60 = prettifyLevel(60)
    expect(level20.length).toEqual(level10.length)
    expect(level30.length).toEqual(level10.length)
    expect(level40.length).toEqual(level10.length)
    expect(level50.length).toEqual(level10.length)
    expect(level60.length).toEqual(level10.length)
  })

  test('out of range', () => {
    const levelLow = prettifyLevel(0)
    expect(levelLow).toEqual('trace')
    const levelNeg = prettifyLevel(-12)
    expect(levelNeg).toEqual('trace')
    const levelHigh = prettifyLevel(1000)
    expect(levelHigh).toEqual('FATAL')
  })
})

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

describe('prettifyLogLine', () => {
  test('non-JSON line is passed through unchanged', () => {
    const expected = 'not a JSON string'
    const received = prettifyLogLine(expected)
    expect(received).toEqual(expected)
  })

  test('non-Pino JSON lines are passed through unchanged', () => {
    const expected = '{"hello":"world"}'
    const received = prettifyLogLine(expected)
    expect(received).toEqual(expected)
  })

  test('minimal log line should contain the date as ISO-8601', () => {
    const logLine = '{"v":1,"time":1560370115565}'
    const received = prettifyLogLine(logLine)
    expect(received).toMatch('2019-06-12 20:08:35.565Z')
    expect(received.split('\n').length).toEqual(1)
  })

  test('log line should contain the instance name', () => {
    const logLine = '{"v":1,"time":1560370115565,"instance":"foo.bar.egg"}'
    const received = prettifyLogLine(logLine)
    expect(received).toMatch('foo.bar.egg')
    expect(received.split('\n').length).toEqual(1)
  })

  test('log line should contain the git commit ID', () => {
    const logLine = '{"v":1,"time":1560370115565,"commit":"12345678"}'
    const received = prettifyLogLine(logLine)
    expect(received).toMatch('12345678')
    expect(received.split('\n').length).toEqual(1)
  })

  test('log line should contain the level name', () => {
    const logLine = '{"v":1,"time":1560370115565,"level":30}'
    const received = prettifyLogLine(logLine)
    expect(received).toMatch('info')
    expect(received.split('\n').length).toEqual(1)
  })

  test('log line should contain the category', () => {
    const logLine = '{"v":1,"time":1560370115565,"category":"foo"}'
    const received = prettifyLogLine(logLine)
    expect(received).toMatch('foo')
    expect(received.split('\n').length).toEqual(1)
  })

  test('log line should contain the message', () => {
    const logLine = '{"v":1,"time":1560370115565,"msg":"Hello, World !"}'
    const received = prettifyLogLine(logLine)
    expect(received).toMatch('Hello, World !')
    expect(received.split('\n').length).toEqual(1)
  })

  test('log line should contain metadata', () => {
    const logLine = '{"v":1,"time":1560370115565,"meta":{"hello":"world"}}'
    const received = prettifyLogLine(logLine)
    expect(received).toMatch('{"hello":"world"}')
    expect(received).not.toMatch('meta')
    expect(received.split('\n').length).toEqual(1)
  })

  test('log lines with extra stuff should be expanded', () => {
    const logLine = '{"v":1,"time":1560370115565,"extra":"stuff"}'
    const received = prettifyLogLine(logLine)
    expect(received.split('\n').length).toBeGreaterThan(1)
    expect(received.split('\n').length).toBeLessThanOrEqual(4)
    expect(received).toMatch('"extra": "stuff"')
  })
})
