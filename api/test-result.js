import {
  endpoint,
  sameOrigin,
  body,
  redis,
  key,
  hash,
  token,
  env,
  fail,
  rateLimit,
} from '../server/core.js'
import { grade } from '../server/validation.js'

export default endpoint(async (req, res) => {
  // Проверяем запрос и находим сохранённую попытку теста.
  if (req.method !== 'POST') fail(405, 'Метод не разрешён.')
  sameOrigin(req)
  const { attemptId, answers } = body(req)
  if (typeof attemptId !== 'string' || !/^[a-f0-9]{64}$/.test(attemptId))
    fail(400, 'Некорректная попытка.')
  await rateLimit(req, 'result', 60, 30)
  const attemptKey = key(`attempt:${hash(attemptId)}`)
  const raw = await redis('GET', attemptKey)
  if (!raw) fail(410, 'Попытка истекла. Начните тест заново.')
  let attempt = JSON.parse(raw)
  if (attempt.sent)
    return res.status(200).json({ ...attempt.result, sent: true })

  // Блокировка защищает от двух одновременных отправок одной попытки.
  const lockKey = `${attemptKey}:lock`
  const lock = token()
  if (!(await redis('SET', lockKey, lock, 'NX', 'EX', 60)))
    fail(409, 'Результат уже отправляется. Подождите несколько секунд.')
  try {
    const fresh = await redis('GET', attemptKey)
    if (!fresh) fail(410, 'Попытка истекла. Начните тест заново.')
    attempt = JSON.parse(fresh)
    if (attempt.sent)
      return res.status(200).json({ ...attempt.result, sent: true })

    // Оценка фиксируется один раз. Повторная отправка её не изменяет.
    if (!attempt.result) {
      attempt.result = {
        ...grade(attempt, answers),
        fullName: attempt.fullName,
        position: attempt.position,
        testTitle: attempt.testTitle,
        date: new Date().toISOString(),
      }
      await redis('SET', attemptKey, JSON.stringify(attempt), 'EX', 7200)
    }
    const result = attempt.result
    let sent = false

    // Сообщение Discord: пинг нужной роли и карточка с результатом.
    try {
      const response = await fetch(env('DISCORD_TEST_WEBHOOK_URL'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          content: '<@&1331027554378846329>',
          allowed_mentions: { parse: [], roles: ['1331027554378846329'] },
          embeds: [
            {
              title: 'Новый результат тестирования',
              color: 0xa985ff,
              fields: [
                { name: 'Участник', value: result.fullName },
                { name: 'Должность', value: result.position },
                { name: 'Тест', value: result.testTitle },
                {
                  name: 'Результат',
                  value: `${result.correct}/${result.total} · ${result.percent}%`,
                },
              ],
              footer: { text: `Попытка ${hash(attemptId).slice(0, 12)}` },
              timestamp: result.date,
            },
          ],
        }),
      })
      sent = response.ok
    } catch {
      // Сохраняем оценку, чтобы пользователь мог повторить отправку.
    }
    if (sent) {
      attempt.sent = true
      await redis('SET', attemptKey, JSON.stringify(attempt), 'EX', 7200)
    }
    res.status(200).json({
      ...result,
      sent,
      message: sent
        ? 'Результат отправлен в Discord.'
        : 'Оценка сохранена, но Discord недоступен или вебхук не настроен. Повторите отправку.',
    })
  } finally {
    await redis(
      'EVAL',
      `
        if redis.call('GET', KEYS[1]) == ARGV[1] then
          return redis.call('DEL', KEYS[1])
        end

        return 0
      `,
      1,
      lockKey,
      lock,
    )
  }
})
