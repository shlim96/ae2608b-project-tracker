import { setSignedCookie, getSignedCookie, deleteCookie } from 'hono/cookie';

const COOKIE_NAME = 'session';

async function setSession(c, userId) {
  await setSignedCookie(c, COOKIE_NAME, String(userId), c.env.SESSION_SECRET, {
    httpOnly: true,
    sameSite: 'Lax',
    path: '/',
  });
}

async function getSession(c) {
  return getSignedCookie(c, c.env.SESSION_SECRET, COOKIE_NAME);
}

function clearSession(c) {
  deleteCookie(c, COOKIE_NAME, { path: '/' });
}

export { setSession, getSession, clearSession };
