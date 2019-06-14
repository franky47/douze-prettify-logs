# 📜✨ `douze-prettify-logs`

[![MIT License](https://img.shields.io/github/license/franky47/douze-prettify-logs.svg?color=blue)](https://github.com/franky47/douze-prettify-logs/blob/master/LICENSE)
[![Travis CI Build](https://img.shields.io/travis/com/franky47/douze-prettify-logs.svg)](https://travis-ci.com/franky47/douze-prettify-logs)
[![Average issue resolution time](https://isitmaintained.com/badge/resolution/franky47/douze-prettify-logs.svg)](https://isitmaintained.com/project/franky47/douze-prettify-logs)
[![Number of open issues](https://isitmaintained.com/badge/open/franky47/douze-prettify-logs.svg)](https://isitmaintained.com/project/franky47/douze-prettify-logs)

NDJSON prettifier for [Pino](https://getpino.io) logs generated by [Douze](https://github.com/franky47/douze)

## Features

- 🕸️ HTTP logger
- 🌐 Timezone-aware display of times
- 🏷️ Categories

## Installation

```shell
$ yarn add -D douze-prettify-logs
# or
$ npm i -D douze-prettify-logs
```

## Usage

```shell
$ ts-node your-douze-app.ts | douze-prettify-logs
```

## CLI Options

```
$ douze-prettify-logs --help
Usage: douze-prettify-logs [options]

Options:
  -V, --version              output the version number
  -l, --level <level>        Log level (default: "info")
  -c, --category <category>  Filter by category
  -u, --utc                  Show dates as UTC rather than localized
  -i, --inline               Display extra data inline
  -q, --quiet                Don't display extra data at all
  -n, --no-color             Disable coloring of the output
  -h, --help                 output usage information
```
