import * as express from 'express';
import { AuthRoutes } from '../../src/routes/auth';

test('generateToken - generates a new token', () => {
    expect(AuthRoutes.generateToken()).toMatch(
        /^[a-zA-Z0-9-_].+\.[a-zA-Z0-9-_].+\.[a-zA-Z0-9-_].+$/
    );
});

test('intialize - contains routes', () => {
    const app = express();
    app.use(AuthRoutes.initialize());

    const routes = app._router.stack[
        app._router.stack.length - 1
    ].handle.stack.map((layer: any) => {
        return layer.route
            ? {
                  path: layer.route.path,
                  method: Object.keys(layer.route.methods)[0]
              }
            : undefined;
    });

    expect(routes).toContainEqual({ path: '/login', method: 'get' });
});
