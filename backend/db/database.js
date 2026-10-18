const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'universal.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

/** @type {import('node:sqlite').DatabaseSync} */
let db;

/**
 * Returns the singleton DB instance using Node.js native SQLite (DatabaseSync).
 * To migrate to PostgreSQL: swap this out with a pg Pool and update
 * all callers to use async/await — routes use only standard SQL.
 */
function getDB() {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA foreign_keys = ON;');
  }
  return db;
}

/**
 * Initialises the DB by executing schema.sql (idempotent — uses IF NOT EXISTS).
 */
async function initDB() {
  const database = getDB();
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  database.exec(schema);
  console.log('✅ Database ready:', DB_PATH);
  return database;
}

module.exports = { getDB, initDB };
