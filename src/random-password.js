import { randomPassword } from 'secure-random-password'
import * as sets from 'secure-random-password/lib/character-sets.js'
import { OTP_LENGTH } from './constants.js'

function generatePassword () {
  return randomPassword({
    length: OTP_LENGTH,
    characters: [sets.lower, sets.upper, sets.digits]
  })
}

export {
  generatePassword
}
