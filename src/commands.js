const path = require('path');
const util = require('./utility');
const project = require('./project');
const route = require('./route');

function init(name, options) {
    if (!name || name === '') {
        console.error('Provide a project name');
        process.exit(1);
    }
    if (options.dbUrl && !options.dbUrl.match(/^mongodb:\/\/.+/)) {
        console.log('Incorrect mongodb uri');
        process.exit(1);
    }
    if (util.isXpressoProject()) {
        console.error('Cannot create project inside a project');
        process.exit(1);
    }

    project
        .generateFolderStructure(name, options)
        .then(projectDir => {
            PROJECT_DIR = projectDir;
            SRC_DIR = path.join(PROJECT_DIR, 'src');

            if (options.auth) {
                route.auth(options);
            }

            console.log('- Installing dependencies')
            project.npmInstall();
        })
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

function generate(name, options) {
    if (!util.isXpressoProject()) {
        console.error('Not inside an xpresso project');
        process.exit(1);
    }

    PROJECT_DIR = util.getProjectDirectoryPath();
    SRC_DIR = path.join(PROJECT_DIR, 'src');
    route.generate(name, options);
}

module.exports = {
    init,
    generate
};
