import { TYPES } from './constants.js'

async function isRequestAllowed (ctx) {
  const {client, req, userGroups} = ctx
  let subjectTypeGroup, subjectGroups
  if (req.params.id) ({data: subjectGroups} = await client.get(`/users/${req.params.id}/groups`))

  if (req.method === 'POST') {
    subjectTypeGroup = {name: req.body.type}
  } else if (req.method === 'PATCH') {
    if (req.body.type) subjectTypeGroup = {name: req.body.type}
    else subjectTypeGroup = subjectGroups.find(group => TYPES.includes(group.name))
  } else {
    subjectTypeGroup = subjectGroups.find(group => TYPES.includes(group.name))
  }

  const userType = userGroups.find(group => TYPES.includes(group.name))
  const userTypeIndex = TYPES.indexOf(userType ? userType.name : 'admin')
  const subjectTypeIndex = TYPES.indexOf(subjectTypeGroup.name)

  if (userTypeIndex < subjectTypeIndex) throw new Error('forbidden')
}

export {
  isRequestAllowed
}
