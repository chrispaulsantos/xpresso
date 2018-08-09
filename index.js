#!/usr/bin/env node
program = require('commander');
const path = require('path');
const util = require('./src/utility');
const project = require('./src/project');
const route = require('./src/route');

XPRESSO_DIR = util.getXpressoDirectory();
TEMPLATE_DIR = path.join(XPRESSO_DIR, 'templates');
PROJECT_DIR = '';
PROJECT_PACKAGE = '';
SRC_DIR = '';

program
    .arguments('<cmd> [name]')
    .option('-r, --repo [repo]', 'git repository for the project')
    .option('-s, --summary [summary]', 'summary of the project')
    .option('-a, --auth', 'add jwt authentication to the project/route')
    .option('-w, --websocket', 'add a websocket route on get all')
    .action((command, name) => {
        if (command === 'init' || command === 'i') {
            if (util.getProjectDirectoryPath()) {
                console.error('Cannot crate project inside a project');
                process.exit(1);
            }
            if (!name || name === '') {
                console.error('Please provide a project name');
                process.exit(1);
            }
            project
                .generateFolderStructure(name)
                .then(projectDir => {
                    PROJECT_DIR = projectDir;
                    SRC_DIR = path.join(PROJECT_DIR, 'src');

                    if (program.auth) {
                        route.auth();
                    }

                    project.npmInstall();
                })
                .catch(err => {
                    console.error(err);
                    process.exit(1);
                });
        } else if (command === 'generate' || command === 'g') {
            PROJECT_DIR = util.getProjectDirectory();
            SRC_DIR = path.join(PROJECT_DIR, 'src');
            route.generate(name, {
                auth: program.auth,
                websocket: program.websocket
            });
        } else if (command === 'test') {
            PROJECT_DIR = util.getProjectDirectory();
            SRC_DIR = path.join(PROJECT_DIR, 'src');
        } else {
            console.error(
                'Usage: xpresso <i/init | g/generate> <name> [options]'
            );
            process.exit(1);
        }
    })
    .parse(process.argv);
