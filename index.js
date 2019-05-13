#!/usr/bin/env node
program = require('commander');
const util = require('./src/utility');
const commands = require('./src/commands');

const model = require('./src/model');
const route = require('./src/route/index');

XPRESSO_DIR = '';
TEMPLATE_DIR = '';
PROJECT_DIR = '';
SRC_DIR = '';
PROJECT_PACKAGE = {};
NAME_REPLACEMENTS = [];

program.version('1.2.0', '-v, --version');

program
    .command('init [name]')
    .option('-r, --repo [repo]', 'specify repository for the project')
    .option('-s, --summary [summary]', 'set the summary of the project')
    .option('-d, --dbUrl [dbUrl]', 'specify a development database url')
    .option('--no-auth', 'disables jwt authentication')
    .option('--no-refresh', 'disables rolling token refresh')
    .action((name, cmd) => {
        if (!name || name === '') {
            console.error('Provide a project name');
            process.exit(1);
        }

        util.setupEnv(name);

        let names = util.generateNames(name);

        let auth = cmd.auth;
        let refresh = cmd.refresh;
        let dbUrl = cmd.dbUrl;
        let summary = cmd.summary;
        let repo = cmd.repo;

        let options = {
            auth,
            refresh,
            dbUrl,
            summary,
            repo
        };
        commands.init(names, options);
    });

program.command('model [name]').action((name, cmd) => {
    util.checkIsXpressoProject();

    if (!name || name === '') {
        console.error('Please provide a model name');
        process.exit(1);
    }

    util.setupEnv(name);

    model.create(name);
});

program
    .command('route [name]')
    .option('-w, --websocket', 'add a websocket handler')
    .option('--no-auth', 'disables jwt authentication for the route')
    .option('--no-spec', 'disables spec file generation for this route')
    .action((name, cmd) => {
        util.checkIsXpressoProject();

        if (!name || name === '') {
            console.error('Please provide a route name');
            process.exit(1);
        }

        util.setupEnv(name);

        let auth = cmd.auth;
        let websocket = cmd.websocket;
        let spec = cmd.spec;

        let options = {
            auth,
            websocket,
            spec
        };

        console.dir(options);

        route.create(name, options);
    });

program.command('info').action(() => {
    util.setupEnv();
});

program.on('command:*', function() {
    console.error(
        'Invalid command: %s\nSee --help for a list of available commands.',
        program.args.join(' ')
    );
    process.exit(1);
});

program.parse(process.argv);
