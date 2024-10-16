<template>
  <tr>
    <td>
      <q-input v-model="localTask.name" label="Название" :disable='isInputDisable' @input="updateTask" />
    </td>
    <td>
      <q-input v-model="localTask.description" label="Описание" :disable='isInputDisable' type="text" @input="updateTask" />
    </td>
    <td>
      <q-select v-model="localTask.executor_id" :options="executorOptions" option-value="id"
                option-label="fullname" label="Исполнитель" :disable='isInputDisable' @update:model-value="updateTask" />
    </td>
    <td>
      <q-select v-if="!saveBtn" v-model="localTask.default_status" :options="filteredStatusOptions"
                option-value="id" option-label="label" label="Статус" :disable="isDisabled" @update:model-value="updateTask" />
      <q-input v-if="saveBtn" v-model="localTask.default_status" label="Статус" type="text" disable />
    </td>
  </tr>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  newTask: Object,
  executorOptions: Array,
  filteredStatusOptions: Array,
  isDisabled: Boolean,
  saveBtn: Boolean,
  isInputDisable: Boolean
});

const emit = defineEmits(['update:newTask']);

const localTask = ref({ ...props.newTask });

watch(() => props.newTask, (newVal) => {
  localTask.value = { ...newVal };
});

const updateTask = () => {
  emit('update:newTask', localTask.value);
};
</script>
