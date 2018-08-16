const spawn = require('child_process').spawnSync;
const fs = require('fs');
const prettier = require('prettier');
const path = require('path');

const npm = spawn('npm', ['list', '-g', '--depth', '0']);

let installPath = npm.output[1].toString();
installPath = installPath.match(/^(\/.*)/g)[0];
installPath = path.resolve(installPath);

if (!fs.existsSync(installPath)) {
    installPath = path.resolve('./');
}
console.log(installPath);

const xpressoDir = path.join(installPath, 'node_modules', 'xpresso');
const config = {
    xpressoDir,
    templateDir: path.join(xpressoDir, 'templates')
};

if (!fs.existsSync(xpressoDir)) {
    fs.closeSync(fs.openSync(path.join(xpressoDir, 'config.json'), 'w'));
}

fs.writeFileSync(
    path.join(xpressoDir, 'config.json'),
    prettier.format(JSON.stringify(config), { parser: 'json', tabWidth: 4 }),
    {
        flag: 'wx'
    }
);
