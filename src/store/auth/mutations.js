import { LocalStorage } from 'quasar'

export function setAuth (state, auth) {
  let akey = auth.akey
  let token = auth.token

  LocalStorage.set('akey', akey)
  LocalStorage.set('token', token)
  state.akey = akey
  state.token = token
}
