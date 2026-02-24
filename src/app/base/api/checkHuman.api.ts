import axios from 'axios'

/**
 * @description Verificamos si el cliente que esta intentando acceder al servidor es un humano
 * @author isi-template
 * @param token
 */
export const apiCheckHuman = async (token: string): Promise<boolean> => {
  try {
    const url = import.meta.env.ISI_API_URL.slice(0, import.meta.env.ISI_API_URL.lastIndexOf('/'))
    const axiosPost = await axios.post(`${url}/auth/checkCloudflareHuman`, { token })
    return axiosPost.data.success
  } catch (e: any) {
    throw new Error(e.message)
  }
}
