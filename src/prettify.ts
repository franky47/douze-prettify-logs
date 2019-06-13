import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Chalk } from 'chalk'
import { CliOptions, LogEntry } from './defs'

dayjs.extend(utc)

// --

export const parseLogEntry = (line: string): LogEntry => {
  const entry: LogEntry = JSON.parse(line)
  if (entry.v !== 1) {
    throw new Error('Unknown format')
  }
  return entry
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

// --

export const prettifyLogEntry = (entry: LogEntry, options: CliOptions) => {
  const date = formatDate(entry.time, options)
  const level = prettifyLevel(entry.level, options.color)
  const header = [
    options.color.dim(date),
    entry.instance,
    entry.commit && options.color.dim(entry.commit.slice(0, 8)),
    level.padEnd(5, ' '),
    entry.category && options.color.dim(entry.category.padEnd(5, ' ')),
    entry.level <= 20 ? options.color.dim(entry.msg) : entry.msg,
    entry.meta && options.color.dim(JSON.stringify(entry.meta))
  ]
    .filter(x => !!x)
    .join(' ')
  const rest = getExtraStuff(entry)
  return [
    header,
    Object.keys(rest).length > 0 &&
      !options.compact &&
      JSON.stringify(rest, null, options.inline ? 0 : 2)
  ]
    .filter(x => x)
    .join(options.inline ? ' ' : '\n')
}
