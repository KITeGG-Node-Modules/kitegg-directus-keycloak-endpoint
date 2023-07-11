# KITeGG Directus Keycloak Endpoint

> User management from within Directus

## API

Endpoint access is restricted to either Directus `admin` users or Keycloak `management` group members.

### Find users

```
GET /keycloak/users
```

You can pass query params as described
[in the Keycloak docs under Users / GET](https://www.keycloak.org/docs-api/18.0/rest-api/#_users_resource).

### Create user

Users can only be created by `staff` or `management` group members.

Creating a user sets `enabled` to `true` by default.

The result contains a one-time password to be used for the first login.

The request will also create a directus user linked to the Keycloak Account,
unless `skipDirectusUser: true` is passed in the request body.

``` 
POST /keycloak/users
```

Body (mandatory fields):

```json
{
  "username": "asdf",
  "firstname": "Test",
  "lastname": "User",
  "email": "test@example.asdf",
  "association": "hsm",
  "type": "student"
}
```

Optional additional props:
```json
{
  "enabled": false,
  "skipDirectusUser": true,
  "profiles": [
    "gpu-s",
    "gpu-m",
    "gpu-l"
  ]
}
```

Possible values for `association`:

- `hsm`: HS Mainz
- `hfgo`: HFG Offenbach
- `hst`: HS Trier
- `hfgg`: HFG Gmünd
- `kisd`: KISD

Possible values for `type`:

- `staff`
- `student`
- `management`

Possible values for `profiles`:

- `gpu-s`
- `gpu-m`
- `gpu-l`
- `gpu-xl`

### Get user

This includes associations, type and profiles,
as opposed to the `find` results.

```
GET /keycloak/users/<ID>
```

### Update user

```
PATCH /keycloak/users/<ID>
```

Body (e.g.):
```json
{ "enabled": false }
```

**Note:** Setting `profiles` replaces the existing array value.

### Reset password

Resetting the password will return a new one-time password.

```
POST /keycloak/users/<ID>/password
```

### Remove user

```
DELETE /keycloak/users/<ID>
```

**Note:** Deleting users is currently disabled and will throw a `MethodNotAllowedError`.
Please use `{ "enabled": false }` with `PATCH` to block a user instead. 

## Groups

### Associations

Get available association values.

```
GET /keycloak/associations
```

### Types

Get available type values.

```
GET /keycloak/types
```

### Profiles

Get available profile values.

```
GET /keycloak/profiles
```
