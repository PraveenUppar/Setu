import { createClient } from '@supabase/supabase-js';

/**
 * Uploaded source documents (S7) — the one place this project needs a real
 * file store rather than local JSON, because a PDF a promoter or CS uploads
 * has to survive somewhere other than this machine's disk (CLAUDE.md's own
 * plan: "Supabase added at S7 when uploads need it").
 *
 * Interface-first, same reason `LlmClient` is: `createFakeStorage()` lets
 * every caller be tested without a network call or a real bucket (D14's
 * discipline, mechanical rather than a rule to remember).
 */

export interface UploadedDocument {
  path: string;
  contentType: string;
  size: number;
}

export interface DocumentStorage {
  upload(path: string, data: Uint8Array, contentType: string): Promise<UploadedDocument>;
  download(path: string): Promise<Uint8Array>;
  list(prefix?: string): Promise<string[]>;
  remove(path: string): Promise<void>;
}

const BUCKET = 'documents';

function supabaseAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env.local. Project Settings -> API in the Supabase dashboard -> "Connect" gives you both, already named this way.',
    );
  }
  return createClient(url, key);
}

/**
 * One-time provisioning: create the private "documents" bucket if it does
 * not already exist. Idempotent, so it is safe to call from a setup script
 * or on server start rather than requiring a manual dashboard click.
 */
export async function ensureDocumentsBucket(): Promise<{ created: boolean }> {
  const supabase = supabaseAdminClient();
  const { data: existing, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw new Error(`Supabase listBuckets failed: ${listError.message}`);
  if (existing?.some((b) => b.name === BUCKET)) return { created: false };

  const { error: createError } = await supabase.storage.createBucket(BUCKET, { public: false });
  if (createError) throw new Error(`Supabase createBucket failed: ${createError.message}`);
  return { created: true };
}

/**
 * The SECRET key (`sb_secret_...`, Supabase's current replacement for the
 * legacy `service_role` key — anon/service_role are being retired through
 * 2026), not the PUBLISHABLE key (`sb_publishable_...`, the anon
 * replacement). Caught the hard way this session: a publishable key pasted
 * into a service-role-shaped variable name doesn't error at read time, it
 * just fails (or silently under-permissions) at the first RLS-guarded write.
 * `SUPABASE_URL` / `SUPABASE_SECRET_KEY` are the exact names the Supabase
 * dashboard's own "Connect" env export uses — matching them means a fresh
 * copy-paste from the dashboard always lines up, no renaming needed.
 *
 * This runs server-side only (a Next.js API route) — this project has no
 * real auth to scope a publishable key against (one seeded org, a
 * role-switcher, per 02-architecture.md). Never expose this key to the
 * client; it is not prefixed `NEXT_PUBLIC_`.
 *
 * The bucket itself ("documents") is not created by `createSupabaseStorage`
 * on every call — that would be a network round trip before every upload.
 * Call `ensureDocumentsBucket()` once (a setup script, or the first time a
 * server process starts) instead.
 */
export function createSupabaseStorage(): DocumentStorage {
  const supabase = supabaseAdminClient();

  return {
    async upload(path, data, contentType) {
      const { error } = await supabase.storage.from(BUCKET).upload(path, data, { contentType, upsert: false });
      if (error) throw new Error(`Supabase upload failed for "${path}": ${error.message}`);
      return { path, contentType, size: data.byteLength };
    },
    async download(path) {
      const { data, error } = await supabase.storage.from(BUCKET).download(path);
      if (error) throw new Error(`Supabase download failed for "${path}": ${error.message}`);
      return new Uint8Array(await data.arrayBuffer());
    },
    async list(prefix = '') {
      const { data, error } = await supabase.storage.from(BUCKET).list(prefix);
      if (error) throw new Error(`Supabase list failed for prefix "${prefix}": ${error.message}`);
      // `prefix` may or may not carry its own trailing slash (both
      // `list('m1')` and `list('m1/')` are valid calls) — strip it before
      // rejoining, or a caller who already included one gets `m1//file.pdf`.
      const base = prefix.replace(/\/+$/, '');
      return (data ?? []).map((f) => (base ? `${base}/${f.name}` : f.name));
    },
    async remove(path) {
      const { error } = await supabase.storage.from(BUCKET).remove([path]);
      if (error) throw new Error(`Supabase remove failed for "${path}": ${error.message}`);
    },
  };
}

/** In-memory storage for tests — same interface, no network, no bucket. */
export function createFakeStorage(): DocumentStorage & {
  files: Map<string, { data: Uint8Array; contentType: string }>;
} {
  const files = new Map<string, { data: Uint8Array; contentType: string }>();
  return {
    files,
    async upload(path, data, contentType) {
      files.set(path, { data, contentType });
      return { path, contentType, size: data.byteLength };
    },
    async download(path) {
      const f = files.get(path);
      if (!f) throw new Error(`createFakeStorage: no file at "${path}"`);
      return f.data;
    },
    async list(prefix = '') {
      return [...files.keys()].filter((p) => p.startsWith(prefix));
    },
    async remove(path) {
      files.delete(path);
    },
  };
}
