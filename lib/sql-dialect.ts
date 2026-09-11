// Vercel-only. The origin site runs its SQL on Cloudflare D1 (SQLite); this
// translates those statements for PostgreSQL so the origin's route files can
// be copied verbatim. Anything that cannot be translated safely throws, so a
// future re-sync that brings in new SQLite-only syntax fails loudly instead of
// misbehaving. No imports: scripts/sql-dialect-selftest.mjs loads this file
// directly with `node --experimental-strip-types`.

export class SqlDialectError extends Error {
  readonly sql: string;
  constructor(message: string, sql: string) {
    super(`${message} in SQL: ${sql.slice(0, 160)}`);
    this.name = 'SqlDialectError';
    this.sql = sql;
  }
}

export type TranslatedSql = { text: string; paramCount: number };

// Checked against the statement with quoted literals and comments blanked out.
const sqliteOnly: ReadonlyArray<readonly [RegExp, string]> = [
  [/\binsert\s+or\s+(?:replace|abort|fail|rollback)\b/i, 'INSERT OR REPLACE/ABORT/FAIL/ROLLBACK'],
  [/\breplace\s+into\b/i, 'REPLACE INTO'],
  [/\bpragma\b/i, 'PRAGMA'],
  [/\browid\b/i, 'rowid'],
  [/\bautoincrement\b/i, 'AUTOINCREMENT'],
  [/\bcollate\s+nocase\b/i, 'COLLATE NOCASE'],
  [/\bglob\b/i, 'GLOB'],
  [
    /\b(?:ifnull|datetime|strftime|julianday|json_extract|json_each|group_concat|last_insert_rowid|changes)\s*\(/i,
    'a SQLite-only function',
  ],
];

const insertOrIgnore = /^(\s*insert)\s+or\s+ignore(\s+into\b)/i;
const cache = new Map<string, TranslatedSql>();

/** End index (exclusive) of the quoted run starting at `start`. */
function closingQuote(sql: string, start: number, quote: string): number {
  let j = start + 1;
  while (j < sql.length) {
    if (sql[j] === quote) {
      if (sql[j + 1] === quote) j += 2;
      else return j + 1;
    } else j += 1;
  }
  throw new SqlDialectError('Unterminated quoted literal', sql);
}

/**
 * Converts `?` placeholders to `$1..$n` (ignoring any inside literals or
 * comments) and rewrites `INSERT OR IGNORE` to `ON CONFLICT DO NOTHING`.
 */
export function translateSql(sql: string): TranslatedSql {
  if (typeof sql !== 'string')
    throw new SqlDialectError('Statement is not a string', String(sql));
  const cached = cache.get(sql);
  if (cached) return cached;

  let text = '';
  let masked = '';
  let paramCount = 0;
  const skip = (end: number, from: number) => {
    text += sql.slice(from, end);
    masked += ' '.repeat(end - from);
    return end;
  };

  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];
    const next = sql[i + 1] ?? '';
    if (ch === "'" || ch === '"') {
      i = skip(closingQuote(sql, i, ch), i);
    } else if (ch === '-' && next === '-') {
      const newline = sql.indexOf('\n', i);
      i = skip(newline === -1 ? sql.length : newline, i);
    } else if (ch === '/' && next === '*') {
      const close = sql.indexOf('*/', i + 2);
      if (close === -1) throw new SqlDialectError('Unterminated comment', sql);
      i = skip(close + 2, i);
    } else if (ch === '$') {
      const tag = /^\$(?:[A-Za-z_][A-Za-z_0-9]*)?\$/.exec(sql.slice(i))?.[0];
      if (tag) {
        const close = sql.indexOf(tag, i + tag.length);
        if (close === -1) throw new SqlDialectError('Unterminated dollar-quoted literal', sql);
        i = skip(close + tag.length, i);
      } else if (/[0-9A-Za-z_]/.test(next)) {
        throw new SqlDialectError('Only ? placeholders are supported (found $ parameter)', sql);
      } else {
        text += ch;
        masked += ch;
        i += 1;
      }
    } else if (ch === '?') {
      if (/[0-9]/.test(next))
        throw new SqlDialectError('Numbered ?N placeholders are not supported', sql);
      paramCount += 1;
      text += `$${paramCount}`;
      masked += ' ';
      i += 1;
    } else {
      text += ch;
      masked += ch;
      i += 1;
    }
  }

  if (masked.replace(/;\s*$/, '').includes(';'))
    throw new SqlDialectError('Multiple statements in one prepare() are not supported', sql);
  for (const [pattern, label] of sqliteOnly)
    if (pattern.test(masked)) throw new SqlDialectError(`SQLite-only syntax (${label})`, sql);

  if (insertOrIgnore.test(masked)) {
    if (/\bon\s+conflict\b|\breturning\b/i.test(masked))
      throw new SqlDialectError('INSERT OR IGNORE combined with ON CONFLICT/RETURNING', sql);
    const rewritten = text.replace(insertOrIgnore, '$1$2');
    if (rewritten === text)
      throw new SqlDialectError('Could not rewrite INSERT OR IGNORE', sql);
    text = `${rewritten.replace(/\s*;?\s*$/, '')} ON CONFLICT DO NOTHING`;
  }

  const result = { text, paramCount };
  cache.set(sql, result);
  return result;
}
