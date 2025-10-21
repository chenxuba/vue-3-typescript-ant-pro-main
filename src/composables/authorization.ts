// Cookie key for storing token
export const STORAGE_AUTHORIZE_KEY = 'token'
// HTTP request header name
export const AUTH_HEADER_KEY = 'token'

// Cookie 操作工具函数
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2)
    return parts.pop()?.split(';').shift() || null
  return null
}

function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

function removeCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
}

export const useAuthorization = createGlobalState(() => {
  const token = ref<string | null>(getCookie(STORAGE_AUTHORIZE_KEY))

  watch(token, (newValue) => {
    if (newValue)
      setCookie(STORAGE_AUTHORIZE_KEY, newValue, 7)
    else
      removeCookie(STORAGE_AUTHORIZE_KEY)
  }, { flush: 'sync' }) // 使用同步模式，立即执行

  return token
})
