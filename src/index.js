import { basename } from 'path'
import * as password from 'secure-random-password'
import { baseRequestHandler } from './base-request-handler.js'
import { enumType, enumAssociation, profilePattern, validateUser } from './validations.js'
import { filterUser } from './filter-props.js'

const OTP_LENGTH = 6

export default {
  id: 'keycloak',
  handler: (router, context) => {
    //
    // Users
    //

    //
    // FIND
    router.get('/users', baseRequestHandler(async ctx => {
      const { data: users } = await ctx.client.get('/users', { params: ctx.req.query })
      return users.map(user => filterUser(user))
    }, context))

    //
    // POST
    router.post('/users', baseRequestHandler(async ctx => {
      const data = ctx.req.body
      try {
        validateUser(data, 'post')
      }
      catch (err) {
        ctx.res.status(400)
        return ctx.res.send({
          message: 'api_errors.validation_failed',
          errorMessage: err.message
        })
      }

      const associationName = data.association
      delete data.association
      const typeName = data.type
      delete data.type
      data.enabled = true

      const { data: groups } = await ctx.client.get('/groups')

      let profiles = []
      if (Array.isArray(data.profiles)) {
        profiles = groups.filter(group => profilePattern.test(group.name) && data.profiles.includes(group.name))
        delete data.profiles
      }

      const response = await ctx.client.post('/users', data)
      const location = new URL(response.headers.location)
      const userId = basename(location.pathname)

      const association = groups.find(group => group.name === associationName)
      if (association) await ctx.client.put(`/users/${userId}/groups/${association.id}`)
      const type = groups.find(group => group.name === typeName)
      if (type) await ctx.client.put(`/users/${userId}/groups/${type.id}`)

      for (const profile of profiles) {
        await ctx.client.put(`/users/${userId}/groups/${profile.id}`)
      }

      const pwd = password.randomPassword({
        length: OTP_LENGTH,
        characters: [password.lower, password.upper, password.digits]
      })
      await ctx.client.put(`/users/${userId}/reset-password`, {
        value: pwd,
        temporary: true
      })

      return Object.assign({
        id: userId,
        temporaryPassword: pwd
      }, data)
    }, context))

    //
    // GET
    router.get('/users/:id', baseRequestHandler(async ctx => {
      const { data: user } = await ctx.client.get(`/users/${ctx.req.params.id}`)
      const { data: groups } = await ctx.client.get(`/users/${ctx.req.params.id}/groups`)

      const association = groups.find(group => enumAssociation.includes(group.name))
      if (association) user.association = association.name
      const type = groups.find(group => enumType.includes(group.name))
      if (association) user.type = type.name

      user.profiles = groups.filter(group => group.name.indexOf('gpu-') === 0).map(group => group.name)

      return filterUser(user)
    }, context))

    //
    // PATCH
    router.patch('/users/:id', baseRequestHandler(async ctx => {
      const { client, req } = ctx
      const data = req.body
      try {
        validateUser(data, 'patch')
      }
      catch (err) {
        ctx.res.status(400)
        return ctx.res.send({
          message: 'api_errors.validation_failed',
          errorMessage: err.message
        })
      }
      const { data: groups } = await client.get(`/groups`)
      const { data: userGroups } = await client.get(`/users/${req.params.id}/groups`)
      if (data.association) {
        const existingAssociation = userGroups.find(group => enumAssociation.includes(group.name))
        const association = groups.find(group => group.name === data.association)
        if (data.association !== existingAssociation?.name) {
          if (existingAssociation) {
            await client.delete(`/users/${req.params.id}/groups/${existingAssociation.id}`)
          }
          await client.put(`/users/${req.params.id}/groups/${association.id}`)
        }
        delete data.association
      }
      if (data.type) {
        const existingType = userGroups.find(group => enumType.includes(group.name))
        const type = groups.find(group => group.name === data.type)
        if (data.type !== existingType?.name) {
          if (existingType) {
            await client.delete(`/users/${req.params.id}/groups/${existingType.id}`)
          }
          await client.put(`/users/${req.params.id}/groups/${type.id}`)
        }
        delete data.type
      }
      if (data.profiles) {
        const existingProfiles = userGroups.filter(group => profilePattern.test(group.name))
        for (const profileName of data.profiles) {
          if (!existingProfiles.find(p => p.name === profileName)) {
            const profile = groups.find(group => group.name === profileName)
            await client.put(`/users/${req.params.id}/groups/${profile.id}`)
          }
        }
        for (const profile of existingProfiles) {
          if (!data.profiles.find(profileName => profileName === profile.name)) {
            await client.delete(`/users/${req.params.id}/groups/${profile.id}`)
          }
        }
        delete data.profiles
      }
      const { data: result } = await client.put(`/users/${req.params.id}`, data)
      return result
    }, context))

    //
    // DELETE
    router.delete('/users/:id', (req, res) => {
      res.status(405)
      res.send({ message: 'api_errors.method_not_allowed' })
    })

    //
    // Reset password
    router.post('/users/:id/password', baseRequestHandler(async ctx => {
      const temporaryPassword = password.randomPassword({
        length: OTP_LENGTH,
        characters: [password.lower, password.upper, password.digits]
      })
      await ctx.client.put(`/users/${ctx.req.params.id}/reset-password`, {
        value: temporaryPassword,
        temporary: true
      })
      return {
        temporaryPassword
      }
    }, context))

    //
    // Associations
    router.get('/associations', baseRequestHandler(async ctx => {
      const { data } = await ctx.client.get('/groups')
      return data.filter(group => enumAssociation.includes(group.name)).map(group => group.name)
    }, context))

    //
    // Types
    router.get('/types', baseRequestHandler(async ctx => {
      const { data } = await ctx.client.get('/groups')
      return data.filter(group => enumType.includes(group.name)).map(group => group.name)
    }, context))

    //
    // Profiles
    router.get('/profiles', baseRequestHandler(async ctx => {
      const { data } = await ctx.client.get('/groups')
      return data.filter(group => profilePattern.test(group.name)).map(group => group.name)
    }, context))
  }
}
