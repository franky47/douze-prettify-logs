import { Chalk } from 'chalk'

export interface CliOptions {
  level: number
  category?: string
  utc?: boolean
  inline?: boolean
  quiet?: boolean
  discardNonNdjson?: boolean
  color: Chalk
}

export const parseLevel = (level: string): number => {
  switch (level) {
    case 'trace':
      return 10
    case 'debug':
      return 20
    default:
    case 'info':
      return 30
    case 'warn':
      return 40
    case 'error':
      return 50
    case 'fatal':
      return 60
  }
}

// --

export interface LogEntry {
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
