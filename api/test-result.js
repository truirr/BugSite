const DISCORD_TEST_WEBHOOK_URL = process.env.DISCORD_TEST_WEBHOOK_URL

const rateLimitStore = new Map()

const RATE_LIMIT_TIME = 2 * 60 * 1000

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for']

  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0].trim()
  }

  return req.socket?.remoteAddress || 'unknown'
}

function checkRateLimit(ip) {
  const now = Date.now()
  const lastRequestTime = rateLimitStore.get(ip)

  if (lastRequestTime && now - lastRequestTime < RATE_LIMIT_TIME) {
    const retryAfter = Math.ceil((RATE_LIMIT_TIME - (now - lastRequestTime)) / 1000)

    return {
      allowed: false,
      retryAfter,
    }
  }

  rateLimitStore.set(ip, now)

  return {
    allowed: true,
    retryAfter: 0,
  }
}

function cleanText(value, maxLength = 500) {
  if (typeof value !== 'string') return ''

  return value
    .trim()
    .replaceAll('@everyone', '@\u200beveryone')
    .replaceAll('@here', '@\u200bhere')
    .slice(0, maxLength)
}

function getResultColor(percent) {
  if (percent >= 90) return 0x4ade80
  if (percent >= 50) return 0xfacc15
  return 0xfb7185
}

function getResultStatus(percent) {
  if (percent >= 90) return 'Отличный результат'
  if (percent >= 50) return 'Средний результат'
  return 'Нужно повторить материал'
}

function validateResult(body) {
  const fullName = cleanText(body.fullName, 80)
  const position = cleanText(body.position, 80)
  const testTitle = cleanText(body.testTitle, 120)
  const testId = cleanText(body.testId, 80)

  const total = Number(body.total)
  const correct = Number(body.correct)
  const percent = Number(body.percent)

  if (!fullName) {
    return { ok: false, message: 'Не указано имя и фамилия.' }
  }

  if (!position) {
    return { ok: false, message: 'Не указана должность.' }
  }

  if (!testTitle) {
    return { ok: false, message: 'Не указано название теста.' }
  }

  if (!Number.isFinite(total) || total <= 0 || total > 100) {
    return { ok: false, message: 'Некорректное количество вопросов.' }
  }

  if (!Number.isFinite(correct) || correct < 0 || correct > total) {
    return { ok: false, message: 'Некорректное количество правильных ответов.' }
  }

  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    return { ok: false, message: 'Некорректный процент результата.' }
  }

  return {
    ok: true,
    data: {
      fullName,
      position,
      testTitle,
      testId,
      total,
      correct,
      percent,
      date: cleanText(body.date, 80) || new Date().toLocaleString('ru-RU'),
    },
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Метод не разрешён.',
    })
  }

  try {
    if (!DISCORD_TEST_WEBHOOK_URL) {
      return res.status(500).json({
        success: false,
        message: 'DISCORD_TEST_WEBHOOK_URL не указан в переменных Vercel.',
      })
    }

    const ip = getClientIp(req)
    const rateLimit = checkRateLimit(ip)

    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: `Слишком много отправок. Попробуйте снова через ${rateLimit.retryAfter} сек.`,
      })
    }

    const validation = validateResult(req.body)

    if (!validation.ok) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      })
    }

    const result = validation.data
    const status = getResultStatus(result.percent)

    const discordPayload = {
      username: 'Butterfly Estate Tests',
      avatar_url:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-xKgiBnJXWeGlZUDNf2Ul-XkL-EB3miexuunQ4XlJanIj5w5PKp4mR0nR&s=10',
      embeds: [
        {
          title: 'Новый результат тестирования',
          description: `**${status}**`,
          color: getResultColor(result.percent),
          fields: [
            {
              name: 'Участник',
              value: result.fullName,
              inline: true,
            },
            {
              name: 'Должность',
              value: result.position,
              inline: true,
            },
            {
              name: 'Тест',
              value: result.testTitle,
              inline: false,
            },
            {
              name: 'Результат',
              value: `${result.correct}/${result.total}`,
              inline: true,
            },
            {
              name: 'Процент',
              value: `${result.percent}%`,
              inline: true,
            },
            {
              name: 'Дата',
              value: result.date,
              inline: false,
            },
          ],
          footer: {
            text: 'Дыхание насекомого — система тестирования',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    }

    const discordResponse = await fetch(DISCORD_TEST_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
    })

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text()

      console.error('Discord webhook error:', errorText)

      return res.status(502).json({
        success: false,
        message: 'Discord не принял результат теста.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Результат теста отправлен в Discord.',
    })
  } catch (error) {
    console.error('Test result error:', error)

    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при отправке результата.',
    })
  }
}