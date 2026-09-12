import axios from "axios"

export const axiosAPI = axios.create({
     baseURL: import.meta.env.VITE_BASE_URL,
     paramsSerializer: {
          encode: (param) => param,
     },
})

// ── Har so'rovga access tokenni qo'shish ──
axiosAPI.interceptors.request.use((config) => {
     const token = localStorage.getItem("gilam-auth-token")
     if (token && token !== "undefined" && token !== "null") {
          config.headers.Authorization = `Bearer ${token}`
     }
     return config
})

// ── 401 bo'lganda avval "auth/token/refresh/" orqali yangi access token olishga urinamiz;
// bir vaqtning o'zida bir nechta so'rov 401 qaytarsa ham, refresh faqat bitta marta yuboriladi
// (parallel so'rovlar shu bitta natijani kutadi). Faqat muvaffaqiyatsiz bo'lsa (yoki refresh
// token umuman yo'q bo'lsa) foydalanuvchi tizimdan chiqariladi.
let refreshPromise = null

function clearAuthAndRedirect() {
     localStorage.removeItem("access_token")
     localStorage.removeItem("refresh_token")
     localStorage.removeItem("gilam-auth-token")
     localStorage.removeItem("gilam-auth-user")
     if (window.location.pathname !== "/login") {
          window.location.href = "/login"
     }
}

function refreshAccessToken() {
     if (!refreshPromise) {
          const refreshToken = localStorage.getItem("refresh_token")
          if (!refreshToken) {
               refreshPromise = Promise.reject(new Error("Refresh token yo'q"))
          } else {
               refreshPromise = axios
                    .post(`${import.meta.env.VITE_BASE_URL}auth/token/refresh/`, { refresh: refreshToken })
                    .then((response) => {
                         const payload = response.data?.data || response.data
                         const access = payload?.access
                         if (!access) throw new Error("Yangi token olinmadi")
                         localStorage.setItem("access_token", access)
                         localStorage.setItem("gilam-auth-token", access)
                         if (payload?.refresh) localStorage.setItem("refresh_token", payload.refresh)
                         return access
                    })
                    .finally(() => {
                         refreshPromise = null
                    })
          }
     }
     return refreshPromise
}

axiosAPI.interceptors.response.use(
     (response) => response,
     async (error) => {
          const status = error?.response?.status
          const config = error?.config || {}
          const url = config.url || ""
          // Login va refresh so'rovlarining o'zini istisno qilamiz — ular xatoni to'g'ridan-to'g'ri ko'rsatadi.
          const isAuthRequest = url.includes("auth/login") || url.includes("auth/token/refresh")

          if (status === 401 && !isAuthRequest) {
               if (config._retried) {
                    clearAuthAndRedirect()
                    return Promise.reject(error)
               }
               config._retried = true
               try {
                    const access = await refreshAccessToken()
                    config.headers = { ...config.headers, Authorization: `Bearer ${access}` }
                    return axiosAPI(config)
               } catch {
                    clearAuthAndRedirect()
                    return Promise.reject(error)
               }
          }
          return Promise.reject(error)
     }
)
