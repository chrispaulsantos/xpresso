const spawn = require('child_process').spawnSync;
const fs = require('fs');
const prettier = require('prettier');
const path = require('path');

const npm = spawn('npm', ['list', '-g', '--depth', '0']);
let installPath = npm.output[1].toString();
installPath = installPath.match(/^(\/.*)/g)[0];
installPath = path.resolve(installPath);

const xpressoDir = path.join(installPath, 'node_modules', 'xpresso');
const config = {
    xpressoDir,
    templateDir: path.join(xpressoDir, 'templates')
};

console.log(config.xpressoDir);
console.log(config.templateDir);

console.log(fs.existsSync(xpressoDir));

fs.writeFile(
    path.join(xpressoDir, 'config.json'),
    prettier.format(JSON.stringify(config), { parser: 'json', tabWidth: 4 }),
    {
        flag: 'wx'
    }
);
