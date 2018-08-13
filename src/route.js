const path = require('path');
const fs = require('fs');
const util = require('./utility');
const _ = require('lodash');
const crypto = require('crypto');

/* GENERATE A NEW ROUTE */
function generate(names, options) {
    // Create the class name

    // Get the route template path
    let templatePath = path.join(TEMPLATE_DIR, 'route');

    // Get destination path
    let destinationPath = path.join(SRC_DIR, `routes/${names.routeName}.ts`);

    // Check if the route already exists
    if (fs.existsSync(destinationPath)) {
        console.error('Route with that name already exists');
        process.exit(1);
    }

    // Read the template
    let template = fs.readFileSync(templatePath).toString();

    // Create replacements
    let replacements = [
        {
            key: /{{className}}/g,
            with: names.className
        },
        {
            key: /{{routeName}}/g,
            with: names.routeName
        },
        {
            key: /{{authImport}}/g,
            with: options.auth ? `import { AuthRoutes } from './auth';` : ''
        },
        {
            key: /{{authMiddleware}}/g,
            with: options.auth ? `this.app.use(AuthRoutes.checkToken);` : ''
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
                    this.app.ws('/${
                        names.routeName
                    }', (ws: WebSocket, req: Request) => {
                        ws.on('message', msg => {
                            ws.send('I recieved your message: ' + msg);
                        });
                    });
                `
                : ''
        }
    ];

    util.writeTemplate(template, destinationPath, replacements);

    let content = `import { ${names.className}Routes } from './routes/${
        names.routeName
    }';`;
    util.updateFileByKey('index.ts', 'ENDIMPORTS', content);
    content = `${names.className}Routes.initialize(app);`;
    util.updateFileByKey('index.ts', 'ENDROUTES', content);

    /* * * * MODEL GENERATION * * * */
    // Get model template path
    templatePath = path.join(TEMPLATE_DIR, 'model');
    destinationPath = path.join(SRC_DIR, `models/${names.routeName}.ts`);

    template = fs.readFileSync(templatePath).toString();

    replacements = [
        {
            key: /{{className}}/g,
            with: names.className
        }
    ];

    util.writeTemplate(template, destinationPath, replacements);

    /* * * * SCHEMA GENERATION * * * */
    // Get schema template path
    templatePath = path.join(TEMPLATE_DIR, 'schema');
    destinationPath = path.join(
        SRC_DIR,
        `database/schema/${names.routeName}.ts`
    );

    template = fs.readFileSync(templatePath).toString();

    replacements = [
        {
            key: /{{schemaName}}/g,
            with: names.className
        }
    ];

    util.writeTemplate(template, destinationPath, replacements);

    // Update imports
    content = `import ${names.className}Schema from './schema/${
        names.routeName
    }';`;
    util.updateFileByKey('database/index.ts', 'ENDSCHEMAIMPORTS', content);
    content = `import { ${names.className}Document } from '../models/${
        names.routeName
    }';`;
    util.updateFileByKey('database/index.ts', 'ENDMODELIMPORTS', content);
    content = `connection.model<${names.className}Document>('${
        names.routeName
    }', ${names.className}Schema);`;
    util.updateFileByKey('database/index.ts', 'ENDMODELS', content);

    /* * * * SERVICE GENERATION * * * */
    templatePath = path.join(TEMPLATE_DIR, 'service');
    destinationPath = path.join(SRC_DIR, `services/${names.routeName}.ts`);

    template = fs.readFileSync(templatePath).toString();

    replacements = [
        {
            key: /{{className}}/g,
            with: names.className
        },
        {
            key: /{{routeName}}/g,
            with: names.routeName
        }
    ];

    util.writeTemplate(template, destinationPath, replacements);

    /* * * * TEST GENERATION * * * */
    templatePath = path.join(TEMPLATE_DIR, 'route.spec');
    destinationPath = path.join(
        PROJECT_DIR,
        `tests/routes/${names.routeName}.unit.spec.ts`
    );

    template = fs.readFileSync(templatePath).toString();

    replacements = [
        {
            key: /{{className}}/g,
            with: names.className
        },
        {
            key: /{{routeName}}/g,
            with: names.routeName
        }
    ];

    util.writeTemplate(template, destinationPath, replacements);
}

function auth(options) {
    console.log('- Generating secret');
    // Generate 512-bit string
    const secret = crypto.randomBytes(32).toString('hex');

    console.log('- Updating auth route');
    const templatePath = path.join(TEMPLATE_DIR, 'auth');
    const destinationPath = path.join(SRC_DIR, 'routes/auth.ts');

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
                    let refreshToken: string = AuthRoutes.generateToken();
                    res.setHeader('x-api-token', refreshToken);
                `
                : ''
        }
    ];

    util.writeTemplate(template, destinationPath, replacements);

    let content = `import { AuthRoutes } from './routes/auth';`;
    util.updateFileByKey('index.ts', 'ENDIMPORTS', content);
    content = `AuthRoutes.initialize(app);`;
    util.updateFileByKey('index.ts', 'ENDROUTES', content);
}

module.exports = {
    generate,
    auth
};
