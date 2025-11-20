import { createMockCollection } from '../helpers/mockCollection.js';

describe('createMockCollection (unit)', () => {
  let col;

  beforeEach(() => {
    col = createMockCollection();
  });

  test('insertOne returns insertedId and findOne retrieves document', async () => {
    const doc = { nev: 'A' };
    const r = await col.insertOne(doc);
    expect(r).toHaveProperty('insertedId');
    const id = r.insertedId;
    const item = await col.findOne({ _id: id });
    expect(item).toBeDefined();
    expect(item).toHaveProperty('_id', id);
    expect(item.nev).toBe(doc.nev);
  });

  test('updateOne updates fields and returns matchedCount', async () => {
    const r = await col.insertOne({ nev: 'B', ar: 10 });
    const id = r.insertedId;
    const res = await col.updateOne({ _id: id }, { $set: { ar: 20 } });
    expect(res).toHaveProperty('matchedCount', 1);
    const after = await col.findOne({ _id: id });
    expect(after).toHaveProperty('ar', 20);
  });

  test('deleteOne removes item and findOne returns null', async () => {
    const r = await col.insertOne({ nev: 'C' });
    const id = r.insertedId;
    const res = await col.deleteOne({ _id: id });
    expect(res).toHaveProperty('deletedCount', 1);
    const after = await col.findOne({ _id: id });
    expect(after).toBeNull();
  });

  test('find returns an object with toArray that yields array', async () => {
    await col.insertOne({ nev: 'X' });
    await col.insertOne({ nev: 'Y' });
    const cursor = col.find();
    expect(typeof cursor.toArray).toBe('function');
    const arr = await cursor.toArray();
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBeGreaterThanOrEqual(2);
  });
});
