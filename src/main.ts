#! /usr/bin/env node

import fs from 'fs'
import path from 'path'
import readline from 'readline'
import program from 'commander'
import chalk from 'chalk'
import { parseLogEntry, prettifyLogEntry } from './prettify'
import { CliOptions, parseLevel } from './defs'

// --

const readVersion = () => {
  const pkg = require(path.join(__dirname, '../package.json'))
  return pkg.version
}

const readArguments = (): CliOptions => {
  program
    .name('douze-prettify-logs')
    .version(readVersion())
    .option('-l, --level <level>', 'Log level', 'info')
    .option('-u, --utc', 'Show dates as UTC rather than localized')
    .option('-i, --inline', 'Display extra data inline')
    .option('-c, --compact', "Don't display extra data at all")
    .option('-n, --no-color', 'Disable coloring of the output')
    .parse(process.argv)

  return {
    level: parseLevel(program.level),
    utc: program.utc,
    inline: program.inline,
    compact: program.compact,
    color: new chalk.constructor({
      enabled: !program.noColor
    })
  }
}

function main() {
  const options = readArguments()

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  })

  rl.on('line', line => {
    try {
      const entry = parseLogEntry(line)
      if (entry.level < options.level) {
        return
      }
      const logLine = prettifyLogEntry(entry, options)
      console.log(logLine)
    } catch (error) {
      console.log(line)
    }
  })

  // Don't kill the process to prettify exit logs generated upstream
  process.once('SIGINT', () => {})
}

// --

if (require.main === module) {
  main()
}
