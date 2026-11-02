export async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  let data
  try {
    data = await response.json()
  } catch {
    throw new Error('Сервер недоступен. Обновите страницу и попробуйте снова.')
  }
  if (!response.ok) {
    const error = new Error(data.message || 'Не удалось выполнить запрос.')
    error.status = response.status
    throw error
  }
  return data
}
export async function uploadImage(file) {
  if (
    !file ||
    !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(
      file.type,
    ) ||
    file.size > 10 * 1024 * 1024
  )
    throw new Error('Выберите JPG, PNG, WebP или GIF до 10 МБ.')
  const { cloud_name, ...params } = await api('/api/upload', {
    method: 'POST',
    body: '{}',
  })
  const form = new FormData()
  Object.entries(params).forEach(([key, value]) => form.append(key, value))
  form.append('file', file)
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
    { method: 'POST', body: form },
  )
  const data = await response.json()
  if (!response.ok)
    throw new Error(
      'Cloudinary не принял изображение. Проверьте настройки и повторите загрузку.',
    )
  return data.secure_url
}
