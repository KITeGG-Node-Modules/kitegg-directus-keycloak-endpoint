import { getClient } from './get-client.js'

function baseRequestHandler (requestFunction, context) {
  const {services} = context
  return async function (req, res, next) {
    if (!req.accountability?.user) {
      console.log('Keycloak: Anonymous rejected')
      res.status(401)
      return res.send({message: 'api_errors.unauthorized'})
    }
    const {UsersService} = services
    const usersService = new UsersService({schema: req.schema, accountability: req.accountability})
    let user
    try {
      user = await usersService.readOne(req.accountability.user)
    } catch (err) {
      console.error('Keycloak: Failed to get current user', req.accountability.user, err.message)
    }
    const client = await getClient()
    if (client) {
      try {
        let userGroups = [], isAllowed = false
        if (user?.external_identifier) {
          console.log('Keycloak: Fetch external user id', user.external_identifier);
          ({data: userGroups} = await client.get(`/users/${user?.external_identifier}/groups`))
          isAllowed = !!userGroups.find(group => ['staff', 'management'].includes(group.name))
          if (!isAllowed && user.external_identifier === req.params.id) {
            const propWhitelist = ['firstName', 'lastName', 'email']
            if (req.data) {
              for (const key in req.data) {
                if (!propWhitelist.includes(key)) delete req.data[key]
              }
            }
            isAllowed = true
          }
        }
        if (req.accountability.admin) {
          console.log('Keycloak: Admin user')
          isAllowed = true
        }
        if (!isAllowed) {
          res.status(403)
          return res.send({message: 'api_errors.forbidden'})
        }

        const result = await requestFunction({req, res, next, client, user, userGroups})
        if (result) return res.send(result)
      } catch (err) {
        if (err.response) {
          res.status(err.response.status)
          return res.send(err.response.data)
        }
        next(err)
      }
    } else {
      res.status(503)
      return res.send({message: 'api_errors.service_unavailable'})
    }
  }
}

export {
  baseRequestHandler
}
