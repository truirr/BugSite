// Local Vite adapter for the same handlers deployed as Vercel Functions.
export default function apiPlugin() {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res) => {
        const url = new URL(req.url, 'http://localhost')
        const route = url.pathname.slice(1)
        if (
          !['auth', 'content', 'upload', 'test-start', 'test-result'].includes(
            route,
          )
        ) {
          res.statusCode = 404
          res.end()
          return
        }
        req.query = Object.fromEntries(url.searchParams)
        res.status = (status) => {
          res.statusCode = status
          return res
        }
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(data))
          return res
        }
        res.redirect = (status, location) => {
          res.statusCode = status
          res.setHeader('Location', location)
          res.end()
          return res
        }
        try {
          const chunks = []
          let size = 0
          for await (const chunk of req) {
            size += chunk.length
            if (size > 1000000) {
              res.status(413).json({ message: 'Слишком большой запрос.' })
              return
            }
            chunks.push(chunk)
          }
          const raw = Buffer.concat(chunks).toString()
          if (raw) {
            try {
              req.body = JSON.parse(raw)
            } catch {
              res.status(400).json({ message: 'Некорректный JSON.' })
              return
            }
          }
          const { default: handler } = await server.ssrLoadModule(
            `/api/${route}.js`,
          )
          await handler(req, res)
        } catch {
          if (!res.writableEnded)
            res.status(500).json({ message: 'Ошибка локального API.' })
        }
      })
    },
  }
}
