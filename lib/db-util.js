import { MongoClient } from 'mongodb';

export async function connectDatabase() {
  return await MongoClient.connect(process.env.MONGODB);
}

export async function insertDocument(client, collection, document) {
  const db = client.db();
  const result = await db.collection(collection).insertOne(document);

  return result;
}

export async function findDocument(client, collection, searchData) {
  const db = client.db();
  const result = await db.collection(collection).findOne(searchData);

  return result;
}

export async function getAllDocuments(client, collection, sort, filter = {}) {
  const db = client.db();

  const documents = await db
    .collection(collection)
    .find(filter)
    .sort(sort)
    .toArray();

  return documents;
}
