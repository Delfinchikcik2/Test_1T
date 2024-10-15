<template>
    <q-page>
      <table class="styled-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Ответственный</th>
            <th>Дата начала</th>
            <th>Дата окончания</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="loading">Загрузка...</td>
          </tr>
          <tr v-else-if="error">
            <td colspan="5" class="error">Ошибка загрузки данных: {{ error.message }}</td>
          </tr>
          <tr v-for="module in modules" :key="module.id">
            <td>
              <q-btn dense flat icon="edit" @click="editModule(module)" />
              {{ module.name }}
            </td>
            <td>{{ module.fullname }}</td>
            <td>{{ module.start_date }}</td>
            <td>{{ module.end_date }}</td>
            <td>
              <ModuleStatus :statusCount="module.statusCount" />
            </td>
          </tr>
        </tbody>
      </table>
  
      <q-btn label="Создать модуль" color="secondary" @click="addNewModuleRow" />
    </q-page>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useQuery } from '@vue/apollo-composable';
  import { PAGINATE_MODULE } from 'src/querys/moduleQuery';
  import ModuleStatus from './ModuleStatus.vue';
  
  const { result, loading, error } = useQuery(PAGINATE_MODULE);
  const modules = ref([]);
  
  watch(result, (value) => {
    if (value) {
      modules.value = value.paginate_type1.data;
    }
  });
  
  const editModule = (module) => {
  };
  </script>
  