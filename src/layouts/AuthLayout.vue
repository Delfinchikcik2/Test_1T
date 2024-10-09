<template>
      <q-layout view="hHh lpR fFf">

        <header-layout></header-layout>

    <q-page-container>
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
import HeaderLayout from 'src/layouts/HeaderLayout.vue';
import FooterLayout from 'src/layouts/FooterLayout.vue';

</script>