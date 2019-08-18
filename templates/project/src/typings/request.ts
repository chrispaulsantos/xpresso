import * as express from 'express';
import { JWTPayload } from '../models/jwt-payload';

export interface Request extends express.Request {
    id: string;
    decoded: JWTPayload;
}
