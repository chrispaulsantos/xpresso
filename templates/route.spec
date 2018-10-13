import * as express from 'express';
import * as ws from 'express-ws';
import { connection, Schema } from 'mongoose';
import { {{pascalSingular}}Document } from '../../src/models/{{paramSingular}}';
import { {{pascalSingular}}Routes } from '../../src/routes/{{paramSingular}}';

beforeAll(() => {
    // Need to define model on connection
    connection.model<{{pascalSingular}}Document>('{{paramPlural}}', new Schema());
});

test('initialize - contains routes', () => {
    const app = ws(express()).app;
    app.use({{pascalSingular}}Routes.routes());

    const routes = app._router.stack[
        app._router.stack.length - 1
    ].handle.stack.map(
        (layer:any) => {
            return layer.route 
                ? {
                    path: layer.route.path,
                    method: Object.keys(layer.route.methods)[0]
                }
                : undefined
    });

    expect(routes).toContainEqual({ path: '/{{camelPlural}}', method: 'get' });
    expect(routes).toContainEqual({ path: '/{{camelPlural}}', method: 'post' });
    expect(routes).toContainEqual({ path: '/{{camelPlural}}/:id', method: 'get' });
    expect(routes).toContainEqual({ path: '/{{camelPlural}}/:id', method: 'put' });
    expect(routes).toContainEqual({ 
        path: '/{{camelPlural}}/:id', 
        method: 'delete'
    });
});