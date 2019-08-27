const fs = require('fs');
const path = require('path');
const changeCase = require('change-case');
const pluralize = require('pluralize');
const prettier = require('prettier');
const config = require('../config');
const Replacement = require('./replacement');

function setupEnv(name) {
    XPRESSO_DIR = getXpressoDirectory();
    console.log('Xpresso Install Path:', XPRESSO_DIR);

    TEMPLATE_DIR = path.join(XPRESSO_DIR, 'templates');
    console.log('Xpresso Template Directory:', TEMPLATE_DIR);

    const projectDirectory = getProjectDirectoryPath();
    if (!projectDirectory) {
        console.log('package.json not found');
        return;
    }

    PROJECT_DIR = projectDirectory;
    console.log('Project Directory:', PROJECT_DIR);

    SRC_DIR = path.join(PROJECT_DIR, 'src');
    console.log('Source Directory:', SRC_DIR);

    PROJECT_PACKAGE = getProjectPackageJson();

    if (name) {
        const names = generateNames(name);

        NAME_REPLACEMENTS = [
            new Replacement('pascalSingular', names.pascalSingular),
            new Replacement('pascalPlural', names.pascalPlural),
            new Replacement('camelSingular', names.camelSingular),
            new Replacement('camelPlural', names.camelPlural),
            new Replacement('paramSingular', names.paramSingular),
            new Replacement('paramPlural', names.paramPlural)
        ];
    }
}

function getXpressoDirectory() {
    let dir = path.join(config.xpressoDir);
    return dir;
}

function checkIsXpressoProject() {
    if (!isXpressoProject()) {
        console.log('Not inside an xpresso project');
        process.exit(1);
    }
}

function isXpressoProject() {
    if (PROJECT_PACKAGE.xpresso) {
        return true;
    } else {
        return false;
    }
}

function getProjectPackageJson() {
    const packagePath = path.join(PROJECT_DIR, 'package.json');

    if (!fs.existsSync(packagePath)) {
        return false;
    }

    return JSON.parse(fs.readFileSync(packagePath).toString());
}

function getProjectDirectoryPath() {
    let pwd = process.cwd();

    // If we're on windows we need to check for \ instead of /
    let pathSeparator = '/';
    if (/^win/.test(process.platform)) {
        pathSeparator = '\\';
    }

    // Find the index of every '/'
    for (var a = [], i = pwd.length; i--; ) if (pwd[i] === pathSeparator) a.push(i);

    // Loop through to see if this directory has a package.json
    // which would indicate a node project
    let packagePath = null;
    for (i = 0; i < a.length; i++) {
        let filePath = path.join(pwd, 'package.json');

        // If package.json exists, break, and we set the package path
        if (fs.existsSync(filePath)) {
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

function replace(template, replacements) {
    let str = template;
    replacements.forEach(replacement => {
        str = str.replace(replacement.key, replacement.with);
    });

    return str;
}

function writeTemplate(template, filePathToWrite, replacements) {
    const updatedTemplate = replace(template, replacements);

    // Clean up code
    const prettiered = prettier.format(updatedTemplate, {
        tabWidth: 4,
        singleQuote: true,
        parser: 'typescript'
    });

    fs.writeFileSync(filePathToWrite, prettiered);
    console.log(filePathToWrite);
}

/**
 *
 * @param {*} name Input name to transform to different cases
 * Input: flightAttendant
 * Camel: flightAttendant
 * Pascal: FlightAttendant
 * Param: flight-attendant
 */
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
        paramSingular: changeCase.paramCase(singular), // flight-attendant
        paramPlural: changeCase.paramCase(plural) // flight-attendants
    };
}

function getFiles(dir, files_) {
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = `${dir}/${files[i]}`;
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}

module.exports = {
    getXpressoDirectory,
    isXpressoProject,
    getProjectDirectoryPath,
    updateFileByKey,
    writeTemplate,
    generateNames,
    setupEnv,
    getFiles,
    checkIsXpressoProject,
    replace
};
