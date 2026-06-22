import 'dotenv/config'

import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'

const app = express()

const PORT = process.env.PORT || 4000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const DISCORD_TEST_WEBHOOK_URL = process.env.DISCORD_TEST_WEBHOOK_URL

app.set('trust proxy', 1)

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ['POST', 'GET'],
  }),
)

app.use(express.json({ limit: '40kb' }))

const testResultLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  limit: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Слишком много отправок результатов. Отправлять результат можно раз в 2 минуты.',
  },
})

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

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bugsite test webhook backend is running.',
  })
})

app.post('/api/test-result', testResultLimiter, async (req, res) => {
  try {
    if (!DISCORD_TEST_WEBHOOK_URL) {
      return res.status(500).json({
        success: false,
        message: 'DISCORD_TEST_WEBHOOK_URL не указан в .env.',
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

    return res.json({
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
})

app.listen(PORT, () => {
  console.log(`Bugsite backend started on http://localhost:${PORT}`)
})