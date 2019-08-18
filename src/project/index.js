const child_process = require('child_process');
const fs = require('fs-extra');
const _ = require('lodash');
const path = require('path');
const util = require('../utility');
const inquirer = require('inquirer');
const colors = require('colors');
const pad = require('pad');
const Replacement = require('../replacement');
const route = require('../route');

const DATABASE_TYPES = ['postgres', 'mysql', 'mongodb'];
const DATABASE_PORTS = {
    postgres: 5432,
    mysql: 3306,
    mongodb: 27017
};
const DATABASE_EXTRA_PACKAGES = {
    mongodb: {
        deps: ['mongoose']
    },
    postgres: {
        deps: ['typeorm', 'pg']
    },
    mysql: {
        deps: ['typeorm', 'mysql']
    }
};

function makeProjectDir() {
    console.log('- Creating project directory');
    // Make project directory
    console.log(PROJECT_DIR);
    fs.mkdirSync(PROJECT_DIR);
}

function copyBaseProjectStructure() {
    // Copy project structure
    const projectTemplateStructurePath = path.join(TEMPLATE_DIR, 'project');

    console.log('- Copying default template structure');
    fs.copySync(projectTemplateStructurePath, PROJECT_DIR);

    util.getFiles(PROJECT_DIR)
        .sort()
        .forEach(file => {
            console.log(file);
        });
}

function createEmptyFolders() {
    console.log('- Creating remaining folders');
    const folders = ['routes'];
    folders.forEach(folder => {
        let folderPath = path.join(SRC_DIR, folder);
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(folderPath);
    });
}

function updatePackageJSON(names, options) {
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
}

function setupDatabase(names, options) {
    // The destination folder path in the src folder
    const dbDestinationFolderPath = path.join(SRC_DIR, 'database');
    fs.mkdirSync(dbDestinationFolderPath);

    // Create the database index.ts
    const dbIndexPath = path.join(dbDestinationFolderPath, 'index.ts');
    if (options.databaseType !== 'mongodb') {
        const dbTemplatePath = path.join(TEMPLATE_DIR, 'database', 'sql');
        fs.copySync(dbTemplatePath, dbIndexPath);
    } else {
        const dbTemplatePath = path.join(TEMPLATE_DIR, 'database', 'mongo');
        fs.copySync(dbTemplatePath, dbIndexPath);
    }

    console.log('- Updating database parameters');
    // Get database connection file path
    let template = fs.readFileSync(dbIndexPath).toString();

    let replacements = [new Replacement('databaseName', names.projectPackageName.toLowerCase())];

    // If we are sql, add 2 replacements for the db driver we are using, and the port
    if (options.databaseType !== 'mongodb') {
        replacements.push(new Replacement('sqlDatabaseType', options.databaseType));
        replacements.push(new Replacement('databasePort', DATABASE_PORTS[options.databaseType]));
    }

    util.writeTemplate(template, dbIndexPath, replacements);
}

function npmInstall() {
    process.chdir(PROJECT_DIR);
    const npm = child_process.spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['i'], {
        stdio: 'inherit'
    });
}

function installDatabaseDependencies(dependencies) {
    process.chdir(PROJECT_DIR);
    const npm = child_process.spawn(
        /^win/.test(process.platform) ? 'npm.cmd' : 'npm',
        ['i', '-S', ...dependencies],
        {
            stdio: 'inherit'
        }
    );
}

function questions() {
    const questions = [
        {
            type: 'list',
            name: 'databaseType',
            message: 'Choose a database',
            choices: DATABASE_TYPES
        }
    ];

    return inquirer.prompt(questions).then(function(answers) {
        console.log('DATABASE CONFIG');
        console.log('------------------');

        console.log(pad(colors.grey('Database type: '), 25), answers.databaseType);

        return answers;
    });
}

/* GENERATE THE INITIAL PROJECT STRUCTURE */
function generateFolderStructure(names, options) {
    makeProjectDir();
    copyBaseProjectStructure();
    createEmptyFolders();
    updatePackageJSON(names, options);
    setupDatabase(names, options);
}

function init(names, options) {
    if (util.isXpressoProject()) {
        console.error('Cannot create project inside a project');
        process.exit(1);
    }

    const pwd = process.cwd();
    PROJECT_DIR = path.join(pwd, names.projectName);
    SRC_DIR = path.join(PROJECT_DIR, 'src');

    // Ask for user prompt first
    questions().then(answers => {
        options = { ...options, ...answers };

        generateFolderStructure(names, options);

        if (options.auth) {
            route.auth(options);
        }

        console.log('- Installing dependencies');
        npmInstall();
        installDatabaseDependencies(DATABASE_EXTRA_PACKAGES[options.databaseType].deps);
    });
}

module.exports = {
    init
};
