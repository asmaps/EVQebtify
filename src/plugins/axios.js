import axios from 'axios'

export default ({ Vue, store }) => {
  // if (process.env.DEV) {
  //   axios.defaults.baseURL = 'http://localhost:8000/'
  // } else {
  //   axios.defaults.baseURL = 'https://v2.evnotify.de:8000/'
  // }
  axios.defaults.baseURL = 'https://v2.evnotify.de:8000/'
  axios.interceptors.request.use(config => {
    config.params = config.params || {}
    let target = config.params

    if (['put', 'post', 'patch'].indexOf(config.method) !== -1) {
      config.data = config.data || {}
      target = config.data
    }

    if (!target.akey) {
      target.akey = store.state.auth.akey
    }
    if (!target.token) {
      target.token = store.state.auth.token
    }

    return config
  })
  Vue.prototype.$http = axios
}
