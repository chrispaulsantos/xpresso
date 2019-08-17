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
            options.auth ? `import { AuthService } from '../services/auth.service';` : ''
        ),
        new Replacement(
            'authMiddleware',
            options.auth ? `this.router.use(AuthService.checkToken);` : ''
        ),
        new Replacement(
            'websocketImport',
            options.websocket
                ? `import * as WebSocket from 'ws';\nimport { Application } from 'express-ws';`
                : `import { Application } from 'express'`
        ),
        new Replacement(
            'websocketRoute',
            options.websocket
                ? `
            this.app.ws('/${names.camelSingular}', (ws: WebSocket, req: Request) => {
                ws.on('message', msg => {
                    ws.send('I recieved your message: ' + msg);
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
    util.updateFileByKey('index.ts', 'ENDIMPORTS', content);
    content = `app.use(${names.pascalSingular}Routes.routes());`;
    util.updateFileByKey('index.ts', 'ENDROUTES', content);

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

module.exports = { create };
