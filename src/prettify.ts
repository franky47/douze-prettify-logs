import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Chalk } from 'chalk'
import { CliOptions } from './defs'

dayjs.extend(utc)

interface LogEntry {
  // Pino fields
  v: 1
  level: number
  msg: string
  time: number
  name: string

  // Douze-specific
  category?: string
  instance: string
  commit?: string
  meta?: {
    [key: string]: any
  }

  [extra: string]: any
}

// --

export const prettifyLevel = (level: number, color: Chalk): string => {
  if (level <= 10) return color.dim('trace')
  if (level <= 20) return color.magenta('debug')
  if (level <= 30) return color.blue('info ')
  if (level <= 40) return color.yellow('WARN ')
  if (level <= 50) return color.red('ERROR')
  return color.redBright('FATAL')
}

// --

export const getExtraStuff = (entry: LogEntry): object => {
  const {
    v,
    level,
    msg,
    time,
    name,
    category,
    instance,
    commit,
    meta,
    ...rest
  } = entry
  return rest
}

// --

export const formatDate = (time: number, options: CliOptions): string => {
  let date: string
  if (options.utc) {
    date = dayjs(time)
      .utc()
      .local()
      .toISOString()
  } else {
    date = dayjs(time).format('YYYY-MM-DD HH:mm:ss.SSS')
  }
  return date.replace('T', ' ')
}

export const prettifyLogLine = (line: string, options: CliOptions) => {
  let object: LogEntry
  try {
    object = JSON.parse(line)
    if (object.v !== 1) {
      throw new Error('Unknown format')
    }
    if (object.level < options.level) {
      return null
    }

    const date = formatDate(object.time, options)
    const level = prettifyLevel(object.level, options.color)
    const header = [
      options.color.dim(date),
      object.instance,
      object.commit && options.color.dim(object.commit.slice(0, 8)),
      level.padEnd(5, ' '),
      object.category && options.color.dim(object.category.padEnd(5, ' ')),
      object.level <= 20 ? options.color.dim(object.msg) : object.msg,
      object.meta && options.color.dim(JSON.stringify(object.meta))
    ]
      .filter(x => !!x)
      .join(' ')
    const rest = getExtraStuff(object)
    return [
      header,
      Object.keys(rest).length > 0 &&
        !options.compact &&
        JSON.stringify(rest, null, options.inline ? 0 : 2)
    ]
      .filter(x => x)
      .join(options.inline ? ' ' : '\n')
  } catch (error) {
    return line
  }
}
