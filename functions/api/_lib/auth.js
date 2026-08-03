import { createRemoteJWKSet, jwtVerify } from 'jose';

let cachedJwks = null;

export async function verifySession(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const supabaseUrl = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL;
  if (!supabaseUrl) return null;

  if (!cachedJwks) {
    cachedJwks = createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`));
  }

  try {
    const { payload } = await jwtVerify(authHeader.slice(7), cachedJwks, {
      issuer: `${supabaseUrl}/auth/v1`,
      audience: 'authenticated',
    });
    return { id: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}
