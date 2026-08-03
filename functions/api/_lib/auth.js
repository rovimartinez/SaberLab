import { SignJWT, jwtVerify } from 'jose';

function getSecretKey(env) {
  return new TextEncoder().encode(env.JWT_SECRET);
}

export async function createSessionToken(user, env) {
  return await new SignJWT({ email: user.email, role: user.role ?? 'student' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('7d')
    .setIssuer('saberlab')
    .sign(getSecretKey(env));
}

export async function verifySession(request, env) {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const { payload } = await jwtVerify(header.slice(7), getSecretKey(env), {
      issuer: 'saberlab',
    });
    return { id: payload.sub, email: payload.email, role: payload.role ?? null };
  } catch {
    return null;
  }
}
