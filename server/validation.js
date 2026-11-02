import { fail } from './core.js'
const text = (v, max, optional = false) => {
  if (typeof v !== 'string' || v.length > max || (!optional && !v.trim()))
    fail(400, 'Проверьте заполнение и длину текстовых полей.')
  return v.trim()
}
function list(v, max, min = 0) {
  if (!Array.isArray(v) || v.length < min || v.length > max)
    fail(400, 'Недопустимое количество элементов.')
  return v
}
function photo(v) {
  if (!v) return ''
  const value = text(v, 2000)
  let url
  try {
    url = new URL(value)
  } catch {
    fail(400, 'Некорректный адрес фотографии.')
  }
  if (
    url.protocol !== 'https:' ||
    ![
      'res.cloudinary.com',
      'cdn.discordapp.com',
      'media.discordapp.net',
    ].includes(url.hostname)
  )
    fail(400, 'Используйте фото из Cloudinary или Discord.')
  return value
}
export function validateContent(input) {
  if (!Number.isSafeInteger(input.revision) || input.revision < 0)
    fail(400, 'Некорректная версия данных.')
  const ids = new Set()
  const tests = list(input.tests, 100).map((t) => {
    const id = text(t.id, 80)
    if (!/^[a-zA-Z0-9_-]+$/.test(id) || id === 'combined' || ids.has(id))
      fail(400, 'ID тестов должны быть уникальными.')
    ids.add(id)
    const questions = list(t.questions, 100, 1).map((q) => {
      const options = list(q.options, 8, 2).map((o) => text(o, 600))
      if (
        !Number.isInteger(q.answer) ||
        q.answer < 0 ||
        q.answer >= options.length
      )
        fail(400, 'Выберите правильный ответ для каждого вопроса.')
      return { question: text(q.question, 1000), options, answer: q.answer }
    })
    if (
      !Number.isInteger(t.randomCount) ||
      t.randomCount < 1 ||
      t.randomCount > questions.length
    )
      fail(
        400,
        'Количество вопросов в попытке должно быть от 1 до размера банка.',
      )
    return {
      id,
      title: text(t.title, 120),
      description: text(t.description, 1000, true),
      icon: text(t.icon, 8),
      randomCount: t.randomCount,
      questions,
    }
  })
  const groups = list(input.groups, 30).map((g) => ({
    rank: text(g.rank, 80),
    icon: text(g.icon, 8),
    members: list(g.members, 100).map((m) => ({
      name: text(m.name, 100),
      avatar: photo(m.avatar),
    })),
  }))
  const gallery = list(input.gallery, 300).map((g) => ({
    id: text(g.id, 100),
    url: photo(g.url),
    caption: text(g.caption, 200, true),
  }))
  if (gallery.some((g) => !g.url)) fail(400, 'Добавьте изображение галереи.')
  return { revision: input.revision, tests, groups, gallery }
}
export function grade(attempt, answers) {
  if (
    !Array.isArray(answers) ||
    answers.length !== attempt.questions.length ||
    answers.some(
      (a, i) =>
        !Number.isInteger(a) ||
        a < 0 ||
        a >= attempt.questions[i].options.length,
    )
  )
    fail(400, 'Ответьте на все вопросы.')
  const correct = answers.filter(
    (a, i) => a === attempt.questions[i].answer,
  ).length
  return {
    correct,
    total: answers.length,
    percent: Math.round((correct / answers.length) * 100),
  }
}
