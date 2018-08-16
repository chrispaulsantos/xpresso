const spawn = require('child_process').spawnSync;
const fs = require('fs');
const prettier = require('prettier');
const path = require('path');

const npm = spawn('npm', ['list', '-g', '--depth', '0']);

let output = npm.output[1].toString();
console.log(output);
installPath = output.match(/^(\/.*)/g)[0];
installPath = path.resolve(installPath);

let xpressoDir;
if (!fs.existsSync(path.join(installPath, 'node_modules', 'xpresso'))) {
    installPath = process.cwd();
    xpressoDir = installPath;
} else {
    xpressoDir = path.join(installPath, 'node_modules', 'xpresso');
}
console.log(installPath);
console.log(process.cwd());

const config = {
    xpressoDir,
    templateDir: path.join(xpressoDir, 'templates')
};

fs.writeFileSync(
    path.join(xpressoDir, 'config.json'),
    prettier.format(JSON.stringify(config), { parser: 'json', tabWidth: 4 })
);
