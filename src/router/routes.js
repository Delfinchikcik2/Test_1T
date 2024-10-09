import { useUserStore } from 'src/stores/user-info';
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'), meta: {requaresAuth: true},
    children: [
      { path: '/groupPage/:id', name: 'groupPage', component: () => import('pages/PageWithTable.vue') },
      { path: '/page/:id', name: 'page', component: () => import('src/pages/PageType.vue')},

    ]
  },
  {
    path: '/',
    component: () => import('layouts/AuthLayout.vue'),
    children:[
      { path: '/auth', component: () => import('pages/AuthPage.vue') },  

    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes;
