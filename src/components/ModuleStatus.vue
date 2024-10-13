<template>
    <div>
      Назначено задач: {{ statusCount.assigned }}<br>
      Выполнено задач: {{ statusCount.completed }}<br>
      Завершено задач: {{ statusCount.closed }}
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    statusCount: {
      type: Object,
      required: true
    }
  });
  </script>
  