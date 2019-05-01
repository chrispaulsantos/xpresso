const path = require('path');
const fs = require('fs');
const util = require('./utility');
const _ = require('lodash');
const crypto = require('crypto');

/* GENERATE A NEW ROUTE */
function generate(names, options) {
    // Create the class name
    const GENERIC_NAME_REPLACEMENTS = [
        {
            key: /{{pascalSingular}}/g,
            with: names.pascalSingular
        },
        {
            key: /{{pascalPlural}}/g,
            with: names.pascalPlural
        },
        {
            key: /{{camelSingular}}/g,
            with: names.camelSingular
        },
        {
            key: /{{camelPlural}}/g,
            with: names.camelPlural
        },
        {
            key: /{{paramSingular}}/g,
            with: names.paramSingular
        },
        {
            key: /{{paramPlural}}/g,
            with: names.paramPlural
        }
    ];

    // Get the route template path
    let templatePath = path.join(TEMPLATE_DIR, 'route');

    // Get destination path
    let destinationPath = path.join(SRC_DIR, `routes/${names.paramSingular}.routes.ts`);

    // Check if the route already exists
    if (fs.existsSync(destinationPath)) {
        console.error('Route with that name already exists');
        process.exit(1);
    }

    // Read the template
    let template = fs.readFileSync(templatePath).toString();

    // Create replacements
    let replacements = GENERIC_NAME_REPLACEMENTS.concat([
        {
            key: /{{authImport}}/g,
            with: options.auth ? `import { AuthService } from '../services/auth.service';` : ''
        },
        {
            key: /{{authMiddleware}}/g,
            with: options.auth ? `this.router.use(AuthService.checkToken);` : ''
        },
        {
            key: /{{websocketImport}}/g,
            with: options.websocket
                ? `import * as WebSocket from 'ws';\nimport { Application } from 'express-ws';`
                : `import { Application } from 'express'`
        },
        {
            key: /{{websocketRoute}}/g,
            with: options.websocket
                ? `
                    this.app.ws('/${names.camelSingular}', (ws: WebSocket, req: Request) => {
                        ws.on('message', msg => {
                            ws.send('I recieved your message: ' + msg);
                        });
                    });
                `
                : ''
        }
    ]);

    util.writeTemplate(template, destinationPath, replacements);

    let content = `import { ${names.pascalSingular}Routes } from './routes/${
        names.paramSingular
    }.routes';`;
    util.updateFileByKey('index.ts', 'ENDIMPORTS', content);
    content = `app.use(${names.pascalSingular}Routes.routes());`;
    util.updateFileByKey('index.ts', 'ENDROUTES', content);

    /* * * * MODEL GENERATION * * * */
    // Get model template path
    templatePath = path.join(TEMPLATE_DIR, 'model');
    destinationPath = path.join(SRC_DIR, `models/${names.paramSingular}.ts`);

    template = fs.readFileSync(templatePath).toString();

    replacements = GENERIC_NAME_REPLACEMENTS;

    util.writeTemplate(template, destinationPath, replacements);

    /* * * * SCHEMA GENERATION * * * */
    // Get schema template path
    templatePath = path.join(TEMPLATE_DIR, 'schema');
    destinationPath = path.join(SRC_DIR, `database/schema/${names.paramSingular}.schema.ts`);

    template = fs.readFileSync(templatePath).toString();

    replacements = GENERIC_NAME_REPLACEMENTS;

    util.writeTemplate(template, destinationPath, replacements);

    // Update imports
    content = `import ${names.pascalSingular}Schema from './schema/${names.paramSingular}.schema';`;
    util.updateFileByKey('database/index.ts', 'ENDSCHEMAIMPORTS', content);
    content = `import { ${names.pascalSingular}Document } from '../models/${names.paramSingular}';`;
    util.updateFileByKey('database/index.ts', 'ENDMODELIMPORTS', content);
    content = `connection.model<${names.pascalSingular}Document>('${names.paramPlural}', ${
        names.pascalSingular
    }Schema);`;
    util.updateFileByKey('database/index.ts', 'ENDMODELS', content);

    /* * * * SERVICE GENERATION * * * */
    templatePath = path.join(TEMPLATE_DIR, 'service');
    destinationPath = path.join(SRC_DIR, `services/${names.paramSingular}.service.ts`);

    template = fs.readFileSync(templatePath).toString();

    replacements = GENERIC_NAME_REPLACEMENTS;

    util.writeTemplate(template, destinationPath, replacements);

    /* * * * TEST GENERATION * * * */
    templatePath = path.join(TEMPLATE_DIR, 'route.spec');
    destinationPath = path.join(PROJECT_DIR, `tests/routes/${names.paramSingular}.unit.spec.ts`);

    template = fs.readFileSync(templatePath).toString();

    replacements = GENERIC_NAME_REPLACEMENTS;

    util.writeTemplate(template, destinationPath, replacements);
}

function auth(options) {
    console.log('- Generating secret');
    // Generate 512-bit string
    const secret = crypto.randomBytes(32).toString('hex');

    console.log('- Updating auth service');
    let templatePath = path.join(TEMPLATE_DIR, 'auth.service');
    let destinationPath = path.join(SRC_DIR, 'services/auth.service.ts');

    let template = fs.readFileSync(templatePath).toString();
    let replacements = [
        {
            key: /{{SECRET_KEY}}/g,
            with: secret
        },
        {
            key: /{{refreshToken}}/g,
            with: options.refresh
                ? `
                    let refreshToken: string = AuthService.generateToken({});
                    res.setHeader('x-api-token', refreshToken);
                `
                : ''
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
    util.updateFileByKey('index.ts', 'ENDIMPORTS', content);
    content = `app.use(AuthRoutes.routes());`;
    util.updateFileByKey('index.ts', 'ENDROUTES', content);
}

module.exports = {
    generate,
    auth
};
