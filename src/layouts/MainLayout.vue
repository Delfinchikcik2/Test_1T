<template>
  <q-layout view="hHh lpR fFf">

    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn v-if="!isRouteAuth" dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar>
          Title
        </q-toolbar-title>
        <q-btn v-if="!isRouteAuth" dense flat round icon="logout" @click="logOut"/>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" bordered>
      <!-- drawer content -->
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar>
          <div>Тестовый интерфейс</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from 'src/stores/user-info';

const leftDrawerOpen =ref(false)
const route = useRoute();
const router = useRouter();
const isRouteAuth = computed(()=>route.path === '/auth')
const {clearUserData} = useUserStore()

const toggleLeftDrawer = ()=> {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }

const logOut = ()=>{
  router.push('/auth')
  clearUserData();
}
</script>