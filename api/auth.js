import {
  endpoint,
  env,
  origin,
  token,
  hash,
  key,
  redis,
  cookie,
  setCookie,
  sameOrigin,
  discord,
  authorize,
  requireAdmin,
  fail,
  rateLimit,
} from '../server/core.js'

export default endpoint(async (req, res) => {
  const action = req.query.action
  if (req.method === 'GET' && action === 'login') {
    await rateLimit(req, 'login', 60, 20)
    const state = token()
    await redis('SET', key(`oauth:${hash(state)}`), '1', 'EX', 600)
    setCookie(res, 'bf_oauth', state, 600)
    const params = new URLSearchParams({
      client_id: env('DISCORD_CLIENT_ID'),
      redirect_uri: `${origin()}/api/auth?action=callback`,
      response_type: 'code',
      scope: 'identify guilds.members.read',
      state,
    })
    return res.redirect(302, `https://discord.com/oauth2/authorize?${params}`)
  }
  if (req.method === 'GET' && action === 'callback') {
    try {
      const state = req.query.state
      if (
        typeof state !== 'string' ||
        !/^[a-f0-9]{64}$/.test(state) ||
        cookie(req, 'bf_oauth') !== state
      )
        fail(400, 'Некорректное состояние авторизации.')
      if (!(await redis('GETDEL', key(`oauth:${hash(state)}`))))
        fail(400, 'Авторизация истекла.')
      if (req.query.error || typeof req.query.code !== 'string')
        fail(400, 'Авторизация отменена.')
      const response = await fetch('https://discord.com/api/v10/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: env('DISCORD_CLIENT_ID'),
          client_secret: env('DISCORD_CLIENT_SECRET'),
          grant_type: 'authorization_code',
          code: req.query.code,
          redirect_uri: `${origin()}/api/auth?action=callback`,
        }),
        signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) fail(401, 'Discord не подтвердил вход.')
      const credentials = await response.json()
      const user = await discord('/users/@me', credentials.access_token)
      await authorize(user, credentials.access_token)
      const sid = token()
      const ttl = Math.min(28800, credentials.expires_in)
      const previous = cookie(req, 'bf_session')
      if (previous) await redis('DEL', key(`session:${hash(previous)}`))
      await redis(
        'SET',
        key(`session:${hash(sid)}`),
        JSON.stringify({
          user: { id: user.id, name: user.global_name || user.username },
          accessToken: credentials.access_token,
        }),
        'EX',
        ttl,
      )
      setCookie(res, 'bf_session', sid, ttl)
      return res.redirect(302, '/admin')
    } catch (error) {
      return res.redirect(
        302,
        `/admin?error=${encodeURIComponent(error.status ? error.message : 'Не удалось войти. Попробуйте ещё раз.')}`,
      )
    }
  }
  if (req.method === 'GET' && action === 'session') {
    const session = await requireAdmin(req)
    return res.status(200).json({ user: session.user })
  }
  if (req.method === 'POST' && action === 'logout') {
    sameOrigin(req)
    const sid = cookie(req, 'bf_session')
    if (sid) await redis('DEL', key(`session:${hash(sid)}`))
    setCookie(res, 'bf_session', '', 0)
    return res.status(200).json({ success: true })
  }
  fail(405, 'Метод не разрешён.')
})
