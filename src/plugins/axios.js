import axios from 'axios'

export default ({ Vue }) => {
  if (process.env.DEV) {
    axios.defaults.baseURL = 'http://localhost:8000/'
  } else {
    axios.defaults.baseURL = 'https://evnotify.de:8000/'
  }
  Vue.prototype.$http = axios
}
