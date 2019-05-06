#!/usr/bin/env node
program = require('commander');
const path = require('path');
const util = require('./src/utility');
const commands = require('./src/commands');

const model = require('./src/model');

XPRESSO_DIR = '';
TEMPLATE_DIR = '';
PROJECT_DIR = '';
PROJECT_PACKAGE = '';
SRC_DIR = '';

program.version('1.10.0', '-v, --version');

program
    .command('init [name]')
    .option('-r, --repo [repo]', 'specify repository for the project')
    .option('-s, --summary [summary]', 'set the summary of the project')
    .option('-d, --dbUrl [dbUrl]', 'specify a development database url')
    .option('--firebase', 'enable firebase deployment for functions')
    .option('--no-auth', 'disables jwt authentication')
    .option('--no-refresh', 'disables rolling token refresh')
    .action((name, cmd) => {
        if (!name || name === '') {
            console.error('Provide a project name');
            process.exit(1);
        }

        let names = util.generateNames(name);

        let auth = cmd.auth;
        let refresh = cmd.refresh;
        let dbUrl = cmd.dbUrl;
        let summary = cmd.summary;
        let repo = cmd.repo;
        let firebase = cmd.firebase;

        let options = {
            auth,
            refresh,
            dbUrl,
            summary,
            repo,
            firebase
        };
        commands.init(names, options);
    });

program
    .command('i [name]')
    .option('-r, --repo [repo]', 'specify repository for the project')
    .option('-s, --summary [summary]', 'set the summary of the project')
    .option('-d, --dbUrl [dbUrl]', 'specify a development database url')
    .option('--firebase', 'enable firebase deployment for functions')
    .option('--no-auth', 'disables jwt authentication')
    .option('--no-refresh', 'disables rolling token refresh')
    .action((name, cmd) => {
        if (!name || name === '') {
            console.error('Provide a project name');
            process.exit(1);
        }

        let names = util.generateNames(name);

        let auth = cmd.auth;
        let refresh = cmd.refresh;
        let dbUrl = cmd.dbUrl;
        let summary = cmd.summary;
        let repo = cmd.repo;
        let firebase = cmd.firebase;

        let options = {
            auth,
            refresh,
            dbUrl,
            summary,
            repo,
            firebase
        };
        commands.init(names, options);
    });

program
    .command('generate [name]')
    .option('-w, --websocket', 'add a websocket handler')
    .option('--no-auth', 'disables jwt authentication for the route')
    .action((name, cmd) => {
        if (!name || name === '') {
            console.error('Provide a project name');
            process.exit(1);
        }

        let names = util.generateNames(name);

        let auth = cmd.auth;
        let websocket = cmd.websocket;
        commands.generate(names, {
            auth,
            websocket
        });
    });

program
    .command('g [name]')
    .option('-w, --websocket', 'add a websocket handler')
    .option('--no-auth', 'disables jwt authentication for the route')
    .action((name, cmd) => {
        if (!name || name === '') {
            console.error('Provide a project name');
            process.exit(1);
        }

        let names = util.generateNames(name);

        let auth = cmd.auth;
        let websocket = cmd.websocket;
        commands.generate(names, {
            auth,
            websocket
        });
    });

program.command('model [name]').action((name, cmd) => {
    util.setupEnv();
    if (!name || name === '') {
        console.error('Please provide a model name');
        process.exit(1);
    }

    model.create(name);
});

program.command('info').action(() => {
    const isXpressoProject = util.isXpressoProject();
    console.log('Current Working Directory:', process.cwd());
    console.log('Project Directory:', PROJECT_DIR);
    console.log('Xpresso Project:', isXpressoProject);
});

program.on('command:*', function() {
    console.error(
        'Invalid command: %s\nSee --help for a list of available commands.',
        program.args.join(' ')
    );
    process.exit(1);
});

program.parse(process.argv);
