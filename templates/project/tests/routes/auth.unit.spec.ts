import * as express from 'express';
import { AuthRoutes } from '../../src/routes/auth.routes';

test('intialize - contains routes', () => {
    const app = express();
    app.use(AuthRoutes.routes());

    const routes = app._router.stack[app._router.stack.length - 1].handle.stack.map(
        (layer: any) => {
            return layer.route
                ? {
                      path: layer.route.path,
                      method: Object.keys(layer.route.methods)[0]
                  }
                : undefined;
        }
    );

    expect(routes).toContainEqual({ path: '/login', method: 'get' });
});
