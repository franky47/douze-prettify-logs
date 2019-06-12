import chalk from 'chalk'

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

export const prettifyLevel = (level: number): string => {
  if (level <= 10) return chalk.dim('trace')
  if (level <= 20) return chalk.magenta('debug')
  if (level <= 30) return chalk.blue('info ')
  if (level <= 40) return chalk.yellow('WARN ')
  if (level <= 50) return chalk.red('ERROR')
  return chalk.redBright('FATAL')
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

export const prettifyLogLine = (line: string) => {
  let object: LogEntry
  try {
    object = JSON.parse(line)
    if (object.v !== 1) {
      throw new Error('Unknown format')
    }

    const date = new Date(object.time).toISOString().replace('T', ' ')
    const level = prettifyLevel(object.level)
    const header = [
      chalk.dim(date),
      object.instance,
      object.commit && chalk.dim(object.commit.slice(0, 8)),
      level.padEnd(5, ' '),
      object.category && chalk.dim(object.category.padEnd(5, ' ')),
      object.level <= 20 ? chalk.dim(object.msg) : object.msg,
      object.meta && chalk.dim(JSON.stringify(object.meta))
    ]
      .filter(x => !!x)
      .join(' ')
    const rest = getExtraStuff(object)
    return [
      header,
      Object.keys(rest).length > 0 && JSON.stringify(rest, null, 2)
    ]
      .filter(x => x)
      .join('\n')
  } catch (error) {
    return line
  }
}
