const request = require('supertest');
import app from '../src/app';

describe('APP', () => {
    it('GET /', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
    });
});
