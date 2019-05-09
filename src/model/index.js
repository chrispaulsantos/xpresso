const util = require('../utility');
const fs = require('fs-extra');
const path = require('path');
const Replacement = require('./../replacement');

const create = name => {
    const names = util.generateNames(name);

    const modelPath = path.join(SRC_DIR, 'models', `${names.paramSingular}.ts`);
    if (fs.existsSync(modelPath)) {
        console.log('Model already exists');
        process.exit(1);
    }

    // Get the model template
    const template = fs.readFileSync(path.join(TEMPLATE_DIR, 'model')).toString();

    const replacements = [new Replacement('pascalSingular', names.pascalSingular)];

    console.log(`Creating Model:`, names.paramSingular);
    util.writeTemplate(template, modelPath, replacements);
};

module.exports = { create };
