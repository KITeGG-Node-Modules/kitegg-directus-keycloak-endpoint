import isEmail from 'validator/lib/isEmail.js'
import isAlpha from 'validator/lib/isAlpha.js'
import isAlphanumeric from 'validator/lib/isAlphanumeric.js'

const enumAssociation = ['hsm', 'hst', 'hfgg', 'hfgo', 'kisd']
const enumType = ['staff', 'student', 'management']
const profilePattern = /^gpu-/

const userSchema = {
  id: { protected: true },
  email: { validator: isEmail, require: true },
  username: { validator: isAlphanumeric, require: true },
  firstName: { validator: isAlpha, require: true },
  lastName: { validator: isAlpha, require: true },
  association: {
    validator: value => enumAssociation.includes(value),
    require: true
  },
  type: {
    validator: value => enumType.includes(value),
    require: true
  },
  enabled: {
    validator: value => typeof value === 'boolean',
    default: () => true
  },
  profiles: {
    validator: value => Array.isArray(value) && value.reduce((isValid, profileName) => {
      if (isValid) isValid = profilePattern.test(profileName)
      return isValid
    }, true)
  }
}

function validateUser (data, method) {
  if (!data) throw new Error('no_data')

  for (const prop in data) {
    if (!userSchema[prop] || userSchema[prop].protected) delete data[prop]
  }

  const errors = []
  for (const prop in userSchema) {
    if (typeof data[prop] === 'undefined' && userSchema[prop].default) {
      data[prop] = userSchema[prop].default()
    }
    const isRequired = userSchema[prop].require && method === 'post'
    if (isRequired && !data[prop]) {
      errors.push(`${prop}_missing`)
    }
    if (data[prop] && !userSchema[prop].validator(data[prop])) {
      errors.push(`${prop}_invalid`)
    }
  }
  if (errors.length) throw new Error(errors.join(','))
}

export {
  enumType,
  enumAssociation,
  profilePattern,
  validateUser
}
