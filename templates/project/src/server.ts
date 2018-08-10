import * as express from 'express';
import { Application, NextFunction, Request, Response } from 'express';
import * as uuid from 'uuid/v4';
import { Logger } from './services/logger';
import { RequestLogger } from './services/request-logger';

const context = require('express-cls-hooked');
const LOGGER: Logger = Logger.getLogger('Server');

export class Server {
    public static initialize(app: Application): void {
        LOGGER.info('Initializing root application');
        const server: Server = new this();
        server.bootstrap(app);
    }

    private bootstrap(app: Application): void {
        app.use(context.middleware);
        app.use(this.generateRequestId);
        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        app.use(RequestLogger.getLogger());
    }

    private generateRequestId(
        req: Request,
        res: Response,
        next: NextFunction
    ): void {
        req.id = uuid();
        context.set('id', req.id);
        next();
    }
}
