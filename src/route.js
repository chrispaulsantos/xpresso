const path = require('path');
const fs = require('fs');
const util = require('./utility');
const _ = require('lodash');
const crypto = require('crypto');

/* GENERATE A NEW ROUTE */
function generate(routeName, options) {
    // Create the class name
    const className = _.startCase(routeName);

    // Get the route template path
    let templatePath = path.join(TEMPLATE_DIR, 'route');

    // Get destination path
    let destinationPath = path.join(SRC_DIR, `routes/${routeName}.ts`);

    if (fs.existsSync(destinationPath)) {
        console.error('Route with that name already exists');
        process.exit(1);
    }

    // Read the template
    let template = fs.readFileSync(templatePath).toString();

    // Convert to string and replace
    template = template.replace(/{{className}}/g, className);
    template = template.replace(/{{routeName}}/g, routeName);

    let replacements = [
        {
            key: /{{className}}/g,
            with: className
        },
        {
            key: /{{routeName}}/g,
            with: routeName
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
                ? `this.app.ws('/${routeName}', (ws: WebSocket, req: Request) => {})`
                : ''
        }
    ];

    updateTemplate(template, destinationPath, replacements);

    let content = `import { ${className}Routes } from './routes/${routeName}';`;
    util.updateFileByKey('index.ts', 'ENDIMPORTS', content);
    content = `${className}Routes.initialize(app);`;
    util.updateFileByKey('index.ts', 'ENDROUTES', content);

    /* * * * MODEL GENERATION * * * */
    // Get model template path
    templatePath = path.join(TEMPLATE_DIR, 'model');
    destinationPath = path.join(SRC_DIR, `models/${routeName}.ts`);

    template = fs.readFileSync(templatePath).toString();

    replacements = [
        {
            key: /{{className}}/g,
            with: className
        }
    ];

    updateTemplate(template, destinationPath, replacements);

    /* * * * SCHEMA GENERATION * * * */
    // Get schema template path
    templatePath = path.join(TEMPLATE_DIR, 'schema');
    destinationPath = path.join(SRC_DIR, `database/schema/${routeName}.ts`);

    template = fs.readFileSync(templatePath).toString();

    replacements = [
        {
            key: /{{schemaName}}/g,
            with: className
        }
    ];

    updateTemplate(template, destinationPath, replacements);

    // Update imports
    content = `import ${className}Schema from './schema/${routeName}';`;
    util.updateFileByKey('database/index.ts', 'ENDSCHEMAIMPORTS', content);
    content = `import { ${className}Document } from '../models/${routeName}';`;
    util.updateFileByKey('database/index.ts', 'ENDMODELIMPORTS', content);
    content = `connection.model<${className}Document>('${routeName}', ${className}Schema);`;
    util.updateFileByKey('database/index.ts', 'ENDMODELS', content);
}

function auth() {
    // Generate 512-bit string
    const secret = crypto.randomBytes(32).toString('hex');

    const templatePath = path.join(TEMPLATE_DIR, 'auth');
    const destinationPath = path.join(SRC_DIR, 'routes/auth.ts');

    let template = fs.readFileSync(templatePath).toString();
    let replacements = [
        {
            key: /{{SECRET_KEY}}/g,
            with: secret
        }
    ];

    updateTemplate(template, destinationPath, replacements);

    let content = `import { AuthRoutes } from './routes/auth';`;
    util.updateFileByKey('index.ts', 'ENDIMPORTS', content);
    content = `AuthRoutes.initialize(app);`;
    util.updateFileByKey('index.ts', 'ENDROUTES', content);
}

function updateTemplate(template, filePathToWrite, replacements) {
    replacements.forEach(replacement => {
        template = template.replace(replacement.key, replacement.with);
    });

    fs.writeFileSync(filePathToWrite, template);
    console.log(filePathToWrite);
}

module.exports = {
    generate,
    auth,
    updateTemplate
};
