import { SignJWT } from "jose";
const secret = new TextEncoder().encode("1nwxpDE0awuP0zeKo5m9unDhVd+0HEMAOsMUIClKgJI6D4d5eiCwkpfuurUSjgpH");
const token = await new SignJWT({ email: 'test@example.com', role: 'student' })
  .setProtectedHeader({ alg: 'HS256' })
  .setSubject('123')
  .setIssuedAt()
  .setExpirationTime('7d')
  .setIssuer('saberlab')
  .sign(secret);
console.log(token);
