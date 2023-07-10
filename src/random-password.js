import { randomPassword } from 'secure-random-password'
import * as sets from 'secure-random-password/lib/character-sets.js'

function generatePassword (length = 6) {
  return randomPassword({
    length,
    characters: [sets.lower, sets.upper, sets.digits]
  })
}

export {
  generatePassword
}
