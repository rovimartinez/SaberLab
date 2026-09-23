import { createSessionToken } from '../_lib/auth.js';
import { notifyAdminsNewRequest, notifyStudentDecision } from '../_lib/access-notifications.js';

function getBaseAppUrl(request, env) {
  const url = new URL(request.url);
  const referer = request.headers.get('referer');
  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');

  // 1. Detectar si estamos en entorno local (Vite + Wrangler)
  const isLocal =
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    (referer && (referer.includes('localhost') || referer.includes('127.0.0.1'))) ||
    (forwardedHost && (forwardedHost.includes('localhost') || forwardedHost.includes('127.0.0.1'))) ||
    (env.APP_URL && env.APP_URL.includes('localhost'));

  if (isLocal) {
    // En local, Google OAuth SIEMPRE requiere la URL canónica registrada:
    // http://localhost:5173 (NUNCA la IP 127.0.0.1 ni el puerto 8788 interno de Wrangler)
    return 'http://localhost:5173';
  }

  // 2. Si APP_URL está definido en producción (Cloudflare Pages)
  if (env.APP_URL && !env.APP_URL.includes('localhost')) {
    return env.APP_URL;
  }

  // 3. En producción, normalizar si viene de una URL con hash de preview (ej: 6d66d517.saberlab.pages.dev)
  const host = forwardedHost || url.hostname;
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    const hashMatch = host.match(/^[0-9a-f]{8}\.(.+)$/);
    if (hashMatch) {
      return `https://${hashMatch[1]}`;
    }
    return `https://${host}`;
  }

  return 'https://saberlab.pages.dev';
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const rawState = url.searchParams.get('state');

  // Recuperar el origen exacto y código de invitación desde state o fallback
  let appUrl = getBaseAppUrl(request, env);
  let joinCode = '';
  if (rawState) {
    try {
      const parsedState = JSON.parse(atob(rawState));
      if (parsedState?.appUrl) {
        appUrl = parsedState.appUrl;
      }
      if (parsedState?.joinCode) {
        joinCode = parsedState.joinCode;
      }
    } catch {
      if (rawState.startsWith('http')) {
        appUrl = rawState;
      }
    }
  }

  const redirectUri = new URL('/api/auth/callback', appUrl).toString();

  if (error) {
    return Response.redirect(`${appUrl}/login?error=${encodeURIComponent(error)}`, 302);
  }

  if (!code) {
    return Response.redirect(`${appUrl}/login?error=missing_code`, 302);
  }

  try {
    // 1. Intercambiar el código por tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok || !tokens.access_token) {
      const errorMessage = tokens.error_description || tokens.error || 'Token exchange failed';
      return new Response(`OAuth token exchange failed: ${errorMessage}. Redirect URI was: ${redirectUri}`, { status: 500 });
    }

    // 2. Obtener datos del usuario de Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userRes.ok) {
      const errorText = await userRes.text();
      return new Response(`Google userinfo fetch failed: ${userRes.status} ${userRes.statusText} - ${errorText}`, { status: 500 });
    }

    const googleUser = await userRes.json();

    const email = (googleUser.email || '').toLowerCase();
    if (!email) {
      return Response.redirect(`${appUrl}/login?error=no_email`, 302);
    }

    // 3. Asegurar que las tablas de perfiles y solicitudes_acceso existen en D1
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS perfiles (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        full_name TEXT,
        avatar_url TEXT,
        role TEXT NOT NULL DEFAULT 'student',
        created_at TEXT DEFAULT (datetime('now'))
      )
    `).run();

    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS solicitudes_acceso (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now'))
      )
    `).run();

    // Blindaje de schema: reviewed_at y access_status pueden faltar por migraciones parciales
    try {
      await env.DB.prepare('ALTER TABLE solicitudes_acceso ADD COLUMN reviewed_at TEXT').run();
    } catch {}
    try {
      await env.DB.prepare('ALTER TABLE perfiles ADD COLUMN access_status TEXT').run();
    } catch {}

    // 4. Buscar si el usuario ya existe en D1
    const userId = googleUser.id || email;
    const isAdmin = email === (env.ADMIN_EMAIL || '').toLowerCase();
    let profile = await env.DB.prepare(
      'SELECT id, email, full_name, avatar_url, role FROM perfiles WHERE id = ? OR LOWER(email) = LOWER(?)'
    ).bind(userId, email).first();

    // 4.1 Validar joinCode si fue proporcionado
    let validatedCodeRow = null;
    let codeError = null;

    if (joinCode) {
      const cleanJoinCode = joinCode.trim().toUpperCase().replace(/\s+/g, '');
      try {
        const found = await env.DB.prepare(`
          SELECT c.*, g.course_id as group_course_id, g.name as group_name 
          FROM codigos_grupo c 
          LEFT JOIN grupos g ON c.group_id = g.id 
          WHERE UPPER(c.code) = ? OR REPLACE(UPPER(c.code), "-", "") = REPLACE(?, "-", "")
          ORDER BY c.id DESC LIMIT 1
        `).bind(cleanJoinCode, cleanJoinCode).first();

        if (!found) {
          codeError = 'not_found';
        } else if (found.expires_at) {
          const exp = new Date(found.expires_at);
          if (!isNaN(exp.getTime()) && exp < new Date()) {
            codeError = 'expired';
          } else {
            validatedCodeRow = found;
          }
        } else {
          validatedCodeRow = found;
        }
      } catch (errCode) {
        console.error('Error validating joinCode in callback:', errCode);
      }
    }

    // 4.2 Si es un usuario nuevo (no existe perfil previo) y no es admin:
    // REGLA ESTRICTA: Nadie puede unirse a SaberLab sin un código de invitación válido y vigente.
    if (!profile && !isAdmin) {
      if (!joinCode || codeError || !validatedCodeRow) {
        const errorType = codeError === 'expired' ? 'expired' : (codeError === 'not_found' ? 'not_found' : 'code_required');
        return Response.redirect(`${appUrl}/join?error=${errorType}&code=${encodeURIComponent(joinCode || '')}`, 302);
      }
    }

    const avatarUrl = googleUser.picture || (profile ? profile.avatar_url : null);
    const fullName = googleUser.name || (profile ? profile.full_name : null);

    if (!profile) {
      const role = isAdmin ? 'admin' : 'student';
      await env.DB.prepare(
        `INSERT INTO perfiles (id, email, full_name, avatar_url, role, created_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`
      ).bind(userId, email, fullName, avatarUrl, role).run();
      profile = { id: userId, email, full_name: fullName, avatar_url: avatarUrl, role };
    } else {
      // Actualizar avatar_url y full_name siempre que Google envíe datos nuevos
      await env.DB.prepare(
        `UPDATE perfiles SET 
           avatar_url = COALESCE(?, avatar_url),
           full_name = COALESCE(?, full_name),
           role = CASE WHEN ? THEN 'admin' ELSE role END
         WHERE id = ? OR LOWER(email) = LOWER(?)`
      ).bind(avatarUrl, fullName, isAdmin ? 1 : 0, profile.id, email).run();
      profile.avatar_url = avatarUrl || profile.avatar_url;
      profile.full_name = fullName || profile.full_name;
      if (isAdmin) profile.role = 'admin';
    }

    // 5. Si entró con un código verificado y vigente, auto-aprobar e inscribir directamente en grupo y curso
    let isApproved = isAdmin || profile.role === 'admin';

    if (validatedCodeRow) {
      try {
        const targetCourseId = validatedCodeRow.course_id || validatedCodeRow.group_course_id || 1;
        const targetGroupId = validatedCodeRow.group_id;

        // Inscribir en grupo
        if (targetGroupId) {
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS grupos_usuario (
              user_id TEXT,
              group_id INTEGER,
              PRIMARY KEY (user_id, group_id)
            )
          `).run();

          await env.DB.prepare(
            'INSERT OR IGNORE INTO grupos_usuario (user_id, group_id) VALUES (?, ?)'
          ).bind(userId, targetGroupId).run();
        }

        // Inscribir en curso
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS inscripciones (
            user_id TEXT NOT NULL,
            course_id INTEGER NOT NULL,
            group_id INTEGER,
            PRIMARY KEY (user_id, course_id)
          )
        `).run();

        await env.DB.prepare(
          'INSERT OR REPLACE INTO inscripciones (user_id, course_id, group_id) VALUES (?, ?, ?)'
        ).bind(userId, targetCourseId, targetGroupId || null).run();

        // Auto-aprobar en solicitudes_acceso
        const existingReq = await env.DB.prepare('SELECT id FROM solicitudes_acceso WHERE lower(email) = ?').bind(email).first();
        if (existingReq) {
          await env.DB.prepare("UPDATE solicitudes_acceso SET status = 'approved', reviewed_at = datetime('now') WHERE id = ?").bind(existingReq.id).run();
        } else {
          await env.DB.prepare("INSERT INTO solicitudes_acceso (email, name, status, created_at, reviewed_at) VALUES (?, ?, 'approved', datetime('now'), datetime('now'))").bind(email, fullName || email).run();
        }

        // Notificar de bienvenida al estudiante auto-aprobado con código
        try {
          await notifyStudentDecision(env, { email, name: fullName, status: 'approved' });
        } catch (notifErr) {
          console.error('Error notificando acceso aprobado (callback):', notifErr);
        }

        isApproved = true;
      } catch (enrollErr) {
        console.error('Error auto-enrolling via validatedCodeRow in callback:', enrollErr);
      }
    } else if (!isApproved) {
      // Si el usuario ya existía previamente pero no tenía invitación, revisar solicitud existente
      const existingReq = await env.DB.prepare(
        'SELECT id, status FROM solicitudes_acceso WHERE lower(email) = ? ORDER BY created_at DESC LIMIT 1'
      ).bind(email).first();

      if (!existingReq) {
        await env.DB.prepare(
          `INSERT INTO solicitudes_acceso (email, name, status, created_at)
           VALUES (?, ?, 'pending', datetime('now'))`
        ).bind(email, googleUser.name || null).run();
        isApproved = false;

        // Notificar a los administradores de que llegó una nueva solicitud pendiente
        try {
          await notifyAdminsNewRequest(env, { name: googleUser.name, email });
        } catch (notifErr) {
          console.error('Error notificando a admins por nueva solicitud (callback):', notifErr);
        }
      } else {
        isApproved = existingReq.status === 'approved';
      }
    }

    // 6. Emitir nuestro token de sesión JWT
    const token = await createSessionToken(profile, env);

    // 7. Redirigir al panel o solicitud de acceso
    let destination = isApproved ? '/dashboard' : '/request-access';
    return Response.redirect(`${appUrl}${destination}#token=${encodeURIComponent(token)}`, 302);
  } catch (err) {
    return new Response(`Auth callback error: ${err.message || err}`, { status: 500 });
  }
}
