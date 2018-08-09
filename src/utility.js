const fs = require('fs');
const path = require('path');

function getXpressoDirectory() {
    let dir = path.join(
        process.argv[1],
        '..',
        '..',
        'lib/node_modules/xpresso'
    );
    return dir;
}

function getProjectDirectory() {
    let pwd = process.env.PWD;
    let packagePath = getProjectDirectoryPath();

    if (packagePath) {
        PROJECT_PACKAGE = JSON.parse(fs.readFileSync(packagePath).toString());
        if (PROJECT_PACKAGE.xpresso) {
            return path.resolve(packagePath.match(/(.+)\/.+$/)[1]);
        } else {
            console.error('Not an xpresso project');
            process.exit(1);
        }
    } else {
        console.error('Not an xpresso project');
        process.exit(1);
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

    fs.writeFileSync(filePath, full);
}

module.exports = {
    getXpressoDirectory,
    getProjectDirectory,
    getProjectDirectoryPath,
    updateFileByKey
};
