import request from 'supertest';
import app from '../../src/app.js';
import { createMockCollection, attachMockToApp } from '../helpers/mockCollection.js';

/**
 * Szerver inicializálása tesztelése
 * 
 * Ez a teszt fájl a szerver indítási funkcióit teszteli.
 * Azt ellenőrzi, hogy az alkalmazás megfelelően be van-e konfigurálva.
 */
describe('Server initialization (unit)', () => {
  let mockCol;

  beforeEach(() => {
    mockCol = createMockCollection();
  });

  afterEach(() => {
    if (mockCol && mockCol.__clear) {
      mockCol.__clear();
    }
    app.locals.collection = null;
  });

  test('app is defined and is an express application', () => {
    // Az Express app objektumnak vannak alapvető metódusai
    expect(app).toBeDefined();
    expect(typeof app.get).toBe('function');
    expect(typeof app.post).toBe('function');
    expect(typeof app.put).toBe('function');
    expect(typeof app.delete).toBe('function');
    expect(typeof app.use).toBe('function');
  });

  test('app has locals object for test injection', () => {
    // Az app.locals objektum létezik a mock injektálásához
    expect(app.locals).toBeDefined();
    expect(typeof app.locals).toBe('object');
  });

  test('attachMockToApp successfully injects collection into app.locals', () => {
    // Tesztelni, hogy a mock kollekcio beirhato az app.locals-ba
    attachMockToApp(app, mockCol);
    expect(app.locals.collection).toBe(mockCol);
    expect(typeof app.locals.collection.find).toBe('function');
  });

  test('app returns JSON response when collection is available', async () => {
    // Tesztelni, hogy az app JSON-t ad vissza amikor kolelkcio elerheto
    attachMockToApp(app, mockCol);
    const doc = { nev: 'Test', cim: 'Test St', ar: 100000 };
    const insertRes = await mockCol.insertOne(doc);
    const res = await request(app).get(`/api/ingatlan/${insertRes.insertedId}`);
    expect(res.status).toBe(200);
    expect(res.type).toContain('json');
    expect(res.body).toHaveProperty('nev', doc.nev);
  });

  test('app returns 500 when collection methods are missing', async () => {
    // Tesztelni, hogy 500-et ad vissza amikor a kollekcio nincs megadva
    const emptyCol = {};
    attachMockToApp(app, emptyCol);
    const res = await request(app).get('/api/ingatlan');
    expect(res.status).toBe(500);
  });

  test('app handles multiple consecutive requests correctly', async () => {
    // Tesztelni, hogy az app tobb egymas utan kovetkezo kerest kezel
    attachMockToApp(app, mockCol);
    
    // Elso POST
    const post1 = await request(app)
      .post('/api/ingatlan')
      .send({ nev: 'First', cim: 'Addr1', ar: 50000 });
    expect(post1.status).toBe(201);
    
    // Masodik POST
    const post2 = await request(app)
      .post('/api/ingatlan')
      .send({ nev: 'Second', cim: 'Addr2', ar: 60000 });
    expect(post2.status).toBe(201);
    
    // GET lista
    const list = await request(app).get('/api/ingatlan');
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBe(2);
  });

  test('app correctly routes CRUD operations to the collection', async () => {
    // Tesztelni, hogy a CRUD operaciok helyesen vannak atvezetve a kolelkciohoz
    attachMockToApp(app, mockCol);
    
    // CREATE
    const created = await request(app)
      .post('/api/ingatlan')
      .send({ nev: 'Route Test', cim: 'Test St', ar: 75000 });
    const id = created.body._id;
    
    // READ
    const read = await request(app).get(`/api/ingatlan/${id}`);
    expect(read.body.nev).toBe('Route Test');
    
    // UPDATE
    const updated = await request(app)
      .put(`/api/ingatlan/${id}`)
      .send({ ar: 80000 });
    expect(updated.body.ar).toBe(80000);
    
    // DELETE
    const deleted = await request(app).delete(`/api/ingatlan/${id}`);
    expect(deleted.status).toBe(204);
    
    // VERIFY DELETED
    const notFound = await request(app).get(`/api/ingatlan/${id}`);
    expect(notFound.status).toBe(404);
  });
});
