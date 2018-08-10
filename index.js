#!/usr/bin/env node
program = require('commander');
const path = require('path');
const util = require('./src/utility');
const commands = require('./src/commands');

XPRESSO_DIR = util.getXpressoDirectory();
TEMPLATE_DIR = path.join(XPRESSO_DIR, 'templates');
PROJECT_DIR = '';
PROJECT_PACKAGE = '';
SRC_DIR = '';

program.version('0.0.1', '-v, --version');

program
    .command('init [name]')
    .option('-r, --repo')
    .option('-s, --summary')
    .option('--no-auth')
    .action((name, cmd) => {
        let auth = cmd.auth;
        commands.init(name, {
            auth
        });
    });

program
    .command('i [name]')
    .option('-r, --repo')
    .option('-s, --summary')
    .option('--no-auth')
    .action((name, cmd) => {
        let auth = cmd.auth;
        commands.init(name, {
            auth
        });
    });

program
    .command('generate [name]')
    .option('-w, --websocket')
    .option('--no-auth')
    .action((name, cmd) => {
        let auth = cmd.auth;
        let websocket = cmd.websocket;
        commands.generate(name, {
            auth,
            websocket
        });
    });

program
    .command('g [name]')
    .option('-w, --websocket')
    .option('--no-auth')
    .action((name, cmd) => {
        let auth = cmd.auth;
        let websocket = cmd.websocket;
        commands.generate(name, {
            auth,
            websocket
        });
    });

program.parse(process.argv);
