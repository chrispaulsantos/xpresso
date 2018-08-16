const fs = require('fs');
const path = require('path');
const changeCase = require('change-case');
const prettier = require('prettier');
const config = require('../config');

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
    let pwd = process.env.PWD;
    for (var a = [], i = pwd.length; i--; ) if (pwd[i] === '/') a.push(i);

    let packagePath = null;
    for (i = 0; i < a.length; i++) {
        let filePath = path.join(pwd, 'package.json');

        if (fs.existsSync(filePath)) {
            packagePath = filePath;
            break;
        }

        pwd = pwd.slice(0, a[i] + 1);
    }

    return pwd;
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
    return {
        projectName: changeCase.paramCase(name),
        routeName: changeCase.camelCase(name),
        className: changeCase.pascalCase(name)
    };
}

module.exports = {
    getXpressoDirectory,
    isXpressoProject,
    getProjectDirectoryPath,
    updateFileByKey,
    writeTemplate,
    generateNames
};
