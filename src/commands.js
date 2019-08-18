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

    const pwd = process.cwd();
    PROJECT_DIR = path.join(pwd, names.projectName);
    SRC_DIR = path.join(PROJECT_DIR, 'src');

    project.generateFolderStructure(names, options);

    if (options.auth) {
        route.auth(options);
    }

    console.log('- Installing dependencies');
    project.npmInstall();
}

module.exports = {
    init
};
