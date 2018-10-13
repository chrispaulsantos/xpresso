const child_process = require('child_process');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const ncp = require('ncp');
const util = require('./utility');

/* GENERATE THE INITIAL PROJECT STRUCTURE */
function generateFolderStructure(names, options) {
    if (util.isXpressoProject()) {
        console.error('Cannot initialize a project inside another project');
        process.exit(1);
    }

    const pwd = process.env.PWD;

    console.log('- Creating project directory');
    // Make project directory
    const projectDir = path.join(pwd, names.projectName);
    console.log(projectDir);
    fs.mkdirSync(projectDir);

    // Copy project structure
    const projectTemplateStructurePath = path.join(TEMPLATE_DIR, 'project');

    console.log('- Copying default template structure');
    return new Promise((resolve, reject) => {
        ncp(projectTemplateStructurePath, projectDir, err => {
            if (err) {
                reject('Failed to copy directory');
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

            getFiles(projectDir)
                .sort()
                .forEach(file => {
                    console.log(file);
                });

            console.log('- Creating remaining folders');
            const folders = [
                'middleware',
                'models',
                'routes',
                'database/schema'
            ];
            folders.forEach(folder => {
                let folderPath = path.join(projectDir, 'src', folder);
                fs.mkdirSync(folderPath);
                console.log(folderPath);
            });

            console.log('- Updating package parameters');
            // Get package path
            const packagePath = path.join(projectDir, 'package.json');

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

            console.log('- Updating database parameters');
            // Get database connection file path
            const databasePath = path.join(projectDir, 'src/database/index.ts');
            let template = fs.readFileSync(databasePath).toString();

            let replacements = [
                {
                    key: /{{databaseName}}/g,
                    with: names.projectPackageName.toLowerCase()
                },
                {
                    key: /{{databaseUrl}}/g,
                    with: options.dbUrl
                        ? options.dbUrl
                        : 'mongodb://localhost:27017'
                }
            ];

            util.writeTemplate(template, databasePath, replacements);

            resolve(projectDir);
        });
    });
}

function npmInstall() {
    process.chdir(PROJECT_DIR);
    const npm = child_process.spawn(
        /^win/.test(process.platform) ? 'npm.cmd' : 'npm',
        ['i'],
        { stdio: 'inherit' }
    );
}

function enableFirebase() {
    let output = '';

    const npm = child_process.spawn(
        /^win/.test(process.platform) ? 'npm.cmd' : 'cmd',
        ['list', '-g', '--depth', '0']
    );

    npm.stdout.on('data', msg => {
        output += msg.toString();
    });

    npm.on('close', code => {
        console.log(output);
        let version;

        if (!(version = checkIsInstalled())) {
            console.log('- missing firebase-tools: installing');
            child_process.spawnSync(
                /^win/.test(process.platform) ? 'npm.cmd' : 'cmd',
                ['i', '-g', 'firebase-tools@latest'],
                { stdio: 'inherit' }
            );
        } else {
            console.log(`- found firebase-tools@${version}`);
        }

        process.chdir(PROJECT_DIR);
        let firebase = child_process.spawnSync('firebase', ['login'], {
            stdio: 'inherit'
        });

        firebase = child_process.spawnSync('firebase', ['init'], {
            stdio: 'inherit'
        });

        function checkIsInstalled() {
            return output.match(/(firebase-tools)@(.+)/)[2] || null;
        }
    });
}

module.exports = {
    generateFolderStructure,
    npmInstall
};
