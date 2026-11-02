import { createHash, randomBytes } from 'node:crypto'
import seed from './seed.json' with { type: 'json' }

// Ошибки API и настройки окружения.
export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export const fail = (status, message) => {
  throw new HttpError(status, message)
}

export function env(name) {
  const value = process.env[name]?.trim()
  if (!value) fail(503, `Сервис не настроен: ${name}.`)
  return value
}

export function origin() {
  return new URL(env('APP_URL')).origin
}

export const token = () => randomBytes(32).toString('hex')
export const hash = (value) => createHash('sha256').update(value).digest('hex')
export const key = (value) =>
  `${process.env.REDIS_KEY_PREFIX || 'butterfly'}:${value}`

// Постоянное хранилище: запросы Redis и содержимое сайта.
export async function redis(...command) {
  const response = await fetch(env('UPSTASH_REDIS_REST_URL'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env('UPSTASH_REDIS_REST_TOKEN')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) fail(503, 'Хранилище временно недоступно.')
  const data = await response.json()
  if (data.error) fail(503, 'Ошибка хранилища.')
  return data.result
}

export async function getContent() {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  )
    return structuredClone(seed)
  const raw = await redis('GET', key('content'))
  return raw ? JSON.parse(raw) : structuredClone(seed)
}

export async function saveContent(content, revision) {
  const next = { ...content, revision: revision + 1 }

  // Проверка версии и запись выполняются вместе, чтобы администраторы
  // не перезаписали изменения друг друга при одновременном сохранении.
  const script = `
    local old = redis.call('GET', KEYS[1])
    local rev = 0

    if old then
      rev = cjson.decode(old).revision
    end

    if rev ~= tonumber(ARGV[1]) then
      return 0
    end

    redis.call('SET', KEYS[1], ARGV[2])
    return 1
  `
  if (
    !(await redis(
      'EVAL',
      script,
      1,
      key('content'),
      revision,
      JSON.stringify(next),
    ))
  )
    fail(
      409,
      'Другой администратор изменил данные. Обновите страницу перед сохранением.',
    )
  return next
}

// Cookie, проверка источника запроса и общий обработчик API.
export function cookie(req, name) {
  return (
    (req.headers.cookie || '')
      .split(';')
      .map((v) => v.trim())
      .find((v) => v.startsWith(`${name}=`))
      ?.slice(name.length + 1) || ''
  )
}

export function setCookie(res, name, value, maxAge) {
  res.setHeader(
    'Set-Cookie',
    `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${origin().startsWith('https:') ? '; Secure' : ''}`,
  )
}

export function sameOrigin(req) {
  if (req.headers.origin !== origin())
    fail(403, 'Недопустимый источник запроса.')
  if (!req.headers['content-type']?.startsWith('application/json'))
    fail(415, 'Ожидается JSON.')
}

export function body(req) {
  const value = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  if (!value || typeof value !== 'object' || Array.isArray(value))
    fail(400, 'Некорректные данные.')
  if (JSON.stringify(value).length > 800000)
    fail(413, 'Слишком большой запрос.')
  return value
}

export function endpoint(fn) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    try {
      await fn(req, res)
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.status
          ? error.message
          : 'Ошибка сервера. Попробуйте ещё раз.',
      })
    }
  }
}

// Ограничение частоты запросов общее для всех экземпляров сервера.
export async function rateLimit(req, action, seconds, max) {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  const count = await redis(
    'EVAL',
    `
      local n = redis.call('INCR', KEYS[1])

      if n == 1 then
        redis.call('EXPIRE', KEYS[1], ARGV[1])
      end

      return n
    `,
    1,
    key(`limit:${action}:${hash(ip)}`),
    seconds,
  )
  if (count > max) fail(429, 'Слишком много запросов. Попробуйте позже.')
}

// Авторизация Discord: доступ по ID пользователя или одной из ролей.
export async function discord(path, accessToken) {
  const response = await fetch(`https://discord.com/api/v10${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10000),
  })
  if ([401, 403, 404].includes(response.status))
    fail(
      403,
      'Нет доступа. Войдите заново или проверьте роли на сервере Discord.',
    )
  if (!response.ok) fail(503, 'Discord временно недоступен.')
  return response.json()
}

export async function authorize(user, accessToken) {
  const ids = (process.env.DISCORD_ADMIN_USER_IDS || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
  if (ids.includes(user.id)) return
  const roles = [
    process.env.DISCORD_ADMIN_ROLE_ID_1,
    process.env.DISCORD_ADMIN_ROLE_ID_2,
  ]
    .map((v) => v?.trim())
    .filter(Boolean)
  if (!roles.length) fail(403, 'У вашей учётной записи нет доступа к админке.')
  const member = await discord(
    `/users/@me/guilds/${env('DISCORD_GUILD_ID')}/member`,
    accessToken,
  )
  if (!roles.some((role) => member.roles.includes(role)))
    fail(403, 'Нужна одна из разрешённых ролей на сервере Discord.')
}
export async function requireAdmin(req) {
  const sid = cookie(req, 'bf_session')
  if (!/^[a-f0-9]{64}$/.test(sid)) fail(401, 'Войдите через Discord.')
  const raw = await redis('GET', key(`session:${hash(sid)}`))
  if (!raw) fail(401, 'Сессия истекла. Войдите через Discord.')
  const session = JSON.parse(raw)
  await authorize(session.user, session.accessToken)
  return session
}
