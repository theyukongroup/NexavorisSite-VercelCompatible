// Vercel-only. Configuration is read at request time, never at module load,
// so `next build` succeeds without secrets. There are no defaults: a missing
// value is a deployment mistake and must fail loudly.

/** Returns the first of `names` that is set, or throws naming all of them. */
export function requireEnv(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  throw new Error(
    `Missing environment variable ${names.join(' or ')}. Set it in the Vercel project ` +
      '(Settings > Environment Variables). For local development run `vercel env pull` ' +
      'in a clone on local disk - never on the shared K: drive.',
  );
}
