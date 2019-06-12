import readline from 'readline'
import { prettifyLogLine } from './prettify'

function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  })

  rl.on('line', function(line) {
    console.log(prettifyLogLine(line))
  })
}

if (require.main === module) {
  main()
}
