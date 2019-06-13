import { Chalk } from 'chalk'

export interface CliOptions {
  level: number
  utc?: boolean
  inline?: boolean
  compact?: boolean
  color: Chalk
}

export const parseLevel = (
  level: string,
  defaultValue: string = 'info'
): number => {
  switch (level) {
    case 'trace':
      return 10
    case 'debug':
      return 20
    case 'info':
      return 30
    case 'warn':
      return 40
    case 'error':
      return 50
    case 'fatal':
      return 60
  }
  return parseLevel(defaultValue)
}
