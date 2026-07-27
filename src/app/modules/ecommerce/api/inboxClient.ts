import { GraphQLClient } from 'graphql-request'

export const getInboxClient = () => {
  const token = localStorage.getItem('accessToken') || ''
  let rawUrl =
    import.meta.env.VITE_ISI_API_INBOX_URL || import.meta.env.ISI_API_INBOX_URL || 'http://localhost:4000/api'
  if (rawUrl.startsWith('/')) {
    rawUrl = window.location.origin + rawUrl
  }
  return new GraphQLClient(rawUrl, {
    headers: { Authorization: `Bearer ${token}` },
  })
}
