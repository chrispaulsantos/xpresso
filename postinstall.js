const spawn = require('child_process').spawnSync;
const fs = require('fs');
const prettier = require('prettier');
const path = require('path');
const os = require('os');

const PLATFORM = os.platform();
const isWindows = !!PLATFORM.match(/win32/);

console.log('Plartform:', PLATFORM);
console.log('Windows:', isWindows);

console.log('npm list -g --depth 0');
const npm = spawn(isWindows ? 'npm.cmd' : 'npm', ['list', '-g', '--depth', '0']);
let output = npm.output[1].toString();
console.log(output);

let installPath = '';
if (isWindows) {
    installPath = output.match(/^(C:.*)/g)[0];
} else {
    installPath = output.match(/^(\/.*)/g)[0];
}
installPath = path.resolve(installPath);

let xpressoDir;
if (!fs.existsSync(path.join(installPath, 'node_modules', 'xpresso'))) {
    installPath = process.cwd();
    xpressoDir = installPath;
} else {
    xpressoDir = path.join(installPath, 'node_modules', 'xpresso');
}
console.log('Install Path:', xpressoDir);

const config = {
    xpressoDir,
    templateDir: path.join(xpressoDir, 'templates')
};

fs.writeFileSync(
    path.join(xpressoDir, 'config.json'),
    prettier.format(JSON.stringify(config), { parser: 'json', tabWidth: 4 })
);
