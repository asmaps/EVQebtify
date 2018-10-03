import { LocalStorage } from 'quasar'

export default {
  akey: LocalStorage.get.item('akey'),
  token: LocalStorage.get.item('token'),
}
