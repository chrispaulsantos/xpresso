const util = require('../utility');

const create = name => {
    const names = util.generateNames(name);

    console.log(PROJECT_DIR);
    console.log(names);
};

module.exports = { create };
