import chalk from 'chalk';
import { RequestHandler, Response } from 'express';
import * as morgan from 'morgan';
import { TokenIndexer } from 'morgan';
import { Request } from '../typings/request';
import { padRight } from '../utils/functions';

export const requestLogger = (): RequestHandler => {
    return morgan((tokens: TokenIndexer, req: Request, res: Response) => {
        // Set status color
        const status: number = parseInt(tokens.status(req, res), 10);
        const statusColor: string =
            status >= 500
                ? '#DC143C'
                : status >= 400
                ? '#FFFF00'
                : status >= 300
                ? '#00CED1'
                : '#32CD32';

        // Set method color
        const method: string = tokens.method(req, res);
        let methodColor: string = '#FFF';
        switch (method) {
            case 'GET':
                methodColor = '#32CD32';
                break;
            case 'PUT':
                methodColor = '#2068CC';
                break;
            case 'POST':
                methodColor = '#D69D22';
                break;
            case 'DELETE':
                methodColor = '#CC2020';
                break;
            case 'OPTIONS':
                methodColor = '#555';
                break;
            default:
                methodColor = '#FFF';
        }

        let str: string = '';

        // Add request date
        let date: string = tokens.date(req, res, 'iso');
        date = date.slice(0, date.length - 1);
        str += chalk.green(`[${date}] [REQUEST] `);
        // Add request method
        str += chalk.hex(methodColor)(`${padRight(method, 8)}`);
        // Add status of request
        str += chalk.hex(statusColor)(` ${status.toString()} `);
        // Add forwarded for

        str += req.headers['x-forwarded-for'] ? `${req.headers['x-forwarded-for']} ` : '';
        // Add response time of request
        const responseTime: string = tokens['response-time'](req, res);
        str += chalk.reset(padRight(`${responseTime}ms `, 12));
        // Add request id
        str += `${req.id} `;
        // Add url of request
        let url: string = tokens.url(req, res);
        const match: RegExpMatchArray | null = url.match(/([a-zA-Z0-9_\/]+)/);
        if (match !== null) {
            url = match[1];
        }
        str += `${padRight(url, 40)} `;

        return str;
    });
};
