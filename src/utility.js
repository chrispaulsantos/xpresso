const fs = require('fs');
const path = require('path');
const changeCase = require('change-case');
const pluralize = require('pluralize');
const prettier = require('prettier');
const config = require('../config');

function setupEnv() {
    isXpressoProject();
    XPRESSO_DIR = getXpressoDirectory();
    TEMPLATE_DIR = path.join(XPRESSO_DIR, 'templates');
    PROJECT_DIR = getProjectDirectoryPath();
    PROJECT_PACKAGE = '';
    SRC_DIR = path.join(getProjectDirectoryPath(), 'src');
    console.log(XPRESSO_DIR);
    console.log(PROJECT_DIR);
}

function getXpressoDirectory() {
    let dir = path.join(config.xpressoDir);
    return dir;
}

function isXpressoProject() {
    let projectPath = getProjectDirectoryPath();

    if (projectPath) {
        const packagePath = path.join(projectPath, 'package.json');

        if (!fs.existsSync(packagePath)) {
            return false;
        }

        PROJECT_PACKAGE = JSON.parse(fs.readFileSync(packagePath).toString());
        if (PROJECT_PACKAGE.xpresso) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function getProjectDirectoryPath() {
    let pwd = process.cwd();
    console.log('Current Working Directory:', pwd);

    // Find the index of every '/'
    for (var a = [], i = pwd.length; i--; ) if (pwd[i] === '/') a.push(i);

    // Loop through to see if this directory has a package.json
    // which would indicate a node project
    let packagePath = null;
    for (i = 0; i < a.length; i++) {
        let filePath = path.join(pwd, 'package.json');

        // If package.json exists, break, and we set the package path
        if (fs.existsSync(filePath)) {
            PROJECT_DIR = pwd;
            packagePath = pwd;
            break;
        }

        // If package.json does not exist, slice to the next '/'
        pwd = pwd.slice(0, a[i] + 1);
    }

    return packagePath;
}

function updateFileByKey(fileName, searchKey, content) {
    let filePath = path.join(SRC_DIR, fileName);
    let file = fs.readFileSync(filePath);
    let fileContents = file.toString();

    const keyIndex = fileContents.indexOf(`// ${searchKey} //`);
    const start = fileContents.slice(0, keyIndex);
    const end = fileContents.slice(keyIndex, fileContents.length);
    const full = start.concat(`${content}\n`, end);

    // Clean up code
    const prettiered = prettier.format(full, {
        tabWidth: 4,
        singleQuote: true,
        parser: 'typescript'
    });

    fs.writeFileSync(filePath, prettiered);
}

function writeTemplate(template, filePathToWrite, replacements) {
    replacements.forEach(replacement => {
        template = template.replace(replacement.key, replacement.with);
    });

    // Clean up code
    const prettiered = prettier.format(template, {
        tabWidth: 4,
        singleQuote: true,
        parser: 'typescript'
    });

    fs.writeFileSync(filePathToWrite, prettiered);
    console.log(filePathToWrite);
}

function generateNames(name) {
    const singular = pluralize.singular(name);
    const plural = pluralize.plural(name);

    // Input = flightAttendant
    return {
        projectName: changeCase.paramCase(name), // flight-attendant
        projectPackageName: changeCase.camelCase(name), // flightAttendant
        camelSingular: changeCase.camelCase(singular), // flightAttendent
        camelPlural: changeCase.camelCase(plural), // flightAttendents
        pascalSingular: changeCase.pascalCase(singular), // FlightAttendent
        pascalPlural: changeCase.pascalCase(plural), // FlightAttendents
        paramSingular: changeCase.paramCase(singular), // flight-attemdant
        paramPlural: changeCase.paramCase(plural) // flight-attendants
    };
}

module.exports = {
    getXpressoDirectory,
    isXpressoProject,
    getProjectDirectoryPath,
    updateFileByKey,
    writeTemplate,
    generateNames,
    setupEnv
};
