<template>
        <q-header elevated class="bg-primary text-white">
      <q-toolbar>
          <slot name="spaces"></slot>
          <slot name="burger"></slot>
        <q-toolbar-title>
          <q-avatar>
            <img src="https://yt3.googleusercontent.com/Vn1EENENDhTzy_yoJ7F9ia5brHIche2oxj35-81i7Q1wv1Iq9_UvX5xR1xaIBBUXYu-WsuwtRw=s900-c-k-c0x00ffffff-no-rj">
          </q-avatar>
          Druid test API
        </q-toolbar-title>
        <slot name="logout"></slot>
      </q-toolbar>
    </q-header>
  </template>
<script setup>
</script>