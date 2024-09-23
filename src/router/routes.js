import { useUserStore } from 'src/stores/user-info';
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/auth' },  
      { path: 'auth', component: () => import('pages/AuthPage.vue') },  
      {
        path: 'index',
        component: () => import('pages/IndexPage.vue'),
        beforeEnter: (to, from, next) => {
          if (useUserStore().getToken()) {
            next();  
          } else {
            next('/auth');  
          }
        }
      }
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes;
