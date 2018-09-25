import axios from 'axios'

export default ({ Vue }) => {
  axios.defaults.baseURL = 'https://evnotify.de:8000/'
  Vue.prototype.$http = axios
}
