#! /usr/bin/env node

import dotenv from 'dotenv'
import path from 'path'
import readline from 'readline'
import program from 'commander'
import chalk from 'chalk'
import { parseLogEntry, prettifyLogEntry } from './prettify'
import { CliOptions, parseLevel } from './defs'
import { levelFilter, categoryFilter } from './filters'

// --

const readVersion = () => {
  const pkg = require(path.join(__dirname, '../package.json'))
  return pkg.version
}

const readArguments = (): CliOptions => {
  program
    .name('douze-prettify-logs')
    .version(readVersion())
    .description('NDJSON prettifier for Pino logs generated by Douze.')
    .option('-l, --level <level>', 'Log level', process.env.LOG_LEVEL || 'info')
    .option('-c, --category <category>', 'Filter by category')
    .option('-u, --utc', 'Show dates as UTC rather than localized')
    .option('-i, --inline', 'Display extra data inline')
    .option('-q, --quiet', "Don't display extra data at all")
    .option('-d, --discard', 'Discard non-NDJSON lines')
    .option('-n, --no-color', 'Disable coloring of the output')
    .on('--help', () =>
      console.log(`
Examples:

  • Category filter:
    - Only show API logs:         $ douze-prettify-logs -c api
    - Only show HTTP & API logs:  $ douze-prettify-logs -c http,api
    - Ignore the DB category:     $ douze-prettify-logs -c !db
    `)
    )
    .parse(process.argv)

  return {
    level: parseLevel(program.level),
    category: program.category,
    utc: program.utc,
    inline: program.inline,
    quiet: program.quiet,
    discardNonNdjson: program.discard,
    color: new chalk.constructor({
      enabled: !program.noColor
    })
  }
}

function main() {
  dotenv.config()

  const options = readArguments()

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  })

  rl.on('line', line => {
    try {
      const entry = parseLogEntry(line)
      if (!levelFilter(entry, options.level)) {
        return
      }
      if (!categoryFilter(entry, options.category)) {
        return
      }
      const logLine = prettifyLogEntry(entry, options)
      console.log(logLine)
    } catch (error) {
      if (!options.discardNonNdjson) {
        console.log(line)
      }
    }
  })

  // Don't kill the process to prettify exit logs generated upstream
  process.once('SIGINT', () => {})
}

// --

if (require.main === module) {
  main()
}
