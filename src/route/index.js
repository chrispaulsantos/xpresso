const util = require('../utility');
const fs = require('fs-extra');
const path = require('path');
const Replacement = require('./../replacement');

const create = (name, options) => {
    const names = util.generateNames(name);

    const routePath = path.join(SRC_DIR, 'routes', `${names.paramSingular}.routes.ts`);
    if (fs.existsSync(routePath)) {
        console.log('Route already exists');
        process.exit(1);
    }

    // Get the model template
    const template = fs.readFileSync(path.join(TEMPLATE_DIR, 'route')).toString();

    let replacements = [
        ...NAME_REPLACEMENTS,
        new Replacement(
            'authImport',
            options.auth ? `import { validateToken } from '../middleware/auth.middleware';` : ''
        ),
        new Replacement('authMiddleware', options.auth ? `this.router.use(validateToken());` : ''),
    ];

    console.log(`Creating route:`, names.paramSingular);
    util.writeTemplate(template, routePath, replacements);

    // Import route into base app
    let content = `import { ${names.pascalSingular}Routes } from './routes/${names.paramSingular}.routes';`;
    util.addImport('app.ts', content);
    content = `app.use('/${names.paramPlural}', ${names.pascalSingular}Routes.routes());`;
    util.updateFileByKey('app.ts', 'ENDROUTES', content);

    if (options.spec) {
        createTest(names);
    }
};

const createTest = names => {
    // Check if the tests/routes folder exists
    const routeTestDir = path.join(PROJECT_DIR, 'tests', 'routes');
    if (!fs.existsSync(routeTestDir)) {
        fs.mkdirSync(routeTestDir);
    }

    /* * * * TEST GENERATION * * * */
    templatePath = path.join(TEMPLATE_DIR, 'route.spec');
    destinationPath = path.join(routeTestDir, `${names.paramSingular}.unit.spec.ts`);

    template = fs.readFileSync(templatePath).toString();

    util.writeTemplate(template, destinationPath, NAME_REPLACEMENTS);
};

module.exports = { create };
