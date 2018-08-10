import * as express from 'express';
import { Request, Response } from 'express';
import * as ws from 'express-ws';
import * as morgan from 'morgan';
import { connect } from './database';
import { Server } from './server';
import { Logger } from './services/logger';

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

connect(() => {
    // Create root app
    const wss = ws(express());
    const app = wss.app;

    Server.initialize(app);

    // STARTMIDDLEWARE //
    // ENDMIDDLEWARE //

    // STARTROUTES //
    // ENDROUTES //

    app.use('*', (req: Request, res: Response) => {
        res.status(404).json({ message: 'RouteNotFound' });
    });

    app.listen(process.env.PORT || 8080, () => {
        LOGGER.info(`Server intialized: Port ${process.env.PORT || 8080}`);
    });
});
