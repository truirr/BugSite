import { useEffect, useState } from 'react'
import { api } from './api'

export default function useContent() {
  const [content, setContent] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    api('/api/content')
      .then((data) => {
        if (active) setContent(data)
      })
      .catch((e) => {
        if (active) setError(e.message)
      })
    return () => {
      active = false
    }
  }, [])
  return { content, error }
}
