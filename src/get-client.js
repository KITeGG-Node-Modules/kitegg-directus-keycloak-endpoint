import axios from 'axios'
import querystring from 'querystring'

let _client, _authData

const {
  KEYCLOAK_ISSUER_URL,
  KEYCLOAK_ADMIN_URL,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_CLIENT_SECRET,
  KEYCLOAK_USERNAME,
  KEYCLOAK_PASSWORD
} = process.env

function isConfigured () {
  return !!KEYCLOAK_ISSUER_URL
}

async function getClient () {
  if (_client) {
    if (_authData) {
      if (_authData.accessTokenExpiresAt > Date.now()) return _client
      else if (_authData.refreshTokenExpiresAt > Date.now()) {
        // TODO: Refresh token
      }
    }
  }
  try {
    if (!KEYCLOAK_ISSUER_URL) return null

    const {data: issuer} = await axios.get(KEYCLOAK_ISSUER_URL)
    const params = querystring.stringify({
      grant_type: 'password',
      client_id: KEYCLOAK_CLIENT_ID,
      client_secret: KEYCLOAK_CLIENT_SECRET,
      username: KEYCLOAK_USERNAME,
      password: KEYCLOAK_PASSWORD
    })

    const {data: _authData} = await axios.post(issuer.token_endpoint, params)
    _authData.accessTokenExpiresAt = Date.now() + _authData.expires_in * 1000
    _authData.refreshTokenExpiresAt = Date.now() + _authData.refresh_expires_in * 1000

    return _client = axios.create({
      baseURL: KEYCLOAK_ADMIN_URL,
      headers: {
        Authorization: `Bearer ${_authData.access_token}`
      }
    })
  } catch (e) {
    console.error('Failed to init Keycloak:', e.message)
  }
}

export {
  getClient
}
