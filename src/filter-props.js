const publicUserProps = [
  'id',
  'username',
  'email',
  'firstName',
  'lastName',
  'association',
  'type',
  'profiles',
  'temporaryPassword',
  'enabled'
]

function filterUser (data) {
  for (const key in data) {
    if (!publicUserProps.includes(key)) delete data[key]
  }
  return data
}

export {
  filterUser
}
