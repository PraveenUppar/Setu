import { describe, it, expect, afterEach } from 'vitest';
import { createFakeStorage, createSupabaseStorage } from './document-storage';

describe('createFakeStorage', () => {
  it('round-trips an upload', async () => {
    const storage = createFakeStorage();
    const bytes = new Uint8Array([1, 2, 3]);

    const uploaded = await storage.upload('m1/incorporation.pdf', bytes, 'application/pdf');
    expect(uploaded).toEqual({ path: 'm1/incorporation.pdf', contentType: 'application/pdf', size: 3 });

    const downloaded = await storage.download('m1/incorporation.pdf');
    expect(downloaded).toEqual(bytes);
  });

  it('throws for a path that was never uploaded', async () => {
    const storage = createFakeStorage();
    await expect(storage.download('nope.pdf')).rejects.toThrow(/no file/i);
  });

  it('lists by prefix', async () => {
    const storage = createFakeStorage();
    await storage.upload('m1/a.pdf', new Uint8Array(), 'application/pdf');
    await storage.upload('m1/b.pdf', new Uint8Array(), 'application/pdf');
    await storage.upload('m4/c.pdf', new Uint8Array(), 'application/pdf');

    expect(await storage.list('m1/')).toEqual(['m1/a.pdf', 'm1/b.pdf']);
  });

  it('removes an uploaded file', async () => {
    const storage = createFakeStorage();
    await storage.upload('m1/a.pdf', new Uint8Array([1]), 'application/pdf');
    await storage.remove('m1/a.pdf');
    await expect(storage.download('m1/a.pdf')).rejects.toThrow(/no file/i);
  });
});

describe('createSupabaseStorage', () => {
  const originalUrl = process.env.SUPABASE_URL;
  const originalPublicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SECRET_KEY;

  afterEach(() => {
    if (originalUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = originalUrl;
    if (originalPublicUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = originalPublicUrl;
    if (originalKey === undefined) delete process.env.SUPABASE_SECRET_KEY;
    else process.env.SUPABASE_SECRET_KEY = originalKey;
  });

  it('fails fast with a clear message when the credentials are missing, rather than failing on first use', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SECRET_KEY;
    expect(() => createSupabaseStorage()).toThrow(/SUPABASE_URL/);
  });

  it('falls back to NEXT_PUBLIC_SUPABASE_URL when SUPABASE_URL is not set, but still requires the secret key', () => {
    delete process.env.SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    delete process.env.SUPABASE_SECRET_KEY;
    expect(() => createSupabaseStorage()).toThrow(/SUPABASE_SECRET_KEY/);
  });
});
