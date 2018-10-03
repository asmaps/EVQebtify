
const routes = [
  {
    path: '/',
    component: () => import('layouts/MyLayout.vue'),
    children: [
      { name: 'dashboard', path: '', component: () => import('pages/Dashboard.vue') },
      { name: 'login', path: 'login', component: () => import('pages/auth/Login.vue') },
      {
        name: 'station-list',
        path: 'stations',
        component: () => import('pages/StationList.vue'),
        children: [
          { name: 'station-detail', path: ':stationId', component: () => import('components/StationDetail.vue') },
        ]
      },
      {
        name: 'log-list',
        path: 'logs',
        component: () => import('pages/LogList.vue'),
        children: [
          { name: 'log-detail', path: ':logId', component: () => import('components/LogDetail.vue') },
        ]
      },
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
