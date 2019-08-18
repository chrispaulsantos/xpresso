const util = require('../utility');
const fs = require('fs-extra');
const path = require('path');
const Replacement = require('./../replacement');
const crypto = require('crypto');

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
        new Replacement(
            'websocketImport',
            options.websocket ? `import * as WebSocket from 'ws';\n` : ``
        ),
        new Replacement(
            'websocketRoute',
            options.websocket
                ? `
            this.router.ws('/${names.camelSingular}', (ws: WebSocket, req: Request) => {
                LOGGER.info('WS - Client connected');
                ws.on('message', msg => {
                    ws.send('Message recieved: ' + msg);
                });
            });
        `
                : ''
        )
    ];

    console.log(`Creating route:`, names.paramSingular);
    util.writeTemplate(template, routePath, replacements);

    // Import route into base app
    let content = `import { ${names.pascalSingular}Routes } from './routes/${
        names.paramSingular
    }.routes';`;
    util.updateFileByKey('app.ts', 'ENDIMPORTS', content);
    content = `app.use(${names.pascalSingular}Routes.routes());`;
    util.updateFileByKey('app.ts', 'ENDROUTES', content);

    if (options.spec) {
        createTest(names);
    }
};

const createTest = names => {
    /* * * * TEST GENERATION * * * */
    templatePath = path.join(TEMPLATE_DIR, 'route.spec');
    destinationPath = path.join(PROJECT_DIR, `tests/routes/${names.paramSingular}.unit.spec.ts`);

    template = fs.readFileSync(templatePath).toString();

    util.writeTemplate(template, destinationPath, NAME_REPLACEMENTS);
};

function auth(options) {
    console.log('- Generating secret');
    // Generate 512-bit string
    const secret = crypto.randomBytes(32).toString('hex');

    console.log('- Updating jwt service');
    let templatePath = path.join(TEMPLATE_DIR, 'jwt.service');
    let destinationPath = path.join(SRC_DIR, 'services/jwt.service.ts');

    let template = fs.readFileSync(templatePath).toString();
    let replacements = [
        {
            key: /{{SECRET_KEY}}/g,
            with: secret
        }
    ];

    util.writeTemplate(template, destinationPath, replacements);

    console.log('- Updating auth route');
    templatePath = path.join(TEMPLATE_DIR, 'auth.routes');
    destinationPath = path.join(SRC_DIR, 'routes/auth.routes.ts');

    template = fs.readFileSync(templatePath).toString();
    replacements = [];

    util.writeTemplate(template, destinationPath, replacements);

    let content = `import { AuthRoutes } from './routes/auth.routes';`;
    util.updateFileByKey('app.ts', 'ENDIMPORTS', content);
    content = `app.use(AuthRoutes.routes());`;
    util.updateFileByKey('app.ts', 'ENDROUTES', content);
}

module.exports = { create, auth };
