import { getClient } from './get-client.js'
import { ServiceUnconfiguredError, KeycloakError, InternalError } from './errors.js'

function baseRequestHandler (requestFunction, context) {
  const { exceptions, services } = context
  const { ForbiddenException } = exceptions
  const { ItemsService } = services
  return async function (req, res, next) {
    if (!req.accountability.user) return next(new ForbiddenException())
    const usersService = new ItemsService('directus_users', { schema: req.schema, accountability: req.accountability });
    const user = await usersService.readOne(req.accountability.user)
    const client = await getClient()
    if (client) {
      try {
        let userGroups = [], isAllowed = false
        if (user.external_identifier) {
          ({ data: userGroups } = await client.get(`/users/${user.external_identifier}/groups`))
          isAllowed = !!userGroups.find(group => group.name === 'management')
        }
        if (req.accountability.user.admin) isAllowed = true
        if (!isAllowed) return next(new ForbiddenException())

        const result = await requestFunction({ req, res, next, client, exceptions, user, userGroups })
        return res.send(result)
      }
      catch (err) {
        if (err.response) {
          return next(new KeycloakError({
            response: err.response.data,
            status: err.response.status,
            message: err.message
          }))
        }
        next(new InternalError({
          message: err.message
        }))
      }
    }
    else next(new ServiceUnconfiguredError())
  }
}

export {
  baseRequestHandler
}
