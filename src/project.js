const child_process = require('child_process');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const ncp = require('ncp');
const util = require('./utility');

/* GENERATE THE INITIAL PROJECT STRUCTURE */
function generateFolderStructure(projectName) {
    if (util.isXpressoProject()) {
        console.error('Cannot initialize a project inside another project');
        process.exit(1);
    }

    const pwd = process.env.PWD;

    // Make project directory
    const projectDir = path.join(pwd, projectName);
    console.log(projectDir);
    fs.mkdirSync(projectDir);

    // Copy project structure
    const projectTemplateStructurePath = path.join(TEMPLATE_DIR, 'project');

    return new Promise((resolve, reject) => {
        ncp(projectTemplateStructurePath, projectDir, err => {
            if (err) {
                reject('Failed to copy directory');
            }

            const folders = ['middleware', 'models', 'routes', 'database/schema'];
            folders.forEach(folder=> {
                fs.mkdirSync(path.join(projectDir, 'src', folder));
            });

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

            // Get package path
            const packagePath = path.join(projectDir, 'package.json');

            // Update properties in package.json
            fs.readFile(packagePath, (err, data) => {
                if (err) {
                    reject(err);
                }

                let json = JSON.parse(data.toString());
                json.name = _.startCase(projectName);

                // Check options
                if (program.repo && program.repo !== '') {
                    json.repository = program.repo;
                } else {
                    json.repository = '';
                }

                if (program.summary && program.summary !== '') {
                    json.description = program.summary;
                } else {
                    json.description = '';
                }

                fs.writeFileSync(packagePath, JSON.stringify(json));
            });

            // Get database connection file path
            const databasePath = path.join(projectDir, 'src/database/index.ts');
            fs.readFile(databasePath, (err, data) => {
                if (err) {
                    reject(err);
                }

                let template = data.toString();
                template = template.replace(
                    /{{databaseName}}/g,
                    projectName.toLowerCase()
                );

                fs.writeFileSync(databasePath, template);
            });

            resolve(projectDir);
        });
    });
}

function npmInstall() {
    process.chdir(PROJECT_DIR);
    const npm = child_process.spawn('npm', ['i']);

    npm.stdout.on('data', data => {
        console.log(data.toString());
    });

    npm.stderr.on('data', data => {
        console.error(data.toString());
    });

    npm.on('close', code => {});
}

module.exports = {
    generateFolderStructure,
    npmInstall
};
