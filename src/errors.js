import { createError } from '@directus/errors'

const ServiceUnconfiguredError = createError(
  'KEYCLOAK_UNCONFIGURED',
  'Keycloak is not initialised',
  400
)

const KeycloakError = createError(
  'KEYCLOAK_ERROR',
  'Keycloak error',
  500
)

const InternalError = createError(
  'INTERNAL_ERROR',
  'Internal error',
  500
)

export {
  ServiceUnconfiguredError,
  KeycloakError,
  InternalError
}
