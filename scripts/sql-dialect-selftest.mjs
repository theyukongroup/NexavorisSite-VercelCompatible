// Self-test for lib/sql-dialect.ts (the SQLite -> PostgreSQL translation used by
// lib/member-db.ts). Run: node --experimental-strip-types scripts/sql-dialect-selftest.mjs
import assert from 'node:assert/strict';
import { SqlDialectError, translateSql } from '../lib/sql-dialect.ts';

const cases = [
  ['placeholders are numbered in order', () => {
    assert.deepEqual(translateSql('SELECT * FROM t WHERE a=? AND b=?'), {
      text: 'SELECT * FROM t WHERE a=$1 AND b=$2',
      paramCount: 2,
    });
  }],
  ['? inside literals, identifiers and comments is left alone', () => {
    assert.deepEqual(
      translateSql(`SELECT 'what?' AS q, "we?ird", 'it''s ?' FROM t -- why?\nWHERE a=? /* ? */`),
      {
        text: `SELECT 'what?' AS q, "we?ird", 'it''s ?' FROM t -- why?\nWHERE a=$1 /* ? */`,
        paramCount: 1,
      },
    );
  }],
  ['origin upsert keeps ON CONFLICT and excluded', () => {
    const { text, paramCount } = translateSql(
      "INSERT INTO admin_staff (user_id,email,display_name,role,active,created_at,updated_at) VALUES (?,?,?,'admin',1,?,?) ON CONFLICT(email) DO UPDATE SET user_id=excluded.user_id,display_name=excluded.display_name,active=1,updated_at=excluded.updated_at",
    );
    assert.equal(paramCount, 5);
    assert.match(text, /VALUES \(\$1,\$2,\$3,'admin',1,\$4,\$5\) ON CONFLICT\(email\)/);
  }],
  ['INSERT OR IGNORE becomes ON CONFLICT DO NOTHING', () => {
    assert.deepEqual(
      translateSql('INSERT OR IGNORE INTO seo_keywords (id,keyword) VALUES (?,?);'),
      { text: 'INSERT INTO seo_keywords (id,keyword) VALUES ($1,$2) ON CONFLICT DO NOTHING', paramCount: 2 },
    );
  }],
  ['literal SQLite keywords inside strings are allowed', () => {
    assert.equal(translateSql("SELECT 'pragma ifnull(' AS x FROM t").paramCount, 0);
  }],
];

const rejected = [
  'INSERT OR IGNORE INTO t (a) VALUES (?) ON CONFLICT(a) DO NOTHING',
  'INSERT OR REPLACE INTO t (a) VALUES (?)',
  'REPLACE INTO t (a) VALUES (?)',
  'PRAGMA optimize',
  'SELECT ifnull(a,0) FROM t',
  "SELECT datetime('now')",
  'SELECT rowid FROM t',
  'SELECT a FROM t WHERE b=?1',
  'SELECT a FROM t WHERE b=$1',
  'SELECT 1; SELECT 2',
  "SELECT 'unterminated",
];
for (const sql of rejected)
  cases.push([`rejects: ${sql}`, () => assert.throws(() => translateSql(sql), SqlDialectError)]);

let failed = 0;
for (const [name, run] of cases) {
  try {
    run();
    console.log(`ok   ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL ${name}\n     ${error.message}`);
  }
}
console.log(`\n${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
