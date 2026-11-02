import { randomInt } from 'node:crypto'
import {
  endpoint,
  body,
  sameOrigin,
  rateLimit,
  getContent,
  token,
  hash,
  key,
  redis,
  fail,
} from '../server/core.js'

function shuffle(values) {
  const result = [...values]
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
export default endpoint(async (req, res) => {
  if (req.method !== 'POST') fail(405, 'Метод не разрешён.')
  sameOrigin(req)
  const { testId, fullName, position } = body(req)
  if (
    typeof fullName !== 'string' ||
    !fullName.trim() ||
    fullName.length > 80 ||
    typeof position !== 'string' ||
    !position.trim() ||
    position.length > 80
  )
    fail(400, 'Укажите имя и должность (до 80 символов).')
  await rateLimit(req, 'start', 600, 20)
  const { tests } = await getContent()
  const test =
    testId === 'combined'
      ? {
          id: 'combined',
          title: 'Комбинированный тест',
          randomCount: 16,
          questions: tests.flatMap((t) => t.questions),
        }
      : tests.find((t) => t.id === testId)
  if (!test || !test.questions.length) fail(404, 'Тест не найден.')
  const questions = shuffle(test.questions)
    .slice(0, test.randomCount || test.questions.length)
    .map((q) => {
      const options = shuffle(
        q.options.map((text, i) => ({ text, correct: i === q.answer })),
      )
      return {
        question: q.question,
        options: options.map((o) => o.text),
        answer: options.findIndex((o) => o.correct),
      }
    })
  const id = token()
  await redis(
    'SET',
    key(`attempt:${hash(id)}`),
    JSON.stringify({
      testId: test.id,
      testTitle: test.title,
      fullName: fullName.trim(),
      position: position.trim(),
      questions,
    }),
    'EX',
    7200,
  )
  res.status(200).json({
    attemptId: id,
    questions: questions.map((q) => ({
      question: q.question,
      options: q.options,
    })),
  })
})
