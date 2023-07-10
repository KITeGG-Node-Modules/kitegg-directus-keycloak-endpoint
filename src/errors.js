import { createError } from '@directus/errors'

const ServiceUnconfiguredError = createError(
  'KEYCLOAK_UNCONFIGURED',
  'Keycloak is not initialised',
  400
)

function keycloakErrorFactory (error) {
  const { status, data } = error.response
  return createError(
    `KEYCLOAK_ERROR_${status}`,
    data?.errorMessage || error.message,
    status
  )
}

const InternalError = createError(
  'INTERNAL_ERROR',
  'Internal error',
  500
)

const BadRequest = createError(
  'BAD_REQUEST',
  'Bad request',
  400
)

export {
  BadRequest,
  ServiceUnconfiguredError,
  InternalError,
  keycloakErrorFactory
}
