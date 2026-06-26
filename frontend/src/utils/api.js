const API_URL = import.meta.env.VITE_API_URL

function getCsrf() {
  const match = document.cookie.match(/csrftoken=([^;]+)/)
  return match ? match[1] : ''
}

export function apiFetch(path, options = {}) {
  const { headers, ...rest } = options
  return fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrf(),
      ...headers,
    },
    ...rest,
  })
}

export function apiUpload(path, formData) {
  return fetch(`${API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'X-CSRFToken': getCsrf() },
    body: formData,
  })
}
