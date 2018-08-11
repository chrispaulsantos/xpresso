import * as express from 'express';
import * as ws from 'express-ws';
import { connection, Schema } from 'mongoose';
import { {{className}}Document } from '../../src/models/{{routeName}}';
import { {{className}}Routes } from '../../src/routes/{{routeName}}';

beforeAll(() => {
    // Need to define model on connection
    connection.model<{{className}}Document>('{{routeName}}', new Schema());
});

test('initialize - contains routes', () => {
    const app = ws(express()).app;
    {{className}}Routes.initialize(app);

    const routes = app._router.stack.map(
        (layer:any) => {
            return layer.route 
                ? {
                    path: layer.route.path,
                    method: Object.keys(layer.route.methods)[0]
                }
                : undefined
    });

    expect(routes).toContainEqual({ path: '/{{routeName}}', method: 'get' });
    expect(routes).toContainEqual({ path: '/{{routeName}}', method: 'post' });
    expect(routes).toContainEqual({ path: '/{{routeName}}/:id', method: 'get' });
    expect(routes).toContainEqual({ path: '/{{routeName}}/:id', method: 'put' });
    expect(routes).toContainEqual({ 
        path: '/{{routeName}}/:id', 
        method: 'delete'
    });
});