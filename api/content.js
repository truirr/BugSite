import {
  endpoint,
  getContent,
  saveContent,
  requireAdmin,
  sameOrigin,
  body,
  fail,
} from '../server/core.js'
import { validateContent } from '../server/validation.js'

export default endpoint(async (req, res) => {
  if (req.method === 'GET') {
    if (req.query.admin === '1') {
      await requireAdmin(req)
      return res.status(200).json(await getContent())
    }
    const { groups, gallery, tests } = await getContent()
    return res.status(200).json({
      groups,
      gallery,
      combinedCount: Math.min(
        16,
        tests.reduce((sum, t) => sum + t.questions.length, 0),
      ),
      tests: tests.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        icon: t.icon,
        count: t.randomCount || t.questions.length,
      })),
    })
  }
  if (req.method === 'PUT') {
    sameOrigin(req)
    await requireAdmin(req)
    const content = validateContent(body(req))
    return res.status(200).json(await saveContent(content, content.revision))
  }
  fail(405, 'Метод не разрешён.')
})
