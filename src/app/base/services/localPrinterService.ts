interface LocalPrintServerConfig {
  url: string
  headers: Record<string, string>
  fallbackUrl?: string
}

export const getLocalPrintServerConfig = (): LocalPrintServerConfig => {
  const isDev = import.meta.env.DEV === true
  const token = isDev ? (import.meta.env.ISI_SECRET_PRINTER_TOKEN as string | undefined) : undefined
  const useProxy = isDev

  return {
    url: useProxy ? '/local-printers/print' : 'http://localhost:7777/print',
    fallbackUrl: useProxy ? 'http://localhost:7777/print' : undefined,
    headers: token ? { 'X-Secret-Token': token } : {},
  }
}

export interface PrintBlobToLocalPrinterInput {
  blob: Blob
  printer: string
  filename?: string
}

export const printBlobToLocalPrinter = async ({
  blob,
  printer,
  filename = 'document.pdf',
}: PrintBlobToLocalPrinterInput): Promise<void> => {
  if (!printer) {
    throw new Error('Impresora no definida')
  }

  const formData = new FormData()
  formData.append('file', blob, filename)
  formData.append('printer', printer)

  const { url, headers, fallbackUrl } = getLocalPrintServerConfig()

  const doPrint = async (targetUrl: string, requestHeaders: Record<string, string>) => {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: formData,
    })

    let data: any = null
    let responseText = ''

    try {
      data = await response.clone().json()
    } catch {
      try {
        responseText = await response.text()
      } catch {
        responseText = ''
      }
    }

    if (!response.ok) {
      const errorMsg =
        data?.error || data?.message || responseText || `Print server no disponible (${response.status})`
      throw new Error(String(errorMsg))
    }

    if (data?.error) {
      throw new Error(String(data.error))
    }
  }

  try {
    await doPrint(url, headers)
  } catch (error) {
    const msg = error instanceof Error ? error.message.toLowerCase() : ''
    const canRetryDirect = Boolean(fallbackUrl && url !== fallbackUrl)
    if (canRetryDirect && msg.includes('dominio no permitido')) {
      // Retry directo sin headers custom para evitar preflight/restricciones CORS en localhost.
      await doPrint(fallbackUrl as string, {})
      return
    }
    throw error
  }
}
