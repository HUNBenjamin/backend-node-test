import * as db from '../../src/db.js';

/**
 * Adatbázis kapcsolat tesztelése
 * 
 * Ez a teszt fájl az adatbázis csatlakozási funkciókat teszteli.
 * A MongoClient mock-olható, hogy valódi adatbázis nélkül tudjunk tesztelni.
 */
describe('Database connection (unit)', () => {
  test('connect function exists and is callable', () => {
    // ellenőrzi, hogy a connect függvény létezik és hívható
    expect(typeof db.connect).toBe('function');
  });

  test('getClient function exists and is callable', () => {
    // ellenőrzi, hogy a getClient függvény létezik és hívható
    expect(typeof db.getClient).toBe('function');
  });
  
  test('connect accepts a URL parameter', async () => {
    // ellenőrzi, hogy a connect függvény elfogad legalább egy paramétert
    expect(db.connect.length).toBeGreaterThanOrEqual(1);
  });
  
  test('getClient returns undefined initially or the stored client', () => {
    // aktuálius kliens lekérése
    const client = db.getClient();
    // lehet undefined, null vagy objektum
    expect(client === null || client === undefined || typeof client === 'object').toBe(true);
  });
});
