<template>
    <tr :style="{ backgroundColor: getTaskColor(task.status) }" class="module-row">
      <td>
        <q-btn class="edit-btn-cell" dense flat icon="edit" @click="editTask(task)" />
        {{ task.name }}
      </td>
      <td>{{ task.description }}</td>
      <td>{{ task.executor_fullname }}</td>
      <td>{{ getTaskStatusName(task.status) }}</td>
    </tr>
  </template>
  
  <script setup> 
  const props = defineProps({
  task: Object,
  getTaskColor: Function,
  getTaskStatusName: Function,
  editTask: Function
});
  </script>
  