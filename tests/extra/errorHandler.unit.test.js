import errorHandler from '../../src/middleware/errorHandler.js';

// Hibakezelő middleware tesztelése

describe('errorHandler (unit)', () => {
  const originalEnv = process.env.NODE_ENV;
  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  // Termelésben az hibak részletei rejtve vannak
  test('production hides error details', () => {
    process.env.NODE_ENV = 'production';

    const err = new Error('boom-prod');
    const req = {};
    const res = {
      headersSent: false,
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.payload = payload; return this; }
    };

    let nextCalled = false;
    const next = (e) => { nextCalled = e; };

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res.payload).toHaveProperty('message', 'boom-prod');
    expect(res.payload).not.toHaveProperty('error');
    expect(nextCalled).toBe(false);
  });

  // Fejlesztésben a hibák teljes részletei megjelennek
  test('development includes error details', () => {
    process.env.NODE_ENV = 'development';

    const err = new Error('boom-dev');
    const req = {};
    const res = {
      headersSent: false,
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.payload = payload; return this; }
    };

    let nextCalled = false;
    const next = (e) => { nextCalled = e; };

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res.payload).toHaveProperty('message', 'boom-dev');
    expect(res.payload).toHaveProperty('error');
    expect(typeof res.payload.error.stack).toBe('string');
    expect(nextCalled).toBe(false);
  });

  // Ha már elküldtek fejléc, a next() függvényt hívja meg
  test('calls next when headersSent is true', () => {
    process.env.NODE_ENV = 'production';

    const err = new Error('boom');
    const req = {};
    const res = { headersSent: true };

    let captured;
    const next = (e) => { captured = e; };

    errorHandler(err, req, res, next);

    expect(captured).toBe(err);
  });
});
