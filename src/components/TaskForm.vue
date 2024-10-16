<template>
    <tr>
      <td>
        <q-input v-model="localTask.name" label="Название" :disable="isDisabled" />
      </td>
      <td>
        <q-input v-model="localTask.description" label="Описание" type="text" :disable="isDisabled" />
      </td>
      <td>
        <q-select v-model="localTask.executor_id" :options="executorOptions" option-value="id"
                  option-label="fullname" label="Исполнитель" :disable="isDisabled" />
      </td>
      <td>
        <q-select v-model="localTask.default_status" :options="filteredStatusOptions"
                  option-value="id" option-label="label" label="Статус" :disable="isDisabled" />
      </td>
    </tr>
  </template>
  
  <script setup>
  import { computed, toRefs } from 'vue';
  
  const props = defineProps({
    newTask: Object,
    executorOptions: Array,
    filteredStatusOptions: Array,
    isDisabled: Boolean
  });
  
  const localTask = computed(() => {
    return { ...props.newTask };
  });
  
  const { newTask, executorOptions, filteredStatusOptions, isDisabled } = toRefs(props);
  </script>
  