const child_process = require('child_process');
const fs = require('fs-extra');
const _ = require('lodash');
const path = require('path');
const util = require('./utility');

/* GENERATE THE INITIAL PROJECT STRUCTURE */
function generateFolderStructure(names, options) {
    if (util.isXpressoProject()) {
        console.error('Cannot initialize a project inside another project');
        process.exit(1);
    }

    console.log('- Creating project directory');
    // Make project directory
    console.log(PROJECT_DIR);
    fs.mkdirSync(PROJECT_DIR);

    // Copy project structure
    const projectTemplateStructurePath = path.join(TEMPLATE_DIR, 'project');

    console.log('- Copying default template structure');
    fs.copySync(projectTemplateStructurePath, PROJECT_DIR);

    util.getFiles(PROJECT_DIR)
        .sort()
        .forEach(file => {
            console.log(file);
        });

    console.log('- Creating remaining folders');
    const folders = ['routes', 'database/schema'];
    folders.forEach(folder => {
        let folderPath = path.join(SRC_DIR, folder);
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(folderPath);
    });

    console.log('- Updating package parameters');
    // Get package path
    const packagePath = path.join(PROJECT_DIR, 'package.json');

    // Update properties in package.json
    let data = fs.readFileSync(packagePath);

    let json = JSON.parse(data.toString());
    json.name = names.projectPackageName.toLowerCase();

    // Check options
    if (options.repo && options.repo !== '') {
        json.repository = options.repo;
    } else {
        json.repository = '';
    }

    if (options.summary && options.summary !== '') {
        json.description = options.summary;
    } else {
        json.description = '';
    }

    fs.writeFileSync(packagePath, JSON.stringify(json));
    console.log(packagePath);

    console.log('- Updating database parameters');
    // Get database connection file path
    const databasePath = path.join(PROJECT_DIR, 'src/database/index.ts');
    let template = fs.readFileSync(databasePath).toString();

    let replacements = [
        {
            key: /{{databaseName}}/g,
            with: names.projectPackageName.toLowerCase()
        },
        {
            key: /{{databaseUrl}}/g,
            with: options.dbUrl ? options.dbUrl : 'mongodb://localhost:27017'
        }
    ];

    util.writeTemplate(template, databasePath, replacements);
}

function npmInstall() {
    process.chdir(PROJECT_DIR);
    const npm = child_process.spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['i'], {
        stdio: 'inherit'
    });
}

module.exports = {
    generateFolderStructure,
    npmInstall
};
