/**
 * Applies database/schema.sql against DATABASE_URL.
 * Idempotent: schema.sql uses CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS.
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const env = require('../config/env');

async function migrate() {
  const schemaPath = path.join(__dirname, '..', '..', '..', 'database', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  const pool = new Pool({ connectionString: env.databaseUrl });
  try {
    console.log('Applying schema from', schemaPath);
    await pool.query(sql);
    console.log('✅ Schema applied successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) migrate();
module.exports = migrate;
