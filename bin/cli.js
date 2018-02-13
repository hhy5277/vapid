#!/usr/bin/env node

const path = require('path')
const program = require('commander')
const repl = require('repl')

const env = process.env.NODE_ENV || 'development'
const pjson = require('../package.json')
const Console = require('../lib/console')
const Server = require('../lib/server')
const Site = require('../lib/site')
const Logger = require('../lib/logger')

function actionHandler(fn) {
  return (target) => {
    let sitePath = typeof target == 'string' ? target : '.'
    let site = new Site(sitePath)

    try {
      fn(site)
    } catch (err) {
      Logger.error(err)
    }
  }
}

// NEW
program
  .command('new <target>')
  .description('create a new project')
  .action(actionHandler(site => {
    site.localInitialize()
    Logger.info(`Project created.`)
    Logger.extra([
      'To start the development server now, run:',
      `  ${pjson.name} server ${site.localPath}`
    ])
  }))

// SERVER
program
  .command('server')
  .description('start the server')
  .action(actionHandler(site => {
    // TODO: Options for livereload, port, bind, etc?
    const server = new Server(site, { livereload: env == 'development' })
     
    Logger.info(`Starting the ${env} server...`)
    server.start()
    Logger.extra([
      `View your site at http://localhost:${server.port}`,
      'Ctrl + C to quit'
    ]);
  }))

// CONSOLE
program
  .command('console')
  .description('start the interactive console')
  .action(actionHandler(site => {
    Logger.info(`Loading the ${env} environment`)
    Logger.extra([
      'Type .exit to quit'
    ]);

    const c = new Console(site)
    c.start()
  }))

// DEPLOY
program
  .command('deploy')
  .description('deploy to Vapid\'s hosting service')
  .action(actionHandler(site => {
    Logger.info(`DEPLOY`)
  }))

// VERSION
program
  .command('version')
  .description('shows the version number')
  .action(target => {
    Logger.extra(`Vapid ${program.version()}`)
  })

// CATCH-ALL
program
  .command('*', { noHelp: true })
  .action(() => {
    Logger.error(`Command "${process.argv[2]}" not found.`)
    program.help()
  })

if (process.argv.slice(2).length) {
  program
    .version(pjson.version)
    .parse(process.argv)
} else {
  program.help()
}
