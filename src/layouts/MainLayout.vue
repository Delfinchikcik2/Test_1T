<template>
  <q-layout view="hHh lpR fFf" class="mainLayout">
    <q-header>
      <header-layout>
        <template #spaces>
          <SpacesSwitch></SpacesSwitch>
        </template>
        <template #burger>
          <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        </template>
        <template #logout>
          <q-btn dense flat round icon="logout" @click="logOut"/>
        </template>
      </header-layout>
    </q-header>


      <drawer-layout :left-drawer-open="drawState" @toggle="handlerToggl"
      ></drawer-layout>



    <q-page-container class="pageConteiner">
      <keep-alive>
        <router-view />
      </keep-alive>
    </q-page-container>

    <q-footer>
      <footer-layout></footer-layout>
    </q-footer>

  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from 'src/stores/user-info';
import HeaderLayout from 'src/layouts/HeaderLayout.vue'
import FooterLayout from 'src/layouts/FooterLayout.vue';
import DrawerLayout from './DrawerLayout.vue';
import SpacesSwitch from 'src/components/SpacesSwitch.vue';

const drawState = ref(false);
const router = useRouter();
const {clearUserData} = useUserStore()

const logOut = ()=>{
  router.push('/auth')
  clearUserData();
}

const handlerToggl = (state) =>{
  drawState.value = state;
}

const toggleLeftDrawer = () => {
  drawState.value = !drawState.value;
  }

</script>
<style>
.mainLayout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.pageConteiner {
  flex: 1; 
  padding: 20px;
  margin: 60px 0;
}
</style>