import { axiosAPI } from './axiosAPI'

/**
 * Audit jurnali loglarini olish
 * @param {Object} params - Query parametrlari
 * @param {number} [params.page] - Sahifa raqami
 * @param {string} [params.search] - Qidiruv so'zi
 * @param {number} [params.action] - 0: create, 1: update, 2: delete, 3: access
 * @param {string} [params.actor] - Foydalanuvchi / Actor
 * @param {number|string} [params.content_type] - Model / jadval content type
 * @param {number|string} [params.object_id] - Yozuv ID
 * @param {string} [params.start_date] - Sana dan (YYYY-MM-DD)
 * @param {string} [params.end_date] - Sana gacha (YYYY-MM-DD)
 * @param {string} [params.ordering] - Saralash (masalan '-timestamp' yoki 'timestamp')
 */
export async function getAuditLogs(params = {}) {
  const cleanParams = {}
  for (const [k, v] of Object.entries(params)) {
    if (v !== '' && v !== null && v !== undefined) {
      cleanParams[k] = v
    }
  }

  const response = await axiosAPI.get('audits/logs/', {
    params: cleanParams,
  })
  return response.data
}
