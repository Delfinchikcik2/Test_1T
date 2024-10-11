import { useUserStore } from 'src/stores/user-info';
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'), meta: {requaresAuth: true},
    children: [
      { path: '/', name: 'index', component: () => import('pages/IndexPage.vue') },
      { path: '/groupPage/:id', name: 'groupPage', component: () => import('pages/PageWithTable.vue') },
      { path: '/page/:id', name: 'page', component: () => import('src/pages/PageType.vue')},
      { path: '/taskspage/:id', name: 'taskspage', component: () => import('src/pages/TasksPage.vue')},
      { path: '/molule/:id', name: 'module', component: () => import('src/pages/taskFor.vue')},



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
