const child_process = require('child_process');
const fs = require('fs-extra');
const _ = require('lodash');
const path = require('path');
const util = require('../utility');
const inquirer = require('inquirer');
const colors = require('colors');
const pad = require('pad');
const Replacement = require('../replacement');
const crypto = require('crypto');

const DATABASE_TYPES = ['postgres', 'mysql'];
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

function cloneBaseProjectStructure() {
    // Copy project structure
    process.chdir(PROJECT_DIR);
    child_process.execSync('git clone https://github.com/chrispaulsantos/xpresso-template.git .', {
        stdio: 'inherit'
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
    if (!fs.existsSync(dbDestinationFolderPath)) {
        fs.mkdirSync(dbDestinationFolderPath);
    }

    // Create the database index.ts
    const dbIndexPath = path.join(dbDestinationFolderPath, 'index.ts');
    if (fs.existsSync(dbIndexPath)) {
        fs.removeSync(dbIndexPath);
    }

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
    console.log('- Installing dependencies');

    process.chdir(PROJECT_DIR);
    const npm = child_process.spawnSync(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['i'], {
        stdio: 'inherit'
    });
}

function installDatabaseDependencies(dependencies) {
    console.log('- Installing selected database dependencies')

    process.chdir(PROJECT_DIR);
    const npm = child_process.spawnSync(
        /^win/.test(process.platform) ? 'npm.cmd' : 'npm',
        ['i', '-S', ...dependencies],
        {
            stdio: 'inherit'
        }
    );
}

function generateJWTSecret() {
    console.log('- Generating JWT secret');

    // Generate 512-bit string
    const secret = crypto.randomBytes(64).toString('hex');

    console.log('- Updating config');
    let configPath = path.join(SRC_DIR, 'config.ts');

    let template = fs.readFileSync(configPath).toString();
    let replacements = [
        {
            key: /{{JWT_SECRET}}/g,
            with: secret
        }
    ];

    util.writeTemplate(template, configPath, replacements);
}

function resetGitRepo(repo) {
    console.log('- Resetting git repo')

    process.chdir(PROJECT_DIR);
    console.log('rm -r .git');
    fs.removeSync(path.join(PROJECT_DIR, '.git'));

    console.log('- Initial commit');
    console.log('git init');
    child_process.execSync('git init', {
        stdio: 'inherit'
    });

    console.log('git add .');
    console.log('git commit -m "Initial commit"');
    child_process.execSync('git add . && git commit -m "Initial commit"', {
        stdio: 'inherit'
    });

    if (repo) {
        console.log('- Adding remote');
        console.log('git remote add origin ' + repo);
        child_process.execSync('git remote add origin ' + repo, {
            stdio: 'inherit'
        });
    }
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
function run(names, options) {
    makeProjectDir();
    cloneBaseProjectStructure();
    createEmptyFolders();
    updatePackageJSON(names, options);
    setupDatabase(names, options);
    generateJWTSecret();
    npmInstall();
    installDatabaseDependencies(DATABASE_EXTRA_PACKAGES[options.databaseType].deps);
    resetGitRepo(options.repo);
}

function init(names, options) {
    if (util.isXpressoProject()) {
        console.error('Cannot create project inside a project');
        process.exit(1);
    }

    const pwd = process.cwd();
    PROJECT_DIR = path.join(pwd, names.projectName);
    SRC_DIR = path.join(PROJECT_DIR, 'src');

    console.log('- Project Path: ' + PROJECT_DIR);
    console.log('- Source Path: ' + SRC_DIR);

    // Ask for user prompt first
    questions().then(answers => {
        options = { ...options, ...answers };

        run(names, options);
    });
}

module.exports = {
    init
};
