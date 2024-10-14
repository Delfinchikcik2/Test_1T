<template>
  <div>
    Назначено задач: {{ statusCount.assigned }}<br>
    Выполнено задач: {{ statusCount.completed }}<br>
    Завершено задач: {{ statusCount.closed }}
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  tasks: Array,
  statusOptions: Array
});

const getStatusById = (statusId) => {
  return props.statusOptions.find(status => status.id === statusId) || { label: "Неизвестен", color: "gray" };
};

const statusCount = computed(() => {
  const counts = {
    assigned: 0,
    completed: 0,
    closed: 0
  };

  props.tasks.map(task => {
    const status = getStatusById(task?.object?.task_status);
    if (status.label === 'Назначена') {
      counts.assigned++;
    } else if (status.label === 'Выполнена') {
      counts.completed++;
    } else if (status.label === 'Завершена') {
      counts.closed++;
    }
  });

  return counts;
});
</script>
