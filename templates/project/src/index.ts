import * as express from 'express';
import { Request, Response } from 'express';
import * as ws from 'express-ws';
import * as fs from 'fs';
import * as morgan from 'morgan';
import * as path from 'path';
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
    let isUILoaded: boolean = false;

    Server.initialize(app);

    // STARTMIDDLEWARE //
    // ENDMIDDLEWARE //

    // STARTROUTES //
    // ENDROUTES //

    // Public directory for loading a UI
    const publicPath = path.join(__dirname, 'public');
    app.use(express.static(publicPath, { index: false }));
    app.use('*', (req: Request, res: Response) => {
        const indexPath = path.join(publicPath, 'index.html');

        if (!isUILoaded && !fs.existsSync(indexPath)) {
            return res.status(404).send(`<h3>${req.url} not found</h3>`);
        } else {
            isUILoaded = true;
            return res.sendFile(indexPath);
        }
    });

    app.listen(process.env.PORT || 8080, () => {
        LOGGER.info(`Application started: Port ${process.env.PORT || 8080}`);
    });
});
