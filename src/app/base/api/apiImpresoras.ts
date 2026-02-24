import axios from 'axios'

/*/
fake headers para desarrollo local
 */
const localHeaders =
  import.meta.env.APP_ENV === 'local'
    ? {
        'X-Secret-Token':
          'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJzdWIiOiAiNTkxNzg4MTI1NDgiLCAibmFtZSI6ICJOaWNrIFJ1c3NlbGwiLCAiaWF0IjogMTY4MDMwNzIwMH0.oItFyNgWQlsWHaJ8_fJVyZwEJ0IS9W-d9uBxXJIfqIo',
      }
    : {}

/**
 * Listamos las impresoras disponibles
 * @author isi-template
 * @param host
 */
export const apiListarImpresoras = async (host: string): Promise<{ name: string }[]> => {
  try {
    const response = await axios.get(`${host}/printers`, {
      headers: {},
    })

    const printers = response.data.printers
    return printers.map((name: string) => ({ name }))
  } catch (e: any) {
    throw new Error(`Error en escanear las impresoras disponibles en la red. ${e.message}`)
  }
}

/**
 * Imprime un archivo gestionado por url en la impresora
 * @author isi-template
 * @param host
 * @param urlFile
 * @param namePrinter
 */
export const apiImprimirUrl = async (host: string, urlFile: string, namePrinter: string): Promise<void> => {
  try {
    await axios.post(
      `${host}/printPDF`,
      {
        pdf_url: urlFile,
        printer: namePrinter,
      },
      { headers: localHeaders },
    )
  } catch (e: any) {
    throw new Error(`Se produjo un error durante la impresión del archivo. ${e.message}`)
  }
}
