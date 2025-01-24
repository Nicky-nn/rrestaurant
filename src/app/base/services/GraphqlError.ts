const validateGraphQlError = (e: Error): any => {
  try {
    const parsed = JSON.parse(JSON.stringify(e, undefined, 2))
    if (parsed.response.status === 404) {
      return {
        status: 404,
        message: 'Error conexión con el servidor',
        originalMessage: 'Error conexión con el servidor',
        stacktrace: `<pre></pre>`,
        type: 'BAD_REQUEST',
        path: 'fontEnd',
      }
    }

    return {
      status: parsed.response?.errors[0]?.extensions?.status || 400,
      message: parsed.response?.errors[0]?.message || 'Error no definido',
      originalMessage: parsed.response?.errors[0]?.extensions?.originalMessage || '',
      stacktrace: `<code>${
        parsed.response?.errors[0]?.extensions?.stacktrace?.join('') || ''
      }</code>`,
      type: parsed.response?.errors[0]?.extensions?.code || 'BAD_REQUEST',
      path: parsed.response?.errors[0]?.path.join('<br />') || '',
    }
  } catch (e: any) {
    return {
      status: 400,
      message: 'Error no definido',
      originalMessage: e.message,
      stacktrace: `<pre></pre>`,
      type: 'BAD_REQUEST',
      path: 'frontEnd',
    }
  }
}

/**
 * @description Custom del error de servidor, para mostrar errores de graphql
 */
export class MyGraphQlError extends Error {
  constructor(e: Error) {
    const errors = validateGraphQlError(e)
    super(errors.message) // (1)
    console.log(import.meta.env.DEV, 'env')
    this.name = `${errors.status} ${errors.type} (${errors.path})` // (2)
    this.stack = import.meta.env.DEV ? errors.stacktrace : ''
    this.cause = import.meta.env.DEV ? errors.originalMessage : ''
  }
}
