import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import seed from './seed.json' with { type: 'json' }
import { validateContent, grade } from './validation.js'
import { authorize, hash, key } from './core.js'
import contentHandler from '../api/content.js'
import authHandler from '../api/auth.js'
import startHandler from '../api/test-start.js'
import resultHandler from '../api/test-result.js'
import uploadHandler from '../api/upload.js'

const store = new Map()
let roles = [],
  webhookOK = true,
  webhookCalls = 0,
  webhookPayload
const originalFetch = globalThis.fetch
Object.assign(process.env, {
  APP_URL: 'https://site.example',
  UPSTASH_REDIS_REST_URL: 'https://redis.example',
  UPSTASH_REDIS_REST_TOKEN: 'test',
  DISCORD_ADMIN_USER_IDS: 'owner',
  DISCORD_ADMIN_ROLE_ID_1: 'role-1',
  DISCORD_ADMIN_ROLE_ID_2: 'role-2',
  DISCORD_GUILD_ID: 'guild',
  DISCORD_TEST_WEBHOOK_URL: 'https://webhook.example',
  CLOUDINARY_CLOUD_NAME: 'demo',
  CLOUDINARY_API_KEY: 'key',
  CLOUDINARY_API_SECRET: 'secret',
})
globalThis.fetch = async (url, options) => {
  if (url === 'https://redis.example') {
    const [cmd, ...args] = JSON.parse(options.body)
    let result = null
    if (cmd === 'GET') result = store.get(args[0]) ?? null
    else if (cmd === 'GETDEL') {
      result = store.get(args[0]) ?? null
      store.delete(args[0])
    } else if (cmd === 'DEL') result = Number(store.delete(args[0]))
    else if (cmd === 'SET') {
      if (!args.includes('NX') || !store.has(args[0])) {
        store.set(args[0], args[1])
        result = 'OK'
      }
    } else if (cmd === 'EVAL') {
      const [script, , k, a, b] = args
      if (script.includes('INCR')) {
        result = Number(store.get(k) || 0) + 1
        store.set(k, result)
      } else if (script.includes('cjson.decode')) {
        const rev = store.has(k) ? JSON.parse(store.get(k)).revision : 0
        result = rev === a ? 1 : 0
        if (result) store.set(k, b)
      } else {
        result = 0
        if (store.get(k) === a) {
          store.delete(k)
          result = 1
        }
      }
    } else throw new Error(`Unexpected command: ${cmd}`)
    return Response.json({ result })
  }
  if (url.includes('/users/@me/guilds/')) return Response.json({ roles })
  if (url === 'https://webhook.example') {
    webhookCalls++
    webhookPayload = JSON.parse(options.body)
    return new Response(null, { status: webhookOK ? 204 : 500 })
  }
  throw new Error(`Unexpected external request: ${url}`)
}
test.after(() => {
  globalThis.fetch = originalFetch
})
async function request(
  handler,
  {
    method = 'GET',
    query = {},
    body,
    session = false,
    source = 'https://site.example',
  } = {},
) {
  const sid = 'a'.repeat(64)
  if (session)
    store.set(
      key(`session:${hash(sid)}`),
      JSON.stringify({
        user: { id: 'owner', name: 'Admin' },
        accessToken: 'token',
      }),
    )
  const res = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v
    },
    status(code) {
      this.statusCode = code
      return this
    },
    json(data) {
      this.data = data
      return this
    },
    redirect(code, location) {
      this.statusCode = code
      this.location = location
    },
  }
  await handler(
    {
      method,
      query,
      body,
      headers: {
        origin: source,
        'content-type': 'application/json',
        cookie: session ? `bf_session=${sid}` : '',
        'x-forwarded-for': 'test',
      },
    },
    res,
  )
  return res
}
test('seed migration preserves seven tests; rejects invalid answers and image URLs', () => {
  assert.equal(validateContent(seed).tests.length, 7)
  const bad = structuredClone(seed)
  bad.tests[0].questions[0].answer = 99
  assert.throws(() => validateContent(bad), { status: 400 })
  bad.tests = []
  bad.groups[0].members[0].avatar = 'javascript:alert(1)'
  assert.throws(() => validateContent(bad), { status: 400 })
})
test('grading rejects incomplete/out-of-range submissions and computes scores', () => {
  const attempt = {
    questions: [
      { answer: 1, options: ['A', 'B'] },
      { answer: 0, options: ['C', 'D'] },
    ],
  }
  assert.deepEqual(grade(attempt, [1, 1]), {
    correct: 1,
    total: 2,
    percent: 50,
  })
  assert.throws(() => grade(attempt, [1]), { status: 400 })
  assert.throws(() => grade(attempt, [1, 9]), { status: 400 })
})
test('owner OR either role grants access; missing/revoked roles deny it', async () => {
  await authorize({ id: 'owner' }, 'token')
  for (const role of ['role-1', 'role-2']) {
    roles = [role]
    await authorize({ id: 'member' }, 'token')
  }
  roles = []
  await assert.rejects(authorize({ id: 'member' }, 'token'), { status: 403 })
})
test('public content does not expose questions/answers; writes require login and same origin', async () => {
  store.clear()
  const publicRes = await request(contentHandler)
  assert.equal(publicRes.statusCode, 200)
  assert.equal(JSON.stringify(publicRes.data).includes('"answer"'), false)
  assert.equal(
    (await request(contentHandler, { query: { admin: '1' } })).statusCode,
    401,
  )
  assert.equal(
    (await request(contentHandler, { method: 'PUT', body: seed })).statusCode,
    401,
  )
  assert.equal(
    (
      await request(contentHandler, {
        method: 'PUT',
        body: seed,
        session: true,
        source: 'https://evil.example',
      })
    ).statusCode,
    403,
  )
  assert.equal(
    (await request(uploadHandler, { method: 'POST' })).statusCode,
    401,
  )
})
test('content persists and rejects stale admin revisions', async () => {
  store.clear()
  const modified = structuredClone(seed)
  modified.groups[0].members[0].name = 'Updated'
  modified.gallery.push({
    id: 'photo',
    caption: 'New',
    url: 'https://res.cloudinary.com/demo/image/upload/photo.jpg',
  })
  const saved = await request(contentHandler, {
    method: 'PUT',
    body: modified,
    session: true,
  })
  assert.equal(saved.statusCode, 200)
  assert.equal(saved.data.revision, 1)
  assert.equal(
    (await request(contentHandler)).data.groups[0].members[0].name,
    'Updated',
  )
  assert.equal(
    (
      await request(contentHandler, {
        method: 'PUT',
        body: modified,
        session: true,
      })
    ).statusCode,
    409,
  )
})
test('OAuth rejects missing/mismatched state without creating a session', async () => {
  const response = await request(authHandler, {
    query: { action: 'callback', state: 'fake', code: 'fake' },
  })
  assert.equal(response.statusCode, 302)
  assert.match(response.location, /^\/admin\?error=/)
  assert.equal(response.headers['Set-Cookie'], undefined)
})
test('signed uploads exclude the Cloudinary secret and constrain formats', async () => {
  store.clear()
  const response = await request(uploadHandler, {
    method: 'POST',
    session: true,
  })
  assert.equal(response.statusCode, 200)
  const { signature, cloud_name, api_key, ...params } = response.data
  assert.equal(cloud_name, 'demo')
  assert.equal(api_key, 'key')
  const canonical = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  assert.equal(
    signature,
    createHash('sha256')
      .update(canonical + 'secret')
      .digest('hex'),
  )
  assert.equal(JSON.stringify(response.data).includes('secret'), false)
})
test('attempts hide answers, grade server-side, freeze results and retry webhook without resending success', async () => {
  store.clear()
  webhookCalls = 0
  webhookOK = false
  const started = await request(startHandler, {
    method: 'POST',
    body: { testId: 'anatomy', fullName: 'Tester', position: 'Student' },
  })
  assert.equal(started.statusCode, 200)
  assert.equal(started.data.questions[0].answer, undefined)
  const { attemptId } = started.data
  const snapshot = JSON.parse(store.get(key(`attempt:${hash(attemptId)}`)))
  const answers = snapshot.questions.map((q) => q.answer)
  const first = await request(resultHandler, {
    method: 'POST',
    body: { attemptId, answers, correct: 0, percent: 0 },
  })
  assert.equal(first.data.percent, 100)
  assert.equal(first.data.sent, false)
  webhookOK = true
  const retry = await request(resultHandler, {
    method: 'POST',
    body: { attemptId, answers: [] },
  })
  assert.equal(retry.data.percent, 100)
  assert.equal(retry.data.sent, true)
  await request(resultHandler, {
    method: 'POST',
    body: { attemptId, answers: [] },
  })
  assert.equal(webhookCalls, 2)
  assert.equal(webhookPayload.content, '<@&1331027554378846329>')
  assert.deepEqual(webhookPayload.allowed_mentions, {
    parse: [],
    roles: ['1331027554378846329'],
  })
})
