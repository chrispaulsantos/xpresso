const path = require('path');
const util = require('./utility');
const project = require('./project');
const route = require('./route');

function init(names, options) {
    if (options.dbUrl && !options.dbUrl.match(/^mongodb:\/\/.+/)) {
        console.log('Incorrect mongodb uri');
        process.exit(1);
    }
    if (util.isXpressoProject()) {
        console.error('Cannot create project inside a project');
        process.exit(1);
    }

    project
        .generateFolderStructure(names, options)
        .then(projectDir => {
            PROJECT_DIR = projectDir;
            SRC_DIR = path.join(PROJECT_DIR, 'src');

            if (options.auth) {
                route.auth(options);
            }

            console.log('- Installing dependencies');
            project.npmInstall();

            if (options.firebase) {
                project.enableFirebase();
            }
        })
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

function generate(names, options) {
    if (!util.isXpressoProject()) {
        console.error('Not inside an xpresso project');
        process.exit(1);
    }

    PROJECT_DIR = util.getProjectDirectoryPath();
    SRC_DIR = path.join(PROJECT_DIR, 'src');
    route.generate(names, options);
}

function test() {
    project.enableFirebase();
}

module.exports = {
    init,
    generate,
    test
};
