import * as express from 'express';
import { Response } from 'express';
import * as ws from 'express-ws';
import * as morgan from 'morgan';
import { requestLogger } from './middleware/request-logger.middleware';
import { generateRequestId } from './middleware/uuid.middleware';
import { Logger } from './services/logger';
import { Request } from './typings';
const context = require('express-cls-hooked');

// STARTIMPORTS //
// ENDIMPORTS //

// Initialize logger
const LOGGER = Logger.getLogger();
Logger.configure({
    appenders: {
        out: {
            type: 'stdout'
        }
    },
    categories: {
        default: {
            appenders: ['out'],
            level: process.env.LOG_LEVEL || 'debug'
        }
    }
});

LOGGER.info(`Version: ${process.version}`);
LOGGER.info('Initializing server');

// Set a new morgan token
morgan.token('id', (req: Request, res: Response) => {
    return req.id;
});

// Create root app
const wss = ws(express());
const app = wss.app;

// Setup default middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(context.middleware);
app.use(generateRequestId());
app.use(requestLogger());

// STARTMIDDLEWARE //
// ENDMIDDLEWARE //

app.get('/', (req: Request, res: Response) => {
    res.end();
});
// STARTROUTES //
// ENDROUTES //

// Export the app (this makes setting up testing easier)
export default app;
