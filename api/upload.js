import { createHash } from 'node:crypto'
import {
  endpoint,
  sameOrigin,
  requireAdmin,
  env,
  token,
  fail,
  rateLimit,
} from '../server/core.js'

export default endpoint(async (req, res) => {
  if (req.method !== 'POST') fail(405, 'Метод не разрешён.')
  sameOrigin(req)
  await requireAdmin(req)
  await rateLimit(req, 'upload', 3600, 100)
  const params = {
    timestamp: Math.floor(Date.now() / 1000),
    public_id: `butterfly/${token()}`,
    overwrite: 'false',
    allowed_formats: 'jpg,jpeg,png,webp,gif',
  }
  const canonical = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  const signature = createHash('sha256')
    .update(canonical + env('CLOUDINARY_API_SECRET'))
    .digest('hex')
  res.status(200).json({
    ...params,
    signature,
    api_key: env('CLOUDINARY_API_KEY'),
    cloud_name: env('CLOUDINARY_CLOUD_NAME'),
  })
})
