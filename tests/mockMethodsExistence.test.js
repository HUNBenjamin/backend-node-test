import app from '../src/app.js';
import { createMockCollection, attachMockToApp } from './helpers/mockCollection.js';

describe('Mock collection methods existence', () => {
  test('createMockCollection returns required methods as functions', () => {
    const col = createMockCollection();
    expect(typeof col.find).toBe('function');
    expect(typeof col.findOne).toBe('function');
    expect(typeof col.insertOne).toBe('function');
    expect(typeof col.updateOne).toBe('function');
    expect(typeof col.deleteOne).toBe('function');
    expect(typeof col.__clear).toBe('function');
  });

  test('attachMockToApp sets app.locals.collection with those methods', () => {
    const col = createMockCollection();
    attachMockToApp(app, col);
    const attached = app.locals.collection;
    expect(attached).toBeDefined();
    expect(typeof attached.find).toBe('function');
    expect(typeof attached.findOne).toBe('function');
    expect(typeof attached.insertOne).toBe('function');
    expect(typeof attached.updateOne).toBe('function');
    expect(typeof attached.deleteOne).toBe('function');
  });
});
