import { NextFunction, RequestHandler, Response } from 'express';
import { JWTService } from '../services/jwt.service';
import { Logger } from '../services/logger';
import { Request } from '../typings';

export const validateToken = (): RequestHandler => {
    const LOGGER = Logger.getLogger('validateToken');

    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.header('x-api-token');

        if (!token || token === '') {
            return res.status(401).end();
        }

        try {
            const decoded = JWTService.verify(token);

            if (decoded) {
                req.decoded = decoded;

                next();
            } else {
                return res.status(401).end();
            }
        } catch (e) {
            LOGGER.error(e);
            return res.status(401).end();
        }
    };
};
