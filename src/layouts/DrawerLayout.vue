<template>
 <q-drawer v-model="leftDrawerOpen" side="left" bordered>
      <drawer-page-list class="q-mt-xl"></drawer-page-list>
    </q-drawer>
</template>

<script setup>
import { ref, defineEmits, defineProps, watch } from 'vue'
import DrawerPageList from 'src/components/DrawerPageList.vue';

const emit = defineEmits(['toggle']);
const props = defineProps(['leftDrawerOpen']);
const leftDrawerOpen = ref(props.leftDrawerOpen);

watch(() => props.leftDrawerOpen, (newValue) => {
  leftDrawerOpen.value = newValue;
});

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
  emit('toggle', leftDrawerOpen.value); 
}

</script>