import * as express from 'express';
import { Application, NextFunction, Request, Response } from 'express';
import * as uuid from 'uuid/v4';
import { RequestLogger } from './services/request-logger';

export class Server {
    public static initialize(app: Application): void {
        const server: Server = new this();
        server.bootstrap(app);
    }

    private bootstrap(app: Application): void {
        app.use(this.generateRequestId);
        app.use(express.json());
        app.use(express.urlencoded({extended: false}));
        app.use(RequestLogger.getLogger());
    }

    private generateRequestId(req: Request, res: Response, next: NextFunction): void {
        req.id = uuid();
        next();
    }
}