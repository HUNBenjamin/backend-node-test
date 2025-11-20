export function createMockCollection() {
  const items = new Map();
  return {
    find: () => ({ toArray: async () => Array.from(items.values()) }),
    findOne: async (query) => {
      if (query._id) return items.get(String(query._id)) || null;
      return null;
    },
    insertOne: async (doc) => {
      const id = (Math.floor(Math.random() * 1000000)).toString();
      const stored = { ...doc, _id: id };
      items.set(id, stored);
      return { insertedId: id };
    },
    updateOne: async (query, { $set }) => {
      const id = String(query._id);
      const existing = items.get(id);
      if (!existing) return { matchedCount: 0 };
      const updated = { ...existing, ...$set };
      items.set(id, updated);
      return { matchedCount: 1 };
    },
    deleteOne: async (query) => {
      const id = String(query._id);
      const existed = items.delete(id);
      return { deletedCount: existed ? 1 : 0 };
    },
    __clear: () => items.clear(),
  };
}

export function attachMockToApp(app, mockCol) {
  app.locals.collection = mockCol;
}
